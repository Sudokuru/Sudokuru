import type {
  CellLocation,
  CellProps,
  Hint,
  SudokuNumber,
} from "./Types";

/**
 * Returns a staged hint when the targeted note cell has exactly one candidate remaining.
 */
export declare function getObviousSingleHint(
  puzzle: readonly (readonly CellProps[])[],
  solution: readonly (readonly SudokuNumber[])[],
  locationToCheck: CellLocation
): Hint | null;
