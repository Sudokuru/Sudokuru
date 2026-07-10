import type { CellLocation, CellProps, Hint, SudokuValue } from "./Types";

export declare function getWrongValueHint(
  puzzle: CellProps[][],
  solution: SudokuValue[][],
  locationToCheck: CellLocation
): Hint | null;
