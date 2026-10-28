import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getPuzzle, getPuzzleSolution, getPuzzleString } from "../../validate";

/** Puzzle-level means from Cloud Sudoku, kept separate from training data. */
export interface CloudSudokuPuzzle {
  readonly id: string;
  readonly puzzle: string;
  readonly batch: "Cloud Sudoku";
  readonly seconds: number;
  readonly completionCount: number;
}

/** Parse the headerless, four-column conversion of the upstream spreadsheet. */
export function parseCloudSudoku(csv: string): CloudSudokuPuzzle[] {
  const ids = new Set<string>();
  const puzzles = new Set<string>();
  return csv.trim().split(/\r?\n/).map((line, index) => {
    const columns = line.split(",");
    const [game, sourcePuzzle, completions, time] = columns;
    if (columns.length !== 4 || !/^\d+$/.test(game) || !/^[.1-9]{81}$/.test(sourcePuzzle) ||
      !/^\d+$/.test(completions) || !/^\d+(?:\.\d+)?$/.test(time) ||
      !Number.isSafeInteger(Number(completions)) || Number(completions) <= 0 ||
      !Number.isFinite(Number(time)) || Number(time) <= 0) {
      throw new Error(`Invalid Cloud Sudoku row ${index + 1}.`);
    }
    const id = `cloud-sudoku-${game}`;
    const puzzle = sourcePuzzle.replace(/\./g, "0");
    if (ids.has(id) || puzzles.has(puzzle)) throw new Error(`Duplicate Cloud Sudoku row ${index + 1}.`);
    ids.add(id);
    puzzles.add(puzzle);
    return { id, puzzle, batch: "Cloud Sudoku", seconds: Number(time), completionCount: Number(completions) };
  });
}

/** Load the pinned local validation corpus; no records enter model training. */
export function loadCloudSudoku(): CloudSudokuPuzzle[] {
  return parseCloudSudoku(readFileSync(resolve(__dirname, "../../docs/difficulty/data/cloud-sudoku-20250407.csv"), "utf8"));
}

/** Validate solutions and compute the same basic board metadata as the historical corpus. */
export function prepareCloudSudoku(records: readonly CloudSudokuPuzzle[]) {
  return records.map(record => {
    const solution = getPuzzleSolution(getPuzzle(record.puzzle));
    const empty = [...record.puzzle].filter(value => value === "0").length;
    return { record, solution, solutionString: getPuzzleString(solution), empty, givens: 81 - empty,
      secondsPerEmpty: record.seconds / empty };
  });
}
