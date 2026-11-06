// bun V4/scripts/tuneDifficulty.ts <maxSeconds> <maxNewVariations> [resultsPath]
// One writer per file. The deadline is checked between synchronous puzzle operations.
import { appendFileSync, existsSync, readFileSync, readdirSync, truncateSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { getRawDifficulty, type RawDifficultyOptions } from "../difficulty";
import { createSeededRandom } from "../random";
import { getPuzzle, getPuzzleSolution } from "../validate";
const correlation: (x: number[], y: number[]) => number = require("calculate-correlation");

const started = performance.now();
const [seconds, variations, output] = process.argv.slice(2);
const maxSeconds = Number(seconds), maxVariations = Number(variations);
if (!Number.isFinite(maxSeconds) || maxSeconds <= 0 || !Number.isSafeInteger(maxVariations) || maxVariations <= 0) {
  throw new Error("Usage: tuneDifficulty.ts <positive seconds> <positive integer variations> [resultsPath]");
}
const deadline = started + maxSeconds * 1000;
const resultsPath = resolve(output ?? resolve(__dirname, "difficulty-tuning-results.txt"));
const baseline: Required<RawDifficultyOptions> = {
  refutationRunCount: 1, refutationMaxTrialsPerRun: 64, refutationSeed: 81,
  dependencyRunCount: 3, dependencyStepCount: 25, dependencySeed: 81,
  refutationWeight: 1, dependencyWeight: 10, refutationEmptyCellExponent: 2,
  dependencyEmptyCellExponent: 1.9, maxRefutationScore: 48, outputScale: 1_000_000,
};
const grid = {
  refutationRunCount: [1, 3],
  refutationMaxTrialsPerRun: [64],
  dependencyRunCount: [3, 5, 10],
  dependencyStepCount: [20, 25, 30, 35, 40],
  dependencyWeight: [10],
  refutationEmptyCellExponent: [2],
  dependencyEmptyCellExponent: [1.9],
  maxRefutationScore: [16, 32, 48, 64, 96],
};
type GroupResult = { name: string; scores: number[]; pearson: number | null };
type Result = {
  context: string; options: Required<RawDifficultyOptions>;
  groups: GroupResult[]; meanPearson: number | null;
};
const optionKeys = Object.keys(baseline).sort((a, b) => a.localeCompare(b));
const key = (options: RawDifficultyOptions): string => JSON.stringify(optionKeys.map((name) => options[name]));
const nullableNumber = (value: unknown): boolean => value === null || Number.isFinite(value);
function readResult(line: string, lineNumber: number): Result {
  try {
    const record: Result = JSON.parse(line);
    if (typeof record.context !== "string" || !optionKeys.every((name) => Number.isFinite(record.options?.[name])) ||
        !nullableNumber(record.meanPearson) || !Array.isArray(record.groups) || record.groups.length !== 5 ||
        !record.groups.every((group) => typeof group.name === "string" && nullableNumber(group.pearson) &&
          Array.isArray(group.scores) && group.scores.length > 1 && group.scores.every(Number.isFinite))) {
      throw new Error("Result does not match the expected tuning record format.");
    }
    return record;
  } catch {
    throw new Error(`Malformed result at ${resultsPath}:${lineNumber}`);
  }
}
const saved = existsSync(resultsPath) ? readFileSync(resultsPath, "utf8") : "";
const lines = saved.split("\n");
const tail = lines.pop();
const records = lines.map((line, index) => readResult(line, index + 1));
if (tail) {
  let complete = true;
  try { JSON.parse(tail); } catch { complete = false; }
  if (complete) {
    records.push(readResult(tail, lines.length + 1));
    appendFileSync(resultsPath, "\n");
  } else {
    truncateSync(resultsPath, Buffer.byteLength(saved) - Buffer.byteLength(tail));
  }
}
const root = resolve(__dirname, "..");
const csv = readFileSync(resolve(root, "docs/difficulty/data/legacy-difficulty-benchmarks.csv"), "utf8");
const report = readFileSync(resolve(root, "docs/difficulty/data/legacy-generator-difficulty-benchmarks.txt"), "utf8");
const sources = readdirSync(root).filter((name) => name.endsWith(".ts")).sort()
  .map((name) => [name, readFileSync(resolve(root, name), "utf8")]);
// Bump this metric-format version if parsing, grouping, or correlation semantics change.
const context = createHash("sha256").update(JSON.stringify(["pearson-groups-v1", csv, report, sources])).digest("hex");
const current = records.filter((record) => record.context === context);
const seen = new Set(current.map((record) => key(record.options)));
const groups: { name: string; puzzles: string[]; times: number[] }[] = [];
for (const line of report.split(/\r?\n/)) {
  const heading = line.match(/^(Sudoku of the day \d+|Sudokuru \d+)(?: \(.+\))?$/);
  if (heading) groups.push({ name: heading[1], puzzles: [], times: [] });
  const board = line.match(/^\d+ \| (\d+) \| (\d{81})$/);
  if (board) {
    groups.at(-1).puzzles.push(board[2]);
    groups.at(-1).times.push(Number(board[1]));
  }
}
const rows = csv.trim().split(/\r?\n/).slice(1).map((line) => line.split(","));
groups.push({ name: "CSV average times",
  puzzles: rows.map((row) => row[6]),
  times: rows.map((row) => Number(row[3])),
});
if (groups.length !== 5 || groups.some((group, i) => group.puzzles.length !== (i === 4 ? 14 : 4) ||
    group.times.some((time) => !Number.isFinite(time) || time <= 0))) throw new Error("Expected five groups of 4/4/4/4/14 human-time boards.");
function prepareBoards() {
  const prepared: { puzzle: ReturnType<typeof getPuzzle>; solution: number[][] }[][] = [];
  for (const group of groups) {
    const boards: (typeof prepared)[number] = [];
    for (const text of group.puzzles) {
      if (performance.now() >= deadline) return null;
      const puzzle = getPuzzle(text);
      boards.push({ puzzle, solution: getPuzzleSolution(puzzle) });
    }
    prepared.push(boards);
  }
  return prepared;
}
function evaluateVariation(options: Required<RawDifficultyOptions>, prepared: ReturnType<typeof prepareBoards>): Result | null {
  const results: GroupResult[] = [];
  for (const [i, group] of groups.entries()) {
    const scores: number[] = [];
    for (const { puzzle, solution } of prepared[i]) {
      if (performance.now() >= deadline) return null;
      scores.push(getRawDifficulty(puzzle, solution, options));
    }
    const pearson = correlation(scores, group.times);
    results.push({ name: group.name, scores, pearson: Number.isFinite(pearson) ? pearson : null });
  }
  const meanPearson = results.some((group) => group.pearson === null) ? null :
    results.reduce((sum, group) => sum + group.pearson, 0) / results.length;
  return { context, options, groups: results, meanPearson };
}
function runSearch(): number {
  let completed = 0;
  const prepared = prepareBoards();
  if (prepared === null) return completed;
  const dimensions = Object.entries(grid);
  const order = Array.from({ length: dimensions.reduce((n, [, values]) => n * values.length, 1) }, (_, i) => i);
  const random = createSeededRandom(81);
  for (let i = order.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  for (let index of [-1, ...order]) {
    if (completed >= maxVariations || performance.now() >= deadline) break;
    const options = { ...baseline };
    if (index >= 0) {
      for (const [name, values] of dimensions) {
        options[name] = values[index % values.length];
        index = Math.floor(index / values.length);
      }
    }
    if (seen.has(key(options))) continue;
    const record = evaluateVariation(options, prepared);
    if (record === null) return completed;
    appendFileSync(resultsPath, JSON.stringify(record) + "\n");
    current.push(record);
    seen.add(key(options));
    completed += 1;
  }
  return completed;
}
const completed = runSearch();
console.log(`Added ${completed} variations; ${current.length} recorded for this context. Results: ${resultsPath}`);
console.log("Top five by mean Pearson (tuning data, not independent validation):");
current.filter((record) => record.meanPearson !== null).sort((a, b) => b.meanPearson - a.meanPearson)
  .slice(0, 5).forEach((record) => console.log(JSON.stringify(record)));
