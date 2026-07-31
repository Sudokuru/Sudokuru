import type { CellProps, SudokuNumber } from "./Types";

/**
 * Returns a puzzle's refutation score for the supplied solution.
 *
 * The boost must be between 0 and 1 and controls the proportion of remaining
 * cells that may be skipped after a refutation candidate has been found.
 */
export declare function getRefutationScore(
  puzzle: readonly (readonly CellProps[])[],
  solution: readonly (readonly SudokuNumber[])[],
  boost: number
): number;
