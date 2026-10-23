/** Offline research entry point: bun V4/research/difficulty/run.ts [--out directory] [--skip-benchmarks]. */
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { performance } from "node:perf_hooks";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { DIFFICULTY_RESEARCH_PUZZLES } from "./data";
import { prepareDataset } from "./prepare";
import { prepareResearch, correlations, runExperiment } from "./experiments";
import { runBenchmarks } from "./benchmarks";
import { renderReport } from "./report";
import { BOOTSTRAP_REPEATS, BOOTSTRAP_SEED, ACCEPTANCE_CRITERIA, BENCHMARK_SETTINGS, RIDGE_PENALTIES } from "./settings";
import type { ReportContext } from "./reportTypes";
import { activeExperiment, EXPERIMENTS } from "./procedures";
import { ELIMINATION_REGISTRY_PATH, readEliminationRegistry } from "./eliminations";

const args = process.argv.slice(2);
let outputDirectory = "V4/docs/difficulty/results";
let skipBenchmarks = false;
let registryPath = ELIMINATION_REGISTRY_PATH;
for (let i = 0; i < args.length; i++) {
  const argument = args[i];
  if (argument === "--skip-benchmarks") {
    skipBenchmarks = true;
  } else if (argument === "--out") {
    const directory = args[++i];
    if (!directory || directory.startsWith("--")) throw new Error("--out requires a directory.");
    outputDirectory = directory;
  } else if (argument === "--registry") {
    const path = args[++i];
    if (!path || path.startsWith("--")) throw new Error("--registry requires a file.");
    registryPath = resolve(path);
  } else {
    throw new Error(`Unknown argument: ${argument}. Supported options: --out directory, --skip-benchmarks, --registry file.`);
  }
}
const output = resolve(outputDirectory);
const registry = readEliminationRegistry(registryPath);
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
const experiments = EXPERIMENTS.flatMap(spec => {
  const experiment = activeExperiment(spec, registry.procedures);
  if (!experiment) {
    console.log(`Skipping eliminated experiment: ${spec.name}`);
    return [];
  }
  console.log(`Nested cross-validation: ${experiment.name}`);
  const result = runExperiment(experiment, personal, site, cohorts);
  return result ? [result] : [];
});
const benchmarkResults = skipBenchmarks ? null : runBenchmarks(featureRows, experiments, preparationMs);
/** Git metadata is unavailable in source archives; do not invent a revision. */
function gitMetadata(args: readonly string[]): string | null {
  try {
    return execFileSync("git", [...args], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return null;
  }
}
const trackedChanges = gitMetadata(["status", "--porcelain", "--untracked-files=no"]);
const reportContext: ReportContext = {
  codeRevision: gitMetadata(["rev-parse", "HEAD"]),
  workingTreeDirty: trackedChanges === null ? null : trackedChanges.length > 0,
  corpusId: `sha256:${createHash("sha256").update(JSON.stringify(DIFFICULTY_RESEARCH_PUZZLES)).digest("hex")}`,
  sourceCommit: "d770c39eeda6fba8ef08c33d302b49cc4c41fe3d",
  personalBatches: cohorts.filter(cohort => cohort.name.startsWith("batch:") && cohort.rows[0]?.kind === "personal")
    .map(cohort => ({ name: cohort.name.slice(6), puzzles: cohort.rows.length })),
  // This runner performs personal cross-validation and site-proxy transfer only.
  independentValidationPuzzles: 0,
  legacyRuntimeMeasured: false,
  criteria: ACCEPTANCE_CRITERIA,
  settings: {
    target: "logSeconds", selection: "Spearman, log RMSE, complexity, stable ID",
    outer: "leave one personal puzzle out", inner: "leave one training puzzle out",
    ridgePenalties: RIDGE_PENALTIES,
    ridgeObjective: "mean squared log error + penalty * squared standardized weights; unpenalized intercept",
    quadraticBasis: "x, x^2; training-only centering and scaling of each term",
    bootstrap: `paired puzzle resampling of fixed predictions; ${BOOTSTRAP_REPEATS} samples, seed ${BOOTSTRAP_SEED}; descriptive, not post-selection inference`,
    benchmarks: skipBenchmarks ? "Skipped" : "Enabled",
    warmupPasses: BENCHMARK_SETTINGS.warmupPasses,
    measuredPasses: BENCHMARK_SETTINGS.measuredPasses,
    predictionBatch: BENCHMARK_SETTINGS.predictionBatch,
    eliminationRegistryId: `sha256:${createHash("sha256").update(JSON.stringify(registry)).digest("hex")}`,
    eliminatedProcedures: registry.procedures.map(record => record.procedure).join(", ") || "None",
  },
};
// Always overwrite this artifact so a skipped run cannot leave old timings behind.
writeJson("benchmarks.json", benchmarkResults ? { ...benchmarkResults, reportContext } : { skipped: true });
writeJson("results.json", {
  // Historical corpus source, not the revision of the code running this analysis.
  sourceCommit: reportContext.sourceCommit,
  settings: reportContext.settings,
  reportContext,
  corpus,
  experiments,
  eliminatedProcedures: registry.procedures,
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
  const hasSelected = experiment.summaries.some(summary => summary.family === "selected");
  const personalPredictions = experiment.heldout.flatMap(row => [
    ...(hasSelected ? [{ experiment: experiment.name, evaluation: "personal-outer-holdout", family: "selected", id: row.id,
      batch: row.batch, seconds: row.seconds, predictedSeconds: Math.exp(row.logPrediction), selected: row.selected }] : []),
    ...row.families.map(family => ({ experiment: experiment.name, evaluation: "personal-outer-holdout",
      family: family.family, id: row.id, batch: row.batch, seconds: row.seconds,
      predictedSeconds: family.logPrediction === null ? null : Math.exp(family.logPrediction), selected: family.selected })),
  ]);
  const sitePredictions = (hasSelected ? experiment.sitePredictions : []).map(row => ({ experiment: experiment.name, evaluation: "site-transfer", family: "selected",
    id: row.id, batch: row.batch, seconds: row.seconds,
    predictedSeconds: Math.exp(row.logPrediction), selected: experiment.fitted.spec.id }));
  return [...personalPredictions, ...sitePredictions];
});
writeCsv("predictions.csv", predictionRows);

writeFileSync(resolve(output, "REPORT.md"), renderReport(experiments, correlationRows, corpus, benchmarkResults, reportContext, registry.procedures));
console.log(`Research outputs written to ${output}`);
