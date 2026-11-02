/**
 * Shared assertion helpers for V4 tests.
 */

import {
  deepStrictEqual,
  notStrictEqual,
  strictEqual,
} from "node:assert/strict";
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
  notStrictEqual(hint, null);
  strictEqual(hint?.strategy, strategy);
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

  deepStrictEqual(
    hintFunction(puzzle, solution, locationToCheck),
    expectedHint
  );
  deepStrictEqual(puzzle, puzzleBefore);
  deepStrictEqual(solution, solutionBefore);
}
