/**
 * Shared assertion helpers for V4 tests.
 */

import type { CellLocation, CellProps, Hint, SudokuNumber } from "../../Types";
import { cloneBoard } from "../../validate";
import { clonePuzzle } from "./clonePuzzle";

type HintFunction = (
  puzzle: readonly (readonly CellProps[])[],
  solution: readonly (readonly SudokuNumber[])[],
  locationToCheck: CellLocation
) => Hint | null;

/**
 * Calls a hint function, asserts its result, and verifies that its inputs stay unchanged.
 */
export function expectHintWithoutMutation(
  hintFunction: HintFunction,
  puzzle: readonly (readonly CellProps[])[],
  solution: readonly (readonly SudokuNumber[])[],
  locationToCheck: CellLocation,
  expectedHint: Hint | null
): void {
  const puzzleBefore = clonePuzzle(puzzle);
  const solutionBefore = cloneBoard(solution);

  expect(hintFunction(puzzle, solution, locationToCheck)).toEqual(expectedHint);
  expect(puzzle).toEqual(puzzleBefore);
  expect(solution).toEqual(solutionBefore);
}
