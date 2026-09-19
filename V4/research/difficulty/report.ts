import type { ExperimentResult, CorrelationRow } from "./experimentTypes";
import type { BenchmarkResults } from "./benchmarkTypes";
import { rawCoefficients } from "./experiments";


const fmt = (value: number | null | undefined) => value == null ? "n/a" : value.toFixed(3);

/** Show the single-feature model in original feature units, or explain its absence. */
function formatFormulaExample(experiment: ExperimentResult): string {
  const model = experiment.summaries.find(summary => summary.family === "single")?.finalModel;
  if (!model || model.kind !== "linear") return `${experiment.name}: single-feature fit unavailable.`;
  const { intercept, coefficients } = rawCoefficients(model);
  const weight = coefficients[0];
  return `${experiment.name}: \`logSeconds = ${intercept.toPrecision(9)} + (${weight.toPrecision(9)}) * ${model.spec.features[0]}\`.`;
}

/** Describe measured held-out performance without treating training fit as validation. */
function formatExperimentConclusion(experiment: ExperimentResult): string {
  const comparison = experiment.comparisons.find(row => row.cohort === "personal");
  if (!comparison?.pairedBootstrap) return `${experiment.name}: personal historical-score comparison unavailable.`;
  const interval = comparison.pairedBootstrap;
  return `${experiment.name}: the complete selection procedure achieved held-out Spearman ${fmt(experiment.heldoutScores.spearman)} versus legacy ${fmt(comparison.legacy.spearman)}. The full-personal-data choice is ${experiment.fitted.spec.id}. ${interval.lower95 !== null && interval.lower95 > 0 ? "The descriptive paired interval favors this procedure on this corpus." : "The descriptive paired interval does not establish a consistent improvement over legacy."}`;
}

/**
 * Render supplied research results as Markdown; no fitting, file I/O, or timing.
 * Missing scores remain "n/a", skipped diagnostics retain their reasons, and
 * absent experiments are stated explicitly. Correlations are described neutrally,
 * not promoted into evidence that a heuristic is useful on new puzzles.
 * Runtime descriptions use the metadata stored with the supplied measurements.
 */
export function renderReport(
  experiments: readonly ExperimentResult[],
  correlationRows: readonly CorrelationRow[],
  corpus: { unique: number; personal: number; siteAverage: number; untimed: number },
  benchmarkResults: BenchmarkResults | null,
): string {
  const notesCorrelation = correlationRows.find(row =>
    row.cohort === "personal" && row.target === "seconds" && row.feature === "notes");
  const table = (headings: string[], rows: string[][]) =>
    rows.length === 0 ? "No results available." :
    [headings.join(" | "), headings.map(() => "---").join(" | "), ...rows.map(row => row.join(" | "))].join("\n");
  return [
    "# V4 difficulty research results",
    "Reproduce from the repository root: `bun V4/research/difficulty/run.ts`. See `../RESEARCH.md` for feature definitions, assumptions, and artifact formats.",
    "## Data and interpretation",
    `${corpus.unique} unique puzzles: ${corpus.personal} personally timed, ${corpus.siteAverage} labeled with site-level average times, and ${corpus.untimed} untimed. All puzzles and solutions validate. Only personal timings select models; individual attempts stay in the same puzzle observation. The CSV’s Not Givens column actually counts givens, and its per-cell time uses that incorrect denominator. Raw metadata remains in the source documents; corrected counts are computed from puzzle strings.`,
    "The corpus is small and nonrepresentative. Site times repeat the same four level averages across two sets; they are transfer diagnostics, not independent puzzle-specific ground truth. The historical average of four tiny-batch correlations is not a pooled correlation. No production scorer or difficulty thresholds are changed.",
    "## Correlation coefficients",
    "Signed coefficients below describe raw features versus seconds. `correlations.csv` includes every feature and available legacy metric, seconds/log-seconds, pooled/source/batch cohorts, and exact sample sizes. Constant features have unavailable correlation, not zero.",
    table(["Feature", "Personal n", "Pearson", "Spearman"], correlationRows.filter(row => row.cohort === "personal" && row.target === "seconds").map(row =>
      [row.feature, String(row.n), fmt(row.pearson), fmt(row.spearman)])),
    "## Model evaluation",
    ...(experiments.length === 0 ? ["No experiments ran; model evaluation and fitted-model results are unavailable."] : []),
    "Each row below uses outer held-out personal predictions. Feature and hyperparameter choices use only inner training folds. All fits target log-seconds. The selected row evaluates the complete selection procedure; family rows independently select within that family. Training scores and final full-personal fits are recorded in results.json/models.json. Seconds predictions are exponentiated log predictions without a bias correction. Evaluated/total reports prediction coverage: incomplete rows describe a subset and are not directly comparable to complete rows. Missing scores or final fits are unavailable, not zero.",
    table(["Features", "Family", "Evaluated/total", "Final model", "Held-out Spearman", "Pearson", "Log RMSE", "MAE seconds", "Training Spearman"], experiments.flatMap(experiment => experiment.summaries.map(summary =>
      [experiment.name, summary.family, `${summary.evaluated}/${summary.total}`, summary.finalModel?.spec.id ?? "unavailable", fmt(summary.heldout?.spearman), fmt(summary.heldout?.pearson), fmt(summary.heldout?.logRmse), fmt(summary.heldout?.secondsMae), fmt(summary.training?.spearman)]))),
    ...(experiments.length ? ["The constant baseline's negative leave-one-out correlation results from removing each label from its training mean; it is not useful reverse-ranking skill. Candidate counts are " + experiments.map(experiment => `${experiment.name}: ${experiment.candidateCount}`).join(", ") + "."] : []),
    "## Fitted coefficients",
    "`coefficients.csv` contains full-personal-data intercepts and raw-feature weights for every eligible formula candidate, alongside its inner-CV selection scores. These scores are not a separate unbiased validation. `models.json` retains standardized parameters and tree splits for the final family choices. Example one-feature fits below predict log-seconds; exponentiate to obtain seconds.",
    ...experiments.map(formatFormulaExample),
    "## Comparison with historical difficulty",
    "Comparisons use identical puzzle subsets. Personal predictions are outer-held-out; site predictions come from the model fitted on all personal puzzles. Pooled results combine those two evaluation types. Bootstrap intervals resample paired puzzles with predictions fixed, so they do not capture model-selection or population uncertainty.",
    table(["Features", "Cohort", "n", "Model Spearman", "Legacy Spearman", "Difference", "95% paired bootstrap"], experiments.flatMap(experiment => experiment.comparisons.filter(row => !row.cohort.startsWith("batch:")).map(row =>
      [experiment.name, row.cohort, String(row.legacy.n), fmt(row.model?.spearman), fmt(row.legacy.spearman), fmt(row.pairedBootstrap?.difference), `[${fmt(row.pairedBootstrap?.lower95)}, ${fmt(row.pairedBootstrap?.upper95)}]`]))),
    ...experiments.flatMap(experiment => experiment.comparisons.flatMap(row =>
      row.skipped ? [`${experiment.name}/${row.cohort}: ${row.skipped}`] : [])),
    "## Leave one personal batch out",
    "These fits exclude the entire named batch during both selection and training. Small held-out batches are especially unstable; inspect them alongside the ordinary held-out results.",
    table(["Features", "Held-out batch", "Spearman", "Log RMSE", "Selected model"], experiments.flatMap(experiment => experiment.batchSensitivity.map(row =>
      [experiment.name, row.batch, fmt(row.scores?.spearman), fmt(row.scores?.logRmse), row.selected ?? "unavailable"]))),
    ...experiments.flatMap(experiment => experiment.batchSensitivity.flatMap(row =>
      row.skipped ? [`${experiment.name}/${row.batch}: ${row.skipped}`] : [])),
    "## Runtime",
    !benchmarkResults ? "Benchmarks skipped for this run." :
      `Measured on ${benchmarkResults.cpu}, ${benchmarkResults.platform} ${benchmarkResults.arch}, Node ${benchmarkResults.runtime.node}, Bun ${benchmarkResults.runtime.bun ?? "n/a"}. ${benchmarkResults.warmupPasses} warmup passes and ${benchmarkResults.measuredPasses} measured passes over ${benchmarkResults.corpusSize} puzzles. Corpus validation/solution preparation took ${benchmarkResults.preparationMs.toFixed(1)} ms and is excluded from feature/prediction measurements.`,
    ...(benchmarkResults ? [`Prediction percentiles describe amortized batches of ${benchmarkResults.predictionBatch} calls; extraction percentiles describe individual puzzle calls. Trace extraction includes copying and hint construction/application. Combined costs include parsing, candidate initialization, and any trace; prepared solutions are assumed available. No hard latency gate is imposed.`] : []),
    table(["Operation", "p50 ms", "p95 ms", "Puzzles/sec"], (benchmarkResults?.benchmarks ?? []).map(row =>
      [row.name, row.p50Ms.toFixed(6), row.p95Ms.toFixed(6), row.puzzlesPerSecond.toFixed(0)])),
    "## Research conclusion",
    `Total legal-note count alone has personal Pearson ${fmt(notesCorrelation?.pearson)} and Spearman ${fmt(notesCorrelation?.spearman)}. These descriptive correlations do not establish predictive usefulness on new puzzles; independent timings are needed to assess that.`,
    ...experiments.map(formatExperimentConclusion),
    "Treat these models as experiments. Prefer inexpensive initial features unless trace features demonstrate a repeatable benefit on new personal timing data. Collect more independent puzzle timings across solvers and difficulty ranges before choosing a production model; training fit and site-level proxy correlations alone do not justify promotion.",
  ].join("\n\n") + "\n";
}
