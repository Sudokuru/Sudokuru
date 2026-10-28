import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { initialFeatures } from "./features";
import { unitScarcity } from "./unitScarcity";
import { singleTrace } from "./singleTrace";
import { predict } from "./models";
import { metrics, pearson, spearman } from "./statistics";
import type { ExperimentResult } from "./experimentTypes";
import type { CloudSudokuPuzzle } from "./cloudSudoku";

export type CloudPrepared = { readonly record: CloudSudokuPuzzle; readonly solution: number[][]; readonly solutionString: string; readonly empty: number };
export type ValidationStats = { readonly n: number; readonly spearman: number | null; readonly pearson: number | null;
  readonly logRmse: number | null; readonly secondsMae: number | null };
export interface ValidationResult {
  readonly procedure: string;
  readonly scores: ValidationStats;
}

/** Match frozen V3 scores by both ID and puzzle, rejecting stale or incomplete snapshots. */
export function matchLegacyScores(records: readonly CloudSudokuPuzzle[], csv: string): number[] {
  const lines = csv.trim().split(/\r?\n/);
  if (lines.shift() !== "id,puzzle,legacyScore") throw new Error("Invalid Cloud legacy snapshot header.");
  const scores = new Map<string, { puzzle: string; score: number }>();
  for (const line of lines) {
    const columns = line.split(",");
    const [id, puzzle, score] = columns;
    if (columns.length !== 3 || !/^cloud-sudoku-\d+$/.test(id) || !/^\d{81}$/.test(puzzle) ||
      !/^-?\d+$/.test(score) || !Number.isSafeInteger(Number(score)) || scores.has(id)) {
      throw new Error("Invalid or duplicate Cloud legacy snapshot row.");
    }
    scores.set(id, { puzzle, score: Number(score) });
  }
  const seen = new Set<string>();
  const matched = records.map(record => {
    const row = scores.get(record.id);
    if (!row || row.puzzle !== record.puzzle || seen.has(record.id)) throw new Error(`Cloud legacy snapshot mismatch: ${record.id}.`);
    seen.add(record.id);
    return row.score;
  });
  if (seen.size !== scores.size) throw new Error("Cloud legacy snapshot contains unmatched puzzles.");
  return matched;
}

/** Read the checked-in legacy snapshot, never executing the V3 scorer. */
export function loadLegacyScores(records: readonly CloudSudokuPuzzle[]): number[] {
  return matchLegacyScores(records, readFileSync(resolve(__dirname, "../../docs/difficulty/data/cloud-sudoku-legacy-scores.csv"), "utf8"));
}

/** Evaluate fixed full-personal-data fits on the untouched external puzzles. */
export function evaluateCloud(rows: readonly CloudPrepared[], experiments: readonly ExperimentResult[], legacy: readonly number[]) {
  if (!rows.length || rows.length !== legacy.length || legacy.some(value => !Number.isFinite(value))) throw new Error("Cloud validation requires aligned legacy scores.");
  const entries = experiments.flatMap(experiment => experiment.summaries.flatMap(summary =>
    summary.family === "constant" || !summary.finalModel ? [] : [{ experiment, summary, model: summary.finalModel, predictions: [] as number[] }]));
  const seconds = rows.map(row => row.record.seconds);
  for (const row of rows) {
    const initial = initialFeatures(row.record.puzzle);
    const scarcity = entries.some(entry => entry.experiment.includeScarcity) ? unitScarcity(initial.board) : null;
    const traces = new Map<number, ReturnType<typeof singleTrace>>();
    for (const entry of entries) {
      let features = entry.experiment.includeScarcity ? { ...initial.features, ...scarcity! } : initial.features;
      if (entry.experiment.includeTrace) {
        const limit = entry.experiment.traceLimit ?? 81;
        let trace = traces.get(limit);
        if (!trace) { trace = singleTrace(initial.board, row.solution, limit); traces.set(limit, trace); }
        features = { ...features, ...trace.features };
      }
      entry.predictions.push(predict(entry.model, features));
    }
  }
  const results: ValidationResult[] = entries.map(entry => ({
    procedure: `${entry.experiment.name}/${entry.summary.family}`, scores: metrics(seconds, entry.predictions),
  }));
  results.push({ procedure: "legacy", scores: { n: rows.length, spearman: spearman(seconds, legacy),
    pearson: pearson(seconds, legacy), logRmse: null, secondsMae: null } });
  return { results, predictions: entries.map(entry => ({ procedure: `${entry.experiment.name}/${entry.summary.family}`, values: entry.predictions })), legacy };
}
