import type { CellProps, SudokuNumber } from "../../Types";
import { SOLVED_TEST_BOARDS } from "./testBoards";

export const HINT_TEST_SOLUTION: readonly (readonly SudokuNumber[])[] =
  SOLVED_TEST_BOARDS[4];

/**
 * Creates a fresh solved 4x4 puzzle made entirely of given cells.
 */
export function createSolvedPuzzle(): CellProps[][] {
  return HINT_TEST_SOLUTION.map((row) =>
    row.map((value) => ({ type: "given", value }))
  );
}

/**
 * Creates a puzzle with three wrong user values in row-major order.
 */
export function createWrongValuePuzzle(): CellProps[][] {
  const puzzle = createSolvedPuzzle();
  puzzle[0][0] = { type: "value", value: 2 };
  puzzle[2][0] = { type: "value", value: 1 };
  puzzle[3][3] = { type: "value", value: 2 };
  return puzzle;
}

/**
 * Creates a puzzle with three cells requiring amended notes in row-major order.
 */
export function createAmendNotesPuzzle(): CellProps[][] {
  const puzzle = createSolvedPuzzle();
  puzzle[0][3] = { type: "note", notes: [1, 2] };
  puzzle[2][0] = { type: "note", notes: [1] };
  puzzle[3][3] = { type: "note", notes: [] };
  return puzzle;
}

/**
 * Creates a puzzle with three obvious singles in row-major order.
 */
export function createObviousSinglePuzzle(): CellProps[][] {
  const puzzle = createSolvedPuzzle();
  puzzle[0][2] = { type: "note", notes: [3] };
  puzzle[2][0] = { type: "note", notes: [4] };
  puzzle[3][3] = { type: "note", notes: [1] };
  return puzzle;
}

/**
 * Creates a puzzle with one available hint from each implemented strategy.
 */
export function createMixedStrategyPuzzle(): CellProps[][] {
  const puzzle = createSolvedPuzzle();
  puzzle[0][2] = { type: "note", notes: [3] };
  puzzle[1][1] = { type: "note", notes: [1] };
  puzzle[3][3] = { type: "value", value: 2 };
  return puzzle;
}
