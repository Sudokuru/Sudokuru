/**
 * Shared assertion helpers for V4 tests.
 */

import assert from "node:assert/strict";
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
  assert.notStrictEqual(hint, null);
  assert.strictEqual(hint?.strategy, strategy);
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

  assert.deepStrictEqual(
    hintFunction(puzzle, solution, locationToCheck),
    expectedHint
  );
  assert.deepStrictEqual(puzzle, puzzleBefore);
  assert.deepStrictEqual(solution, solutionBefore);
}
