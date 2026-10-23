import type { ExperimentResult, CorrelationRow, FamilySummary } from "./experimentTypes";
import type { BenchmarkResults } from "./benchmarkTypes";
import type { ReportContext } from "./reportTypes";
import { rawCoefficients } from "./experiments";
import { INITIAL_MODEL_FEATURES } from "./features";

const fmt = (value: number | null | undefined) => value == null ? "n/a" : value.toFixed(3);
const difference = (a: number | null | undefined, b: number | null | undefined) =>
  a == null || b == null ? "n/a" : fmt(a - b);
const table = (headings: readonly string[], rows: readonly string[][]) => rows.length === 0 ? "No results available." :
  [headings.join(" | "), headings.map(() => "---").join(" | "), ...rows.map(row => row.join(" | "))].join("\n");

/** Labels describe interval bounds only; they are not adoption recommendations. */
function intervalLabel(interval: { lower95: number | null; upper95: number | null } | null): string {
  if (interval?.lower95 == null || interval.upper95 == null) return "Unavailable";
  if (interval.lower95 > 0) return "Interval above zero";
  if (interval.upper95 < 0) return "Interval below zero";
  return "Interval includes zero";
}

function intervalText(interval: { lower95: number | null; upper95: number | null } | null): string {
  return interval?.lower95 == null || interval.upper95 == null ? "n/a" :
    `[${fmt(interval.lower95)}, ${fmt(interval.upper95)}]`;
}

/** Compare actual puzzle identities, including partial family prediction coverage. */
function evaluatedIds(experiment: ExperimentResult, family: FamilySummary["family"]): string[] {
  return experiment.heldout.filter(row => family === "selected" ||
    row.families.some(entry => entry.family === family && entry.logPrediction !== null)).map(row => row.id).sort();
}

/** Pure rendering of measured results and explicit run metadata; no model fitting or recommendations. */
export function renderReport(
  experiments: readonly ExperimentResult[],
  correlationRows: readonly CorrelationRow[],
  corpus: { unique: number; personal: number; siteAverage: number; untimed: number },
  benchmarkResults: BenchmarkResults | null,
  context?: ReportContext,
): string {
  const summary = (experiment: ExperimentResult, family: FamilySummary["family"]) =>
    experiment.summaries.find(row => row.family === family);
  const scoring = (experiment: ExperimentResult, family: FamilySummary["family"] = "selected") =>
    benchmarkResults?.benchmarks.find(row => row.name === `${experiment.name} extraction + ${family} prediction`);
  const comparisonRows = (experiment: ExperimentResult, reference: ExperimentResult,
    family: FamilySummary["family"], referenceFamily: FamilySummary["family"]) => {
    const a = summary(experiment, family), b = summary(reference, referenceFamily);
    const ids = evaluatedIds(experiment, family), referenceIds = evaluatedIds(reference, referenceFamily);
    const coverageMatches = ids.length === referenceIds.length && ids.every((id, i) => id === referenceIds[i]);
    const available = a?.heldout != null && b?.heldout != null && ids.length > 0;
    const status = !coverageMatches ? "Different puzzle coverage" : available ? "Matching puzzle coverage" : "Unavailable";
    const comparable = coverageMatches && available;
    return [
      `${experiment.name}/${family} versus ${reference.name}/${referenceFamily}`, status,
      comparable ? difference(a?.heldout?.spearman, b?.heldout?.spearman) : "n/a",
      comparable ? difference(a?.heldout?.logRmse, b?.heldout?.logRmse) : "n/a",
      comparable ? difference(scoring(experiment, family)?.p95Ms, scoring(reference, referenceFamily)?.p95Ms) : "n/a",
    ];
  };
  const deltaHeadings = ["Comparison (first minus second)", "Coverage", "Change in ranking correlation ↑", "Change in log error ↓", "Change in scoring p95 ms ↓"];
  const initial = experiments.find(experiment => !experiment.includeTrace);
  const batchCount = (name: string) => context?.personalBatches.find(batch => batch.name === name)?.puzzles;
  const notesCorrelation = correlationRows.find(row => row.cohort === "personal" && row.target === "seconds" && row.feature === "notes");
  return [
    "# V4 difficulty research results",
    "Ranking correlation is Spearman agreement with human solve-time ordering (higher is better). Log error is RMSE in natural-log seconds (lower is better). Results below evaluate selection procedures; formulas fitted on all personal data are listed separately. No production difficulty thresholds change.",
    "## How do approaches compare with legacy?",
    ...(experiments.length === 0 ? ["No experiments ran; model evaluation and fitted-model results are unavailable."] : []),
    "Personal predictions hold each puzzle out of both model selection and fitting. Legacy comparisons use the same eligible puzzles. Intervals resample paired puzzles with predictions fixed; they omit model-selection and population uncertainty. Interval labels describe bounds only. Scoring p95 measures extraction plus prediction for the final fitted model, not cross-validation runtime. Missing metrics are n/a. Partial rows describe subsets and are not directly comparable to complete rows.",
    table(["Procedure", "Legacy-comparable/total", "Ranking correlation ↑", "Legacy correlation ↑", "Difference from legacy", "95% descriptive interval", "Interval position", "Log error ↓", "Scoring p95 ms ↓"], experiments.flatMap(experiment => experiment.summaries.filter(row => row.family !== "constant").map(row => {
      const comparison = row.family === "selected" ? experiment.comparisons.find(entry => entry.cohort === "personal") : row.personalComparison;
      return [`${experiment.name}/${row.family}`, `${comparison?.legacy.n ?? 0}/${corpus.personal}`,
        fmt(comparison?.model?.spearman), fmt(comparison?.legacy.spearman), fmt(comparison?.pairedBootstrap?.difference),
        intervalText(comparison?.pairedBootstrap ?? null), intervalLabel(comparison?.pairedBootstrap ?? null),
        fmt(comparison?.model?.logRmse), fmt(scoring(experiment, row.family)?.p95Ms)];
    }))),
    "## Does adding trace information help?",
    "Changes are first minus second, not uncertainty estimates. Only matching puzzle identities are compared. Trace procedures add obvious-single traces to initial-board features; they do not evaluate richer strategy traces.",
    table(deltaHeadings, initial ? experiments.filter(experiment => experiment.includeTrace).map(experiment =>
      comparisonRows(experiment, initial, "selected", "selected")) : []),
    "## Does allowing more complex models help?",
    "Each family selects features or hyperparameters inside its training folds. Family comparisons are exploratory. Choosing a family after inspecting these results requires fresh validation.",
    table(deltaHeadings, experiments.flatMap(experiment => (["pair", "tree"] as const).map(family =>
      comparisonRows(experiment, experiment, family, "single")))),
    "## How sensitive are results to the training data?",
    "Selection frequencies count outer folds. All tied most-frequent formulas are shown in ID order. Trace use is determined from the selected recipe's feature list. These counts are descriptive; no stability threshold is imposed.",
    table(["Procedure", "Outer folds", "Distinct recipes selected", "Most frequent recipe(s)", "Folds selecting each", "Folds using trace features"], experiments.map(experiment => {
      const selections = experiment.heldout.map(row => row.selected);
      const counts = [...new Set(selections)].map(id => ({ id, count: selections.filter(selected => selected === id).length }));
      const max = Math.max(0, ...counts.map(row => row.count));
      const common = counts.filter(row => row.count === max).map(row => row.id).sort();
      const traceFlags = experiment.heldout.map(row => row.selectedFeatures.some(feature =>
        !INITIAL_MODEL_FEATURES.some(initialFeature => initialFeature === feature)));
      return [experiment.name, String(selections.length), String(counts.length), common.join(", ") || "n/a",
        counts.length ? String(max) : "n/a", String(traceFlags.filter(Boolean).length)];
    })),
    "Batch exclusion repeats selection and fitting without the entire named batch. Small batch correlations should be read with their sample counts.",
    table(["Procedure", "Excluded batch", "Puzzles evaluated", "Ranking correlation ↑", "Log error ↓", "Selected recipe"], experiments.flatMap(experiment => experiment.batchSensitivity.map(row =>
      [experiment.name, row.batch, String(row.scores?.n ?? batchCount(row.batch) ?? "n/a"), fmt(row.scores?.spearman), fmt(row.scores?.logRmse), row.selected ?? "unavailable"]))),
    ...experiments.flatMap(experiment => experiment.batchSensitivity.flatMap(row => row.skipped ? [`${experiment.name}/${row.batch}: ${row.skipped}`] : [])),
    "## What does scoring cost?",
    "Combined timings include parsing, candidate initialization, and any trace. Prepared solutions are assumed available; solution preparation and training are excluded. Each row measures the final fitted model using that procedure's feature pipeline. These are warmed microbenchmarks, not generation-workflow latency guarantees.",
    ...(!benchmarkResults ? ["Benchmarks skipped for this run."] : []),
    table(["Procedure", "Scoring p50 ms ↓", "Scoring p95 ms ↓", "Estimated puzzles/sec ↑"], experiments.map(experiment => {
      const timing = scoring(experiment);
      return [experiment.name, fmt(timing?.p50Ms), fmt(timing?.p95Ms), timing ? timing.puzzlesPerSecond.toFixed(0) : "n/a"];
    })),
    "## What evidence is available?",
    table(["Evidence", "Available"], [
      ["Personally timed puzzles", String(corpus.personal)],
      ["Personal timing batches", context ? String(context.personalBatches.length) : "n/a"],
      ["Batch sizes", context ? context.personalBatches.map(batch => `${batch.name}: ${batch.puzzles}`).join(", ") || "None" : "n/a"],
      ["Site-average proxy labels", String(corpus.siteAverage)],
      ["Untimed puzzles", String(corpus.untimed)],
      ["Legacy runtime measured in this run", context ? context.legacyRuntimeMeasured ? "Yes" : "No" : "n/a"],
      ["Independent validation puzzles", context ? String(context.independentValidationPuzzles) : "n/a"],
      ["Maximum acceptable ranking-correlation loss", context?.criteria.maxRankingLoss == null ? "Not configured" : fmt(context.criteria.maxRankingLoss)],
      ["Scoring p95 budget (ms)", context?.criteria.scoringP95BudgetMs == null ? "Not configured" : fmt(context.criteria.scoringP95BudgetMs)],
    ]),
    "Site times repeat four level averages across two sets and are not independent puzzle-specific measurements. The personally timed corpus is small and nonrepresentative. Configured criteria are displayed for reference; this report makes no automatic adoption decision.",
    "## Appendix: fitted models and coefficients",
    "These recipes are selected and fitted using all personal observations. Their training scores do not validate these particular formulas on new puzzles. Held-out scores above evaluate the selection procedures, which may choose a different recipe in each fold.",
    table(["Features", "Family", "Final fitted recipe", "Training Spearman"], experiments.flatMap(experiment => experiment.summaries.map(row =>
      [experiment.name, row.family, row.finalModel?.spec.id ?? "unavailable", fmt(row.training?.spearman)]))),
    "[coefficients.csv](coefficients.csv) contains raw-feature weights for every eligible formula and inner-CV selection scores. [models.json](models.json) contains final standardized parameters and tree splits. Linear formulas predict log-seconds; exponentiate for seconds, without retransformation bias correction.",
    ...experiments.map(experiment => {
      const model = summary(experiment, "single")?.finalModel;
      if (!model || model.kind !== "linear") return `${experiment.name}: single-feature fit unavailable.`;
      const raw = rawCoefficients(model);
      return `${experiment.name}: \`logSeconds = ${raw.intercept.toPrecision(9)} + (${raw.coefficients[0].toPrecision(9)}) * ${model.spec.features[0]}\`.`;
    }),
    "## Appendix: correlations and evaluation details",
    "Raw feature correlations are descriptive, not held-out model scores. Negative correlations retain their signs. Constant features have unavailable correlation, not zero. [correlations.csv](correlations.csv) includes seconds/log-seconds and all cohorts.",
    table(["Feature", "Personal n", "Pearson", "Spearman"], correlationRows.filter(row => row.cohort === "personal" && row.target === "seconds").map(row =>
      [row.feature, String(row.n), fmt(row.pearson), fmt(row.spearman)])),
    `Total legal-note count: personal Pearson ${fmt(notesCorrelation?.pearson)} and Spearman ${fmt(notesCorrelation?.spearman)}.`,
    "The constant baseline's negative leave-one-out correlation results from removing each label from its training mean; it is not useful reverse-ranking skill.",
    table(["Features", "Family", "Evaluated/total", "Final model", "Held-out Spearman", "Pearson", "Log RMSE", "MAE seconds", "Training Spearman"], experiments.flatMap(experiment => experiment.summaries.map(row =>
      [experiment.name, row.family, `${row.evaluated}/${row.total}`, row.finalModel?.spec.id ?? "unavailable", fmt(row.heldout?.spearman), fmt(row.heldout?.pearson), fmt(row.heldout?.logRmse), fmt(row.heldout?.secondsMae), fmt(row.training?.spearman)]))),
    "## Appendix: site-average and pooled diagnostics",
    "Site predictions use the model fitted on all personal puzzles. Pooled results combine personal outer-held-out predictions with site transfer predictions; they are not a homogeneous validation sample.",
    table(["Procedure", "Cohort", "n", "Model Spearman", "Legacy Spearman", "Difference", "95% descriptive interval", "Interval position"], experiments.flatMap(experiment => experiment.comparisons.filter(row => row.cohort === "site-average" || row.cohort === "pooled").map(row =>
      [experiment.name, row.cohort, String(row.legacy.n), fmt(row.model?.spearman), fmt(row.legacy.spearman), fmt(row.pairedBootstrap?.difference), intervalText(row.pairedBootstrap), intervalLabel(row.pairedBootstrap)]))),
    ...experiments.flatMap(experiment => experiment.comparisons.flatMap(row => row.skipped ? [`${experiment.name}/${row.cohort}: ${row.skipped}`] : [])),
    "## Appendix: runtime operations",
    ...(benchmarkResults ? [
      `Measured on ${benchmarkResults.cpu ?? "n/a"}, ${benchmarkResults.platform} ${benchmarkResults.arch}, Node ${benchmarkResults.runtime.node}, Bun ${benchmarkResults.runtime.bun ?? "n/a"}. ${benchmarkResults.warmupPasses} warmup passes and ${benchmarkResults.measuredPasses} measured passes over ${benchmarkResults.corpusSize} puzzles. Corpus validation/solution preparation took ${benchmarkResults.preparationMs.toFixed(1)} ms and is excluded from feature/prediction measurements.`,
      `Prediction percentiles describe amortized batches of ${benchmarkResults.predictionBatch} calls; extraction percentiles describe individual puzzle calls. Trace extraction includes copying and hint construction/application.`,
    ] : []),
    table(["Operation", "p50 ms", "p95 ms", "Estimated puzzles/sec"], (benchmarkResults?.benchmarks ?? []).map(row =>
      [row.name, row.p50Ms.toFixed(6), row.p95Ms.toFixed(6), row.puzzlesPerSecond.toFixed(0)])),
    "## Appendix: corpus and reproducibility",
    `${corpus.unique} unique puzzles: ${corpus.personal} personally timed, ${corpus.siteAverage} labeled with site-level average times, and ${corpus.untimed} untimed. All puzzles and solutions validate. Only personal timings select models; individual attempts stay in the same puzzle observation. The CSV’s Not Givens column actually counts givens, and its per-cell time uses that incorrect denominator. Corrected counts are computed from puzzle strings. The historical average of tiny-batch correlations is not a pooled correlation.`,
    table(["Run metadata", "Value"], [
      ["Analysis code revision", context?.codeRevision ?? "n/a"],
      ["Working tree has tracked changes", context?.workingTreeDirty == null ? "n/a" : context.workingTreeDirty ? "Yes" : "No"],
      ["Corpus identifier", context?.corpusId ?? "n/a"],
      ["Historical corpus source commit", context?.sourceCommit ?? "n/a"],
      ...Object.entries(context?.settings ?? {}).map(([name, value]) => [name, String(value)]),
    ]),
    table(["Procedure", "Candidate recipes"], experiments.map(experiment => [experiment.name, String(experiment.candidateCount)])),
    "Reproduce from the repository root: `bun V4/research/difficulty/run.ts`. See [RESEARCH.md](../RESEARCH.md) for definitions and assumptions. Detailed artifacts: [results.json](results.json), [predictions.csv](predictions.csv), [features.csv](features.csv), [dataset-audit.json](dataset-audit.json), [benchmarks.json](benchmarks.json).",
  ].join("\n\n") + "\n";
}
