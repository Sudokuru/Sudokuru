import { getPuzzle, getPuzzleSolution, getPuzzleString } from "../../validate";
import type { ResearchPuzzle } from "./data";
import type { HistoricalScores } from "./featureTypes";

export interface PreparedPuzzle {
  readonly record: ResearchPuzzle;
  readonly solution: number[][];
  readonly solutionString: string;
  readonly empty: number;
  readonly givens: number;
  readonly historicalScores: HistoricalScores;
  readonly secondsPerEmpty: number | null;
}

function validateTiming(record: ResearchPuzzle): void {
  const hasBatch = record.batch !== undefined;
  const hasSeconds = record.seconds !== undefined;

  if (hasBatch !== hasSeconds) {
    throw new Error(`Timing requires both a batch and seconds: ${record.id}`);
  }
  if (record.seconds !== undefined && (!Number.isFinite(record.seconds) || record.seconds <= 0)) {
    throw new Error(`Invalid time: ${record.id}`);
  }
  if (!record.individualSeconds) return;

  if (record.individualSeconds.some(time => !Number.isFinite(time) || time <= 0)) {
    throw new Error(`Invalid timing trial: ${record.id}`);
  }
  const average = (record.individualSeconds[0] + record.individualSeconds[1]) / 2;
  if (average !== record.seconds) {
    throw new Error(`Timing average mismatch: ${record.id}`);
  }
}

function getHistoricalScores(record: ResearchPuzzle): HistoricalScores {
  if (!Number.isFinite(record.legacyScore)) {
    throw new Error(`Missing legacy score: ${record.id}`);
  }

  const combined = { "legacy.combined": record.legacyScore };
  if (record.refutationScore === undefined || record.dependencyScore === undefined) {
    return combined;
  }
  if (record.adjustedDependencyScore === undefined) {
    throw new Error(`Missing adjusted dependency score: ${record.id}`);
  }
  return {
    ...combined,
    "legacy.refutation": record.refutationScore,
    "legacy.dependency": record.dependencyScore,
    "legacy.adjustedDependency": record.adjustedDependencyScore,
    "legacy.basicRD": record.refutationScore + record.dependencyScore,
  };
}

/** Validate the corpus once, outside feature and inference benchmarks. */
export function prepareDataset(records: readonly ResearchPuzzle[]): PreparedPuzzle[] {
  const ids = new Set<string>(), puzzles = new Set<string>();
  return records.map(record => {
    if (ids.has(record.id) || puzzles.has(record.puzzle)) throw new Error("Duplicate corpus puzzle or ID.");
    ids.add(record.id);
    puzzles.add(record.puzzle);
    const board = getPuzzle(record.puzzle);
    if (record.puzzle.length !== 81) throw new Error("Expected 9x9 corpus puzzle.");
    const solution = getPuzzleSolution(board);
    const solutionString = getPuzzleString(solution);
    const empty = [...record.puzzle].filter(value => value === "0").length;
    validateTiming(record);
    return {
      record,
      solution,
      solutionString,
      empty,
      givens: 81 - empty,
      historicalScores: getHistoricalScores(record),
      secondsPerEmpty: record.seconds === undefined ? null : record.seconds / empty,
    };
  });
}
