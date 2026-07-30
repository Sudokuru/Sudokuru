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
 * Returns the next frontend-renderable staged hint for a puzzle.
 */
export function getHint(
  puzzle: readonly (readonly CellProps[])[],
  solution: readonly (readonly SudokuNumber[])[],
  strategies?: readonly SudokuStrategy[]
): Hint | null {
  const vision = createSudokuVision(puzzle, solution, strategies);

  for (
    let nextCheck = vision.pop();
    nextCheck !== null;
    nextCheck = vision.pop()
  ) {
    const [strategy, locationToCheck] = nextCheck;
    const getStrategyHint = STRATEGY_HINT_FUNCTIONS[strategy];

    const hint = getStrategyHint(puzzle, solution, locationToCheck);

    if (hint !== null) {
      return hint;
    }
  }

  return null;
}

/**
 * Returns every frontend-renderable staged hint for one strategy for the given puzzle state.
 */
export declare function getAllHints(
  puzzle: readonly (readonly CellProps[])[],
  solution: readonly (readonly SudokuNumber[])[],
  strategy: SudokuStrategy
): Hint[];
