import { Queue } from "data-structure-typed";
import { SUDOKU_STRATEGY_ARRAY } from "./Types";
import type {
  CellLocation,
  CellProps,
  NoteCellWithLocation,
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
  amendNotesQueue: Queue<CellLocation> | null;
  noteCellsByNoteCount: readonly NoteCellWithLocation[];
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
 * Builds the row-major queue of note cells missing their solution value.
 */
function createAmendNotesQueue(
  puzzle: readonly (readonly CellProps[])[],
  solution: readonly (readonly SudokuNumber[])[]
): Queue<CellLocation> {
  const queue = new Queue<CellLocation>();

  for (let r = 0; r < puzzle.length; r += 1) {
    for (let c = 0; c < puzzle[r].length; c += 1) {
      const cell = puzzle[r][c];

      if (
        cell.type === "note" &&
        !cell.notes.includes(solution[r][c])
      ) {
        queue.push({ r, c });
      }
    }
  }

  return queue;
}

/**
 * Builds a reusable scan order of all note cells from fewest to most notes.
 * Ties retain deterministic row-major order.
 */
function createNoteCellsByNoteCount(
  puzzle: readonly (readonly CellProps[])[]
): readonly NoteCellWithLocation[] {
  const noteCells: NoteCellWithLocation[] = [];

  for (let r = 0; r < puzzle.length; r += 1) {
    for (let c = 0; c < puzzle[r].length; c += 1) {
      const cell = puzzle[r][c];

      if (cell.type === "note") {
        noteCells.push({
          ...cell,
          notes: [...cell.notes],
          r,
          c,
        });
      }
    }
  }

  return noteCells.sort(
    (first, second) =>
      first.notes.length - second.notes.length ||
      first.r - second.r ||
      first.c - second.c
  );
}

/**
 * Removes and identifies the next location from a strategy queue.
 */
function popQueue(
  strategy: SudokuStrategy,
  queue: Queue<CellLocation> | null
): SudokuVisionQueueItem | null {
  const locationToCheck = queue?.shift();

  return locationToCheck
    ? [strategy, locationToCheck]
    : null;
}

/**
 * Removes the next check from the queue for the current strategy.
 */
function popState(state: SudokuVisionState): SudokuVisionQueueItem | null {
  const currentStrategy =
    state.strategyPriority[state.currentStrategyIndex] ?? null;

  if (
    currentStrategy === "WRONG_VALUE" &&
    (state.wrongValueQueue === null || state.wrongValueQueue.isEmpty())
  ) {
    state.currentStrategyIndex += 1;
    return popState(state);
  }

  if (
    currentStrategy === "AMEND_NOTES" &&
    (state.amendNotesQueue === null || state.amendNotesQueue.isEmpty())
  ) {
    state.currentStrategyIndex += 1;
    return popState(state);
  }

  if (currentStrategy === "WRONG_VALUE") {
    return popQueue("WRONG_VALUE", state.wrongValueQueue);
  }

  if (currentStrategy === "AMEND_NOTES") {
    return popQueue("AMEND_NOTES", state.amendNotesQueue);
  }

  return null;
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
    amendNotesQueue: strategyPriority.includes("AMEND_NOTES")
      ? createAmendNotesQueue(puzzle, solution)
      : null,
    noteCellsByNoteCount: createNoteCellsByNoteCount(puzzle),
  };

  return {
    pop: () => popState(state),
  };
}
