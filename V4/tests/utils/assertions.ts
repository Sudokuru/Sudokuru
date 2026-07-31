/**
 * Shared assertion helpers for V4 tests.
 */

import { expect } from "bun:test";
import type {
  CellLocation,
  CellProps,
  Hint,
  SudokuNumber,
  SudokuStrategy,
} from "../../Types";
import { clonePuzzle } from "../../puzzles";
import { cloneBoard } from "../../validate";

type HintFunction = (
  puzzle: readonly (readonly CellProps[])[],
  solution: readonly (readonly SudokuNumber[])[],
  locationToCheck: CellLocation
) => Hint | null;

/**
 * Asserts that a strategy produced a hint of the expected type.
 */
export function expectStrategyHint(
  hint: Hint | null,
  strategy: SudokuStrategy
): Hint {
  expect(hint).not.toBeNull();
  expect(hint?.strategy).toBe(strategy);
  return hint!;
}

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
