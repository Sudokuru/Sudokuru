import type { Observation, ModelSpec, ModelFamily, CandidateResult } from "./modelTypes";
import type { Features } from "./features";
import { fitModel, predict } from "./models";
import { metrics } from "./statistics";

/** Group constants, trees, and formulas using one, two, or more heuristics. */
export function modelFamily(spec: ModelSpec): ModelFamily {
  if (spec.kind !== "linear") return spec.kind;
  if (spec.features.length === 1) return "single";
  if (spec.features.length === 2) return "pair";
  return "multivariate";
}

/**
 * Lower values win ties. The arbitrary 100-point tree penalty favors our small
 * formula candidates over trees; within trees, shallower ones are preferred.
 * This encodes a selection policy, not measured runtime or model complexity.
 */
function complexityPreference(spec: ModelSpec): number {
  return spec.kind === "tree" ? 100 + 2 ** spec.depth : spec.features.length;
}

/** Ranking first, log error second, simpler model third, stable ID last. */
function compareCandidates(a: CandidateResult, b: CandidateResult): number {
  // Higher rank correlation wins; undefined correlations rank below the [-1, 1] range.
  const correlation = (b.scores.spearman ?? -2) - (a.scores.spearman ?? -2);
  if (Math.abs(correlation) > 1e-12) return correlation;
  const error = a.scores.logRmse - b.scores.logRmse;
  if (error !== 0) return error;
  const size = complexityPreference(a.spec) - complexityPreference(b.spec);
  if (size !== 0) return size;
  return a.spec.id.localeCompare(b.spec.id);
}

/**
 * Score one recipe using leave-one-out predictions. Reject the whole candidate
 * if any fold cannot fit or produces an unusable prediction, so every accepted
 * candidate is scored on the same puzzles.
 */
function evaluateCandidate(rows: readonly Observation[], spec: ModelSpec): CandidateResult | null {
  const predictions: number[] = [];
  for (let holdout = 0; holdout < rows.length; holdout++) {
    const fit = fitModel(rows.filter((_, i) => i !== holdout), spec);
    if (!fit) return null;
    const prediction = predict(fit, rows[holdout].features);
    if (!Number.isFinite(prediction) || !Number.isFinite(Math.exp(prediction))) return null;
    predictions.push(prediction);
  }
  return { spec, scores: metrics(rows.map(row => row.seconds), predictions) };
}

/**
 * Choose a recipe with leave-one-out cross-validation: train on all but one
 * puzzle, predict that puzzle, and repeat. Returns ranked recipes, not a fitted
 * winner; the caller must refit the chosen recipe on its full training set.
 */
export function selectModel(rows: readonly Observation[], specs: readonly ModelSpec[]) {
  const results: CandidateResult[] = [];
  for (const spec of specs) {
    const result = evaluateCandidate(rows, spec);
    if (result) results.push(result);
  }
  results.sort(compareCandidates);
  if (!results.length) throw new Error("No valid candidate models.");
  return { winner: results[0].spec, candidates: results };
}

/**
 * Refit each family's best inner-scored candidate and predict the unseen puzzle.
 * Each recipe is fitted once; the overall winner is also one of these family winners.
 * Only features are supplied for prediction, never the unseen puzzle's solve time.
 */
function predictFamilies(
  training: readonly Observation[],
  features: Features,
  candidates: readonly CandidateResult[],
  families: readonly ModelFamily[],
) {
  return families.map(family => {
    const best = candidates.find(candidate => modelFamily(candidate.spec) === family);
    if (!best) return { family, selected: null, logPrediction: null };
    const model = fitModel(training, best.spec);
    if (!model) throw new Error("Selected family model could not be refitted.");
    return { family, selected: best.spec.id, logPrediction: predict(model, features) };
  });
}

/**
 * Ask: "How well would our way of choosing a model predict a NEW puzzle?"
 *
 * Imagine we have five puzzles, A through E, with known human solve times:
 *
 * 1. Put puzzle A aside. Do not use it to choose or train a model.
 * 2. Use B–E to choose a recipe (which heuristics and model settings to use).
 *    To compare recipes fairly, selectModel temporarily hides B, trains on C–E,
 *    and predicts B; then does the same for C, D, and E. The recipe with the
 *    best scores across those hidden puzzles wins.
 * 3. Train the winning recipe again, now using all of B–E, and predict A's time
 *    from A's heuristics. Only after predicting do we attach A's actual time
 *    to the result, so the caller can compare the guess with the answer.
 * 4. Repeat with B put aside, then C, D, and E. Each puzzle gets one prediction
 *    made without using it to choose or train the model that predicts it.
 *
 * Why hide puzzles twice? The inside round CHOOSES a recipe. The outside round
 * TESTS that whole choosing process. Reporting only the winner's inside scores
 * would be optimistic: we picked that recipe precisely because it scored well
 * there. The outside puzzle is a fresh test that did not influence that choice.
 * This two-level check is what "nested cross-validation" means.
 *
 * We also record the best recipe from each family (constant, single-feature,
 * pair, etc.), chosen using the same inside scores, to compare model families.
 * The overall winner is also its family's winner, so we reuse that prediction.
 * A family with no valid candidate gets a null prediction.
 *
 * Returns one record per puzzle: its ID, actual seconds, source batch, predicted
 * log-seconds, chosen recipe ID, and the family predictions. Different puzzles
 * may have different winning recipes. This does not produce one final model;
 * that is selected and trained separately using all available training puzzles.
 * IDs must identify unique puzzles, not repeated timing trials of one puzzle,
 * otherwise a supposedly hidden puzzle could still appear in the training set.
 */
export function nestedCrossValidation(rows: readonly Observation[], specs: readonly ModelSpec[]) {
  if (new Set(rows.map(row => row.id)).size !== rows.length) throw new Error("Split by unique puzzle, not timing trial.");
  const families = [...new Set(specs.map(modelFamily))];
  return rows.map((heldout, index) => {
    const training = rows.filter((_, i) => i !== index);
    const selection = selectModel(training, specs);
    const familyPredictions = predictFamilies(training, heldout.features, selection.candidates, families);
    // The top-ranked candidate also wins its family, so reuse that prediction.
    const winner = familyPredictions.find(result => result.family === modelFamily(selection.winner));
    if (!winner || winner.logPrediction === null) throw new Error("Selected model has no prediction.");
    return {
      id: heldout.id,
      seconds: heldout.seconds,
      batch: heldout.batch,
      logPrediction: winner.logPrediction,
      selected: selection.winner.id,
      families: familyPredictions,
    };
  });
}
