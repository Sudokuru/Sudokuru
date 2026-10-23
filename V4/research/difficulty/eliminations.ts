import { readFileSync, renameSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { humanCorrelationScore } from "./statistics";
import type { metrics } from "./statistics";
import { PROCEDURE_FAMILIES } from "./procedures";

export const ELIMINATION_REGISTRY_PATH = resolve(__dirname, "../../docs/difficulty/eliminated-procedures.json");
export const SCORE_DEFINITION = "(2 + Spearman + Pearson) / 4; clamped to [0, 1]";

/** Frozen measurements, not recalculated when the corpus or scoring convention changes. */
export interface EliminatedProcedure {
  readonly procedure: string;
  readonly reason: string;
  readonly recordedAt: string;
  readonly score: number;
  readonly scoreDefinition: string;
  readonly scoringP95Ms: number | null;
  readonly statistics: ReturnType<typeof metrics>;
  readonly evaluated: number;
  readonly total: number;
  readonly modelId: string | null;
  readonly runContext: Readonly<Record<string, unknown>>;
  readonly benchmarkContext: Readonly<Record<string, unknown>> | null;
}

export interface EliminationRegistry {
  readonly version: 1;
  readonly procedures: readonly EliminatedProcedure[];
}

function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function finite(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}
function count(value: unknown): value is number {
  return finite(value) && Number.isInteger(value) && value >= 0;
}
function correlation(value: unknown): value is number | null {
  return value === null || finite(value) && value >= -1 && value <= 1;
}
function isStatistics(value: unknown): value is ReturnType<typeof metrics> {
  return object(value) && count(value.n) && correlation(value.spearman) && correlation(value.pearson) &&
    finite(value.logRmse) && value.logRmse >= 0 && finite(value.secondsMae) && value.secondsMae >= 0;
}
function validProcedure(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const slash = value.lastIndexOf("/");
  return slash > 0 && PROCEDURE_FAMILIES.some(family => family === value.slice(slash + 1));
}

/** Validate checked-in data rather than silently dropping malformed or duplicate decisions. */
export function parseEliminationRegistry(value: unknown): EliminationRegistry {
  if (!object(value) || value.version !== 1 || !Array.isArray(value.procedures)) {
    throw new Error("Invalid elimination registry: expected version 1 and a procedures array.");
  }
  const procedures: EliminatedProcedure[] = [];
  for (const record of value.procedures) {
    if (!object(record) || !validProcedure(record.procedure) || typeof record.reason !== "string" || !record.reason.trim() ||
      typeof record.recordedAt !== "string" || !Number.isFinite(Date.parse(record.recordedAt)) ||
      !finite(record.score) || record.score < 0 || record.score > 1 || typeof record.scoreDefinition !== "string" || !record.scoreDefinition.trim() ||
      !(record.scoringP95Ms === null || finite(record.scoringP95Ms) && record.scoringP95Ms >= 0) ||
      !isStatistics(record.statistics) || record.statistics.spearman === null || record.statistics.pearson === null ||
      !count(record.evaluated) || !count(record.total) ||
      record.evaluated < 2 || record.evaluated !== record.total || record.statistics.n !== record.evaluated ||
      !(record.modelId === null || typeof record.modelId === "string") || !object(record.runContext) ||
      typeof record.runContext.corpusId !== "string" || !record.runContext.corpusId ||
      !(record.benchmarkContext === null || object(record.benchmarkContext))) {
      throw new Error("Invalid eliminated procedure: expected a reason, complete measurements, and corpus provenance.");
    }
    if (procedures.some(existing => existing.procedure === record.procedure)) {
      throw new Error(`Procedure already eliminated: ${record.procedure}`);
    }
    procedures.push({
      procedure: record.procedure, reason: record.reason, recordedAt: record.recordedAt,
      score: record.score, scoreDefinition: record.scoreDefinition, scoringP95Ms: finite(record.scoringP95Ms) ? record.scoringP95Ms : null,
      statistics: record.statistics, evaluated: record.evaluated, total: record.total,
      modelId: typeof record.modelId === "string" ? record.modelId : null, runContext: record.runContext,
      benchmarkContext: object(record.benchmarkContext) ? record.benchmarkContext : null,
    });
  }
  return { version: 1, procedures };
}

export function readEliminationRegistry(path = ELIMINATION_REGISTRY_PATH): EliminationRegistry {
  return parseEliminationRegistry(JSON.parse(readFileSync(path, "utf8")));
}

/** Capture from one completed run; benchmark metadata must belong to its results. */
export function captureElimination(
  results: unknown,
  benchmarks: unknown,
  procedure: string,
  reason: string,
  recordedAt = new Date().toISOString(),
): EliminatedProcedure {
  if (!validProcedure(procedure) || !reason.trim()) throw new Error("Provide an experiment/family procedure ID and a nonempty reason.");
  if (!object(results) || !Array.isArray(results.experiments) || !object(results.reportContext) || !object(results.corpus)) {
    throw new Error("Results lack run metadata. Regenerate research results before eliminating a procedure.");
  }
  const slash = procedure.lastIndexOf("/");
  const name = procedure.slice(0, slash), family = procedure.slice(slash + 1);
  const experiment = results.experiments.find(row => object(row) && row.name === name);
  const summary = object(experiment) && Array.isArray(experiment.summaries) ?
    experiment.summaries.find(row => object(row) && row.family === family) : undefined;
  if (!object(summary) || !isStatistics(summary.heldout) || summary.evaluated !== summary.total ||
    summary.total !== results.corpus.personal || summary.heldout.n !== summary.evaluated) {
    throw new Error(`Procedure ${procedure} has no complete held-out result in this run.`);
  }
  const score = humanCorrelationScore(summary.heldout);
  if (score === null) throw new Error(`Procedure ${procedure} has unavailable human correlations.`);
  let scoringP95Ms: number | null = null;
  let benchmarkContext: Record<string, unknown> | null = null;
  if (!object(benchmarks)) throw new Error("Invalid benchmarks artifact.");
  if (benchmarks.skipped === true && (!object(results.reportContext.settings) || results.reportContext.settings.benchmarks !== "Skipped")) {
    throw new Error("Skipped benchmarks do not match results. Regenerate the run before recording an elimination.");
  }
  if (benchmarks.skipped !== true) {
    if (!Array.isArray(benchmarks.benchmarks) || !object(benchmarks.reportContext) ||
      JSON.stringify(benchmarks.reportContext) !== JSON.stringify(results.reportContext)) {
      throw new Error("Benchmark provenance does not match results. Regenerate the run before recording an elimination.");
    }
    const timing = benchmarks.benchmarks.find(row => object(row) && row.name === `${name} extraction + ${family} prediction`);
    if (!object(timing) || !finite(timing.p95Ms) || timing.p95Ms < 0) throw new Error(`No calculation-time measurement for ${procedure}.`);
    scoringP95Ms = timing.p95Ms;
    benchmarkContext = Object.fromEntries(Object.entries(benchmarks).filter(([key]) => key !== "benchmarks" && key !== "reportContext"));
  }
  const record = {
    procedure, reason: reason.trim(), recordedAt, score, scoreDefinition: SCORE_DEFINITION, scoringP95Ms,
    statistics: summary.heldout, evaluated: summary.evaluated, total: summary.total,
    modelId: object(summary.finalModel) && object(summary.finalModel.spec) ? summary.finalModel.spec.id : null,
    runContext: results.reportContext, benchmarkContext,
  };
  return parseEliminationRegistry({ version: 1, procedures: [record] }).procedures[0];
}

/** Append only: reruns and duplicate requests must never overwrite historical measurements. */
export function recordElimination(record: EliminatedProcedure, path = ELIMINATION_REGISTRY_PATH): void {
  const registry = readEliminationRegistry(path);
  const updated = parseEliminationRegistry({ version: 1, procedures: [...registry.procedures, record] });
  const temporary = `${path}.${process.pid}.tmp`;
  writeFileSync(temporary, JSON.stringify(updated, null, 2) + "\n");
  renameSync(temporary, path);
}
