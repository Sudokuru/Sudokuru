import { TIMING_BATCHES } from "./data";
import type { PreparedPuzzle } from "./prepare";
import { initialFeatures } from "./features";
import { singleTrace } from "./singleTrace";
import { candidateSpecs, fitModel, predict } from "./models";
import { modelFamily, nestedCrossValidation, selectModel } from "./evaluation";
import { bootstrapRankDifference, metrics, pearson, spearman } from "./statistics";
import type { ConstantModel, LinearModel, FittedModel, ModelSpec, ModelFamily } from "./modelTypes";
import type {
  FeatureRow, TimedObservation, Cohort, ExperimentSpec, ExperimentResult,
  CorrelationRow, HeldoutPrediction, BatchEvaluation, HistoricalComparison, CoefficientRow,
} from "./experimentTypes";

/**
 * Turn validated puzzles into observations ready for research.
 * Extract both initial and trace heuristics once. Untimed puzzles remain in
 * featureRows for inspection and benchmarks, but never enter model fitting.
 * Personal times are training data; site averages are a separate transfer check.
 * Cohorts group timed observations by source, batch, and all sources combined.
 */
export function prepareResearch(prepared: readonly PreparedPuzzle[]) {
  const featureRows: FeatureRow[] = prepared.map(row => {
    const initial = initialFeatures(row.record.puzzle);
    const trace = singleTrace(initial.board, row.solution);
    return { ...row, features: { ...initial.features, ...trace.features }, trace };
  });
  const timed: TimedObservation[] = featureRows.flatMap(row => row.record.batch === undefined ? [] : [{
    id: row.record.id, batch: row.record.batch, seconds: row.record.seconds!, kind: TIMING_BATCHES[row.record.batch],
    features: row.features, historicalScores: row.historicalScores,
  }]);
  const personal = timed.filter(row => row.kind === "personal");
  const site = timed.filter(row => row.kind === "site-average");
  const cohorts = [
    { name: "personal", rows: personal }, { name: "site-average", rows: site },
    { name: "pooled", rows: timed },
    ...[...new Set(timed.map(row => row.batch))].map(batch => ({ name: `batch:${batch}`, rows: timed.filter(row => row.batch === batch) })),
  ];
  return { featureRows, timed, personal, site, cohorts };
}

/**
 * Describe how each heuristic or historical score varies with human solve time.
 * Report Pearson and Spearman against seconds and log-seconds for each cohort.
 * Missing historical values are excluded separately for each column, so n can
 * differ between columns. These are descriptive comparisons, not held-out model
 * scores or evidence that a heuristic causes difficulty.
 */
export function correlations(cohorts: readonly Cohort[]): CorrelationRow[] {
  return cohorts.flatMap(cohort => {
    const combined = cohort.rows.map(row => ({ seconds: row.seconds, features: { ...row.features, ...row.historicalScores } }));
    const keys = [...new Set(combined.flatMap(row => Object.keys(row.features)))];
    return keys.flatMap(feature => {
      const rows = combined.filter(row => Number.isFinite(row.features[feature]));
      const x = rows.map(row => row.features[feature]);
      return (["seconds", "logSeconds"] as const).map(target => {
        const y = rows.map(row => target === "seconds" ? row.seconds : Math.log(row.seconds));
        return { cohort: cohort.name, feature, target, n: rows.length, pearson: pearson(x, y), spearman: spearman(x, y) };
      });
    });
  });
}

/**
 * Undo input standardization so the reported formula uses original feature units.
 * For example, 10 + 4*(x-1)/2 becomes 8 + 2*x. Each weight is divided by its
 * training scale, and the centering adjustment is absorbed into the intercept.
 * Weights stay in spec.features order; the output still predicts LOG-seconds.
 * Constant models have no weights. This conversion does not refit anything.
 */
export function rawCoefficients(model: ConstantModel | LinearModel): { intercept: number; coefficients: number[] } {
  if (model.kind === "constant") return { intercept: model.intercept, coefficients: [] };
  const coefficients = model.coefficients.map((value, i) => value / model.scales[i]);
  const intercept = model.intercept - coefficients.reduce((sum, value, i) => sum + value * model.means[i], 0);
  return { intercept, coefficients };
}

/**
 * Score aligned actual seconds and predicted log-seconds, omitting null predictions.
 * Return evaluated/total counts so partial coverage cannot masquerade as a score
 * over the whole dataset. Partial results describe a different subset and are
 * not directly comparable to complete results. No predictions gives null scores.
 */
export function predictionSummary(seconds: readonly number[], predictions: readonly (number | null)[]) {
  if (seconds.length !== predictions.length) throw new Error("Predictions must align with observations.");
  const available = predictions.flatMap((prediction, i) =>
    prediction === null ? [] : [{ seconds: seconds[i], prediction }]);
  return {
    evaluated: available.length,
    total: seconds.length,
    scores: available.length ? metrics(available.map(row => row.seconds), available.map(row => row.prediction)) : null,
  };
}

/**
 * Hide one whole timing batch, choose and fit a model on the other batches,
 * then predict the hidden batch. This checks reliance on a particular source.
 * At least two training puzzles must remain for the inner leave-one-out selection.
 * That is a computational minimum, not enough data for a reliable conclusion.
 * Warn and return an unavailable diagnostic when the minimum is not met.
 */
function evaluateBatches(personal: readonly TimedObservation[], specs: readonly ModelSpec[]): BatchEvaluation[] {
  return [...new Set(personal.map(row => row.batch))].map(batch => {
    const training = personal.filter(row => row.batch !== batch);
    const test = personal.filter(row => row.batch === batch);
    if (training.length < 2) {
      const skipped = "Too little data for cross-validation: need at least two training puzzles after excluding this batch.";
      console.warn(`${batch}: ${skipped}`);
      return { batch, selected: null, scores: null, skipped };
    }
    const selected = selectModel(training, specs).winner;
    const model = fitModel(training, selected);
    if (!model) throw new Error("Batch winner could not be refitted.");
    return { batch, selected: selected.id, scores: metrics(test.map(row => row.seconds), test.map(row => predict(model, row.features))) };
  });
}

/**
 * Compare model predictions with historical difficulty scores on identical puzzles.
 * Personal predictions come from outer cross-validation; site predictions use the
 * final model trained on all personal timings. Pooled cohorts mix those two checks.
 * The paired bootstrap resamples fixed predictions, not model fitting/selection,
 * so its interval is descriptive rather than a full measure of generalization.
 * Warn and return an unavailable diagnostic with fewer than two eligible puzzles.
 */
function compareHistoricalScores(
  cohorts: readonly Cohort[],
  heldout: readonly HeldoutPrediction[],
  fitted: FittedModel,
): HistoricalComparison[] {
  const heldoutById = new Map(heldout.map(row => [row.id, row]));
  return cohorts.map(cohort => {
    const rows = cohort.rows.filter(row => Number.isFinite(row.historicalScores["legacy.combined"]));
    const evaluation = cohort.name === "pooled" ? "personal OOF + site transfer" : "personal OOF or site transfer";
    if (rows.length < 2) {
      const skipped = "Too little data for historical-score analysis: need at least two eligible puzzles.";
      console.warn(`${cohort.name}: ${skipped}`);
      return { cohort: cohort.name, evaluation, model: null,
        legacy: { n: rows.length, spearman: null, pearson: null }, pairedBootstrap: null, skipped };
    }
    const predictions = rows.map(row => row.kind === "personal" ?
      heldoutById.get(row.id)!.logPrediction : predict(fitted, row.features));
    const seconds = rows.map(row => row.seconds);
    const legacy = rows.map(row => row.historicalScores["legacy.combined"]);
    return { cohort: cohort.name, evaluation,
      model: metrics(seconds, predictions), legacy: { n: rows.length, spearman: spearman(seconds, legacy), pearson: pearson(seconds, legacy) },
      pairedBootstrap: bootstrapRankDifference(seconds, predictions, legacy) };
  });
}

/**
 * Run the complete research experiment for one allowed set of heuristics.
 *
 * First, hide each personal puzzle in turn and choose/train a model without it.
 * Those held-out predictions test our WAY OF CHOOSING models, not one fixed model.
 * Separately, choose and fit a final model using all personal puzzles. That model
 * is for future predictions and the site-average transfer check; its training
 * scores only describe how well it fits data it has already seen.
 *
 * Also report each model family's coverage and scores, raw formula coefficients,
 * and historical-score comparisons. batchSensitivity retrains with a whole batch
 * excluded; perPersonalBatch merely groups the ordinary held-out predictions by
 * batch and does not retrain anything. These answer different questions.
 *
 * Inputs must be validated, unique puzzle observations, with personal/site groups
 * correctly separated and cohorts referring to those observations. Fewer than
 * three personal puzzles cannot support both cross-validation levels: warn and
 * return null. Three is only the computational minimum, not a reliability claim.
 */
export function runExperiment(
  experiment: ExperimentSpec,
  personal: readonly TimedObservation[],
  site: readonly TimedObservation[],
  cohorts: readonly Cohort[],
): ExperimentResult | null {
  if (personal.length < 3) {
    console.warn(`${experiment.name}: Too little data for nested cross-validation: need at least three personal puzzles.`);
    return null;
  }
  const specs = candidateSpecs(experiment.features);
  const heldout = nestedCrossValidation(personal, specs);
  const finalSelection = selectModel(personal, specs);
  // Only full-personal fits are cached; cross-validation fits must remain isolated.
  const fullFits = new Map<ModelSpec, FittedModel | null>();
  /** Reuse one full-data fit per recipe; never share fits with held-out evaluations. */
  function fullFit(spec: ModelSpec) {
    if (!fullFits.has(spec)) fullFits.set(spec, fitModel(personal, spec));
    return fullFits.get(spec) ?? null;
  }
  const fitted = fullFit(finalSelection.winner);
  if (!fitted) throw new Error("Final winner could not be refitted.");
  const seconds = personal.map(row => row.seconds);
  const heldoutPredictions = heldout.map(row => row.logPrediction);
  const families: ("selected" | ModelFamily)[] = ["selected", ...new Set(specs.map(modelFamily))];
  const summaries = families.map(family => {
    const predictions = heldout.map(row => family === "selected" ? row.logPrediction :
      row.families.find(entry => entry.family === family)?.logPrediction ?? null);
    const coverage = predictionSummary(seconds, predictions);
    const best = family === "selected" ? finalSelection.winner :
      finalSelection.candidates.find(candidate => modelFamily(candidate.spec) === family)?.spec;
    const model = best ? fullFit(best) : null;
    return {
      family,
      evaluated: coverage.evaluated,
      total: coverage.total,
      heldout: coverage.scores,
      training: model ? metrics(seconds, personal.map(row => predict(model, row.features))) : null,
      finalModel: model,
    };
  });
  const coefficients: CoefficientRow[] = finalSelection.candidates.flatMap(candidate => {
    if (candidate.spec.kind === "tree") return [];
    const model = fullFit(candidate.spec);
    if (!model || model.kind === "tree") return [];
    const raw = rawCoefficients(model);
    return [{
      experiment: experiment.name, model: candidate.spec.id, target: model.target,
      intercept: raw.intercept,
      innerCvSpearman: candidate.scores.spearman, innerCvLogRmse: candidate.scores.logRmse,
      ...Object.fromEntries(model.spec.features.map((feature, i) => [`coefficient.${feature}`, raw.coefficients[i]])),
    }];
  });
  const batchSensitivity = evaluateBatches(personal, specs);
  const comparisons = compareHistoricalScores(cohorts, heldout, fitted);
  // Group existing outer predictions, unlike evaluateBatches which retrains models.
  const perPersonalBatch = [...new Set(personal.map(row => row.batch))].map(batch => {
    const rows = heldout.filter(row => row.batch === batch);
    return { batch, scores: metrics(rows.map(row => row.seconds), rows.map(row => row.logPrediction)) };
  });
  return { name: experiment.name, includeTrace: experiment.includeTrace, candidateCount: specs.length, heldout, summaries, batchSensitivity,
    finalSelection, fitted, comparisons, coefficients,
    sitePredictions: site.map(row => ({ id: row.id, batch: row.batch, seconds: row.seconds, logPrediction: predict(fitted, row.features) })),
    perPersonalBatch,
    heldoutScores: metrics(personal.map(row => row.seconds), heldoutPredictions),
  };
}
