/** Offline research entry point: bun V4/research/difficulty/run.ts [--out directory] [--skip-benchmarks]. */
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { performance } from "node:perf_hooks";
import { DIFFICULTY_RESEARCH_PUZZLES } from "./data";
import { prepareDataset } from "./prepare";
import { INITIAL_MODEL_FEATURES } from "./features";
import { TRACE_MODEL_FEATURES } from "./singleTrace";
import { prepareResearch, correlations, runExperiment } from "./experiments";
import { runBenchmarks } from "./benchmarks";
import { renderReport } from "./report";
import { TREE_DEPTHS, TREE_MIN_LEAVES, BOOTSTRAP_REPEATS, BOOTSTRAP_SEED } from "./settings";

const args = process.argv.slice(2);
let outputDirectory = "V4/docs/difficulty/results";
let skipBenchmarks = false;
for (let i = 0; i < args.length; i++) {
  const argument = args[i];
  if (argument === "--skip-benchmarks") {
    skipBenchmarks = true;
  } else if (argument === "--out") {
    const directory = args[++i];
    if (!directory || directory.startsWith("--")) throw new Error("--out requires a directory.");
    outputDirectory = directory;
  } else {
    throw new Error(`Unknown argument: ${argument}. Supported options: --out directory, --skip-benchmarks.`);
  }
}
const output = resolve(outputDirectory);
mkdirSync(output, { recursive: true });

/** Write indented JSON with a trailing newline, replacing the named output artifact. */
function writeJson(name: string, value: unknown): void {
  writeFileSync(resolve(output, name), JSON.stringify(value, null, 2) + "\n");
}

/**
 * Write CSV using the union of all row keys as columns, in first-seen order.
 * Quote non-null values and double embedded quotes; null, undefined, and missing
 * fields become blank cells. No rows produces just a newline (no known columns).
 */
function writeCsv<T extends object>(name: string, rows: readonly T[]): void {
  const keys = [...new Set(rows.flatMap(row => Object.keys(row)))] as (keyof T)[];
  const cell = (value: unknown) => value === null || value === undefined ? "" :
    `"${String(value).replace(/"/g, '""')}"`;
  writeFileSync(resolve(output, name), [keys.map(cell).join(","), ...rows.map(row => keys.map(key => cell(row[key])).join(","))].join("\n") + "\n");
}

const preparationStart = performance.now();
const prepared = prepareDataset(DIFFICULTY_RESEARCH_PUZZLES);
const preparationMs = performance.now() - preparationStart;
const { featureRows, timed, personal, site, cohorts } = prepareResearch(prepared);
const corpus = { unique: prepared.length, personal: personal.length, siteAverage: site.length, untimed: prepared.length - timed.length };
const correlationRows = correlations(cohorts);
console.log(`Validated ${corpus.unique} puzzles; evaluating ${corpus.personal} personal observations.`);
const experiments = [
  { name: "initial", features: INITIAL_MODEL_FEATURES, includeTrace: false },
  { name: "initial+trace", features: TRACE_MODEL_FEATURES, includeTrace: true },
].flatMap(experiment => {
  console.log(`Nested cross-validation: ${experiment.name}`);
  const result = runExperiment(experiment, personal, site, cohorts);
  return result ? [result] : [];
});
const benchmarkResults = skipBenchmarks ? null : runBenchmarks(featureRows, experiments, preparationMs);
// Always overwrite this artifact so a skipped run cannot leave old timings behind.
writeJson("benchmarks.json", benchmarkResults ?? { skipped: true });
writeJson("results.json", {
  // Historical corpus source, not the revision of the code running this analysis.
  sourceCommit: "d770c39eeda6fba8ef08c33d302b49cc4c41fe3d",
  settings: { target: "logSeconds", selection: "Spearman, log RMSE, complexity, stable ID",
    outer: "leave one personal puzzle out", inner: "leave one training puzzle out",
    treeDepths: TREE_DEPTHS, treeMinLeaves: TREE_MIN_LEAVES,
    bootstrap: `paired puzzle resampling of fixed predictions; ${BOOTSTRAP_REPEATS} samples, seed ${BOOTSTRAP_SEED}; descriptive, not post-selection inference` },
  corpus,
  experiments,
});
writeJson("models.json", experiments.map(experiment => ({ name: experiment.name,
  models: experiment.summaries.map(summary => ({ family: summary.family, model: summary.finalModel })) })));
writeCsv("coefficients.csv", experiments.flatMap(experiment => experiment.coefficients));
writeJson("dataset-audit.json", featureRows.map(row => ({ id: row.record.id, puzzle: row.record.puzzle,
  solution: row.solutionString, givens: row.givens,
  empty: row.empty, batch: row.record.batch, secondsPerEmpty: row.secondsPerEmpty, trace: row.trace })));
writeCsv("features.csv", featureRows.map(row => ({ id: row.record.id, puzzle: row.record.puzzle,
  ...row.features, ...row.historicalScores })));
writeCsv("correlations.csv", correlationRows);
// Keep held-out personal predictions distinct from site-average transfer checks.
const predictionRows = experiments.flatMap(experiment => {
  const personalPredictions = experiment.heldout.flatMap(row => [
    { experiment: experiment.name, evaluation: "personal-outer-holdout", family: "selected", id: row.id,
      batch: row.batch, seconds: row.seconds, predictedSeconds: Math.exp(row.logPrediction), selected: row.selected },
    ...row.families.map(family => ({ experiment: experiment.name, evaluation: "personal-outer-holdout",
      family: family.family, id: row.id, batch: row.batch, seconds: row.seconds,
      predictedSeconds: family.logPrediction === null ? null : Math.exp(family.logPrediction), selected: family.selected })),
  ]);
  const sitePredictions = experiment.sitePredictions.map(row => ({ experiment: experiment.name, evaluation: "site-transfer", family: "selected",
    id: row.id, batch: row.batch, seconds: row.seconds,
    predictedSeconds: Math.exp(row.logPrediction), selected: experiment.fitted.spec.id }));
  return [...personalPredictions, ...sitePredictions];
});
writeCsv("predictions.csv", predictionRows);

writeFileSync(resolve(output, "REPORT.md"), renderReport(experiments, correlationRows, corpus, benchmarkResults));
console.log(`Research outputs written to ${output}`);
