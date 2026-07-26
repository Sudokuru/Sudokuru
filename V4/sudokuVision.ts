import { Queue } from "data-structure-typed";
import { SUDOKU_STRATEGY_ARRAY } from "./Types";
import type {
  CellLocation,
  CellProps,
  SudokuNumber,
  SudokuStrategy,
} from "./Types";

type SudokuVisionQueueItem = readonly [
  strategy: SudokuStrategy,
  locationToCheck: CellLocation
];

type SudokuVisionState = {
  strategyPriority: readonly SudokuStrategy[];
  currentStrategyIndex: number;
  wrongValueQueue: Queue<CellLocation> | null;
};

export interface SudokuVision {
  pop(): SudokuVisionQueueItem | null;
}

/**
 * Builds the row-major queue used when wrong-value scanning is enabled.
 */
function createWrongValueQueue(
  puzzle: readonly (readonly CellProps[])[],
  solution: readonly (readonly SudokuNumber[])[]
): Queue<CellLocation> {
  const queue = new Queue<CellLocation>();

  for (let r = 0; r < puzzle.length; r += 1) {
    for (let c = 0; c < puzzle[r].length; c += 1) {
      const cell = puzzle[r][c];

      if (cell.type === "value" && cell.value !== solution[r][c]) {
        queue.push({ r, c });
      }
    }
  }

  return queue;
}

/**
 * Removes the next check from the queue for the current strategy.
 */
function popState(state: SudokuVisionState): SudokuVisionQueueItem | null {
  const currentStrategy =
    state.strategyPriority[state.currentStrategyIndex] ?? null;

  if (currentStrategy !== "WRONG_VALUE") {
    return null;
  }

  const locationToCheck = state.wrongValueQueue?.shift();

  return locationToCheck
    ? ["WRONG_VALUE", locationToCheck]
    : null;
}

/**
 * Creates a vision queue that prioritizes strategy and location checks for a puzzle.
 */
export function createSudokuVision(
  puzzle: readonly (readonly CellProps[])[],
  solution: readonly (readonly SudokuNumber[])[],
  strategies?: readonly SudokuStrategy[]
): SudokuVision {
  const strategyPriority = strategies ?? SUDOKU_STRATEGY_ARRAY;
  const state: SudokuVisionState = {
    strategyPriority,
    currentStrategyIndex: 0,
    wrongValueQueue: strategyPriority.includes("WRONG_VALUE")
      ? createWrongValueQueue(puzzle, solution)
      : null,
  };

  return {
    pop: () => popState(state),
  };
}
