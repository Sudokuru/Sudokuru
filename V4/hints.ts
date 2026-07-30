import type {
  CellProps,
  Hint,
  SudokuNumber,
  SudokuStrategy,
} from "./Types";

/**
 * Returns the next frontend-renderable staged hint for a puzzle.
 */
export declare function getHint(
  puzzle: readonly (readonly CellProps[])[],
  solution: readonly (readonly SudokuNumber[])[],
  strategies?: readonly SudokuStrategy[]
): Hint;
