import type { CellLocation, CellProps, Hint, SudokuValue } from "./Types";

/**
 * Returns a staged hint that fills the targeted note cell with every allowed candidate.
 */
export declare function getAmendNotesHint(
  puzzle: CellProps[][],
  solution: SudokuValue[][],
  locationToCheck: CellLocation
): Hint | null;
