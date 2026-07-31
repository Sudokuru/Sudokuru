import { getAmendNotesHint } from "./amendNotes";
import { getObviousSingleHint } from "./obviousSingle";
import { createSudokuVision } from "./sudokuVision";
import type {
  CellLocation,
  CellProps,
  Hint,
  SudokuNumber,
  SudokuStrategy,
} from "./Types";
import { getWrongValueHint } from "./wrongValue";

type StrategyHintFunction = (
  puzzle: readonly (readonly CellProps[])[],
  solution: readonly (readonly SudokuNumber[])[],
  locationToCheck: CellLocation
) => Hint | null;

const STRATEGY_HINT_FUNCTIONS: Record<
  SudokuStrategy,
  StrategyHintFunction
> = {
  WRONG_VALUE: (puzzle, solution, locationToCheck) =>
    getWrongValueHint(puzzle, solution, locationToCheck),
  AMEND_NOTES: (puzzle, solution, locationToCheck) =>
    getAmendNotesHint(puzzle, solution, locationToCheck),
  OBVIOUS_SINGLE: (puzzle, solution, locationToCheck) =>
    getObviousSingleHint(puzzle, solution, locationToCheck),
};

/**
 * Yields each successful strategy attempt in SudokuVision order.
 */
function* generateHints(
  puzzle: readonly (readonly CellProps[])[],
  solution: readonly (readonly SudokuNumber[])[],
  strategies?: readonly SudokuStrategy[]
): Generator<Hint, void> {
  const vision = createSudokuVision(puzzle, solution, strategies);

  for (
    let nextCheck = vision.pop();
    nextCheck !== null;
    nextCheck = vision.pop()
  ) {
    const [strategy, locationToCheck] = nextCheck;
    const hint = STRATEGY_HINT_FUNCTIONS[strategy](
      puzzle,
      solution,
      locationToCheck
    );

    if (hint !== null) {
      yield hint;
    }
  }
}

/**
 * Returns the next frontend-renderable staged hint for a puzzle.
 */
export function getHint(
  puzzle: readonly (readonly CellProps[])[],
  solution: readonly (readonly SudokuNumber[])[],
  strategies?: readonly SudokuStrategy[]
): Hint | null {
  const nextHint = generateHints(puzzle, solution, strategies).next();

  return nextHint.done === true ? null : nextHint.value;
}

/**
 * Returns every frontend-renderable staged hint for one strategy for the given puzzle state.
 */
export function getAllHints(
  puzzle: readonly (readonly CellProps[])[],
  solution: readonly (readonly SudokuNumber[])[],
  strategy: SudokuStrategy
): Hint[] {
  return [...generateHints(puzzle, solution, [strategy])];
}
