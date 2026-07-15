import type { CellLocation, CellProps, Hint, SudokuValue } from "./Types";

/**
 * Returns a staged removal hint when the targeted user value differs from the solution.
 */
export declare function getWrongValueHint(
  puzzle: CellProps[][],
  solution: SudokuValue[][],
  locationToCheck: CellLocation
): Hint | null;
