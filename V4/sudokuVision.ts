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

type StrategyQueueFactory = (
  state: SudokuVisionState
) => Queue<CellLocation>;

type SudokuVisionState = {
  puzzle: readonly (readonly CellProps[])[];
  solution: readonly (readonly SudokuNumber[])[];
  strategyPriority: readonly SudokuStrategy[];
  currentStrategyIndex: number;
  strategyQueues: Partial<
    Record<SudokuStrategy, Queue<CellLocation> | null>
  >;
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
 * Builds a queue of valid one-note cells from the shared note-count scan order.
 */
function createObviousSingleQueue(
  noteCellsByNoteCount: readonly NoteCellWithLocation[],
  solution: readonly (readonly SudokuNumber[])[]
): Queue<CellLocation> {
  const queue = new Queue<CellLocation>();

  for (const { r, c, notes } of noteCellsByNoteCount) {
    if (notes.length > 1) {
      break;
    }

    if (notes.length === 1 && notes[0] === solution[r][c]) {
      queue.push({ r, c });
    }
  }

  return queue;
}

const STRATEGY_QUEUE_FACTORIES: Partial<
  Record<SudokuStrategy, StrategyQueueFactory>
> = {
  WRONG_VALUE: (state) =>
    createWrongValueQueue(state.puzzle, state.solution),
  AMEND_NOTES: (state) =>
    createAmendNotesQueue(state.puzzle, state.solution),
  OBVIOUS_SINGLE: (state) =>
    createObviousSingleQueue(
      state.noteCellsByNoteCount,
      state.solution
    ),
};

/**
 * Removes and identifies the next location from a strategy queue.
 */
function popQueue(
  strategy: SudokuStrategy,
  queue: Queue<CellLocation>
): SudokuVisionQueueItem {
  return [strategy, queue.shift()!];
}

/**
 * Lazily creates, advances, or pops one strategy's queue.
 */
function popStrategyQueue(
  state: SudokuVisionState,
  strategy: SudokuStrategy,
  createQueue: StrategyQueueFactory
): SudokuVisionQueueItem | null {
  let queue = state.strategyQueues[strategy];

  if (queue === null || queue === undefined) {
    queue = createQueue(state);
    state.strategyQueues[strategy] = queue;
  }

  if (queue.isEmpty()) {
    state.currentStrategyIndex += 1;
    return popState(state);
  }

  return popQueue(strategy, queue);
}

/**
 * Removes the next check from the queue for the current strategy.
 */
function popState(state: SudokuVisionState): SudokuVisionQueueItem | null {
  const currentStrategy =
    state.strategyPriority[state.currentStrategyIndex] ?? null;

  if (currentStrategy === null) {
    return null;
  }

  const createQueue = STRATEGY_QUEUE_FACTORIES[currentStrategy];

  if (createQueue) {
    return popStrategyQueue(state, currentStrategy, createQueue);
  }

  state.currentStrategyIndex += 1;
  return popState(state);
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
    puzzle,
    solution,
    strategyPriority,
    currentStrategyIndex: 0,
    strategyQueues: {},
    noteCellsByNoteCount: createNoteCellsByNoteCount(puzzle),
  };

  return {
    pop: () => popState(state),
  };
}
