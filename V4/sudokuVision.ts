import type {
  CellLocation,
  CellProps,
  SudokuNumber,
  SudokuStrategy,
} from "./Types";

export interface SudokuVision {
  pop(): readonly [
    strategy: SudokuStrategy,
    locationToCheck: CellLocation
  ] | null;
}

/**
 * Creates a vision queue that prioritizes strategy and location checks for a puzzle.
 */
export declare function createSudokuVision(
  puzzle: readonly (readonly CellProps[])[],
  solution: readonly (readonly SudokuNumber[])[],
  strategies?: readonly SudokuStrategy[]
): SudokuVision;
