import { SUDOKU_STRATEGY_ARRAY } from "./Types";
import type {
  CellLocation,
  CellProps,
  NoteCellWithLocation,
  SudokuNumber,
  SudokuStrategy,
} from "./Types";

type SudokuVisionItem = readonly [
  strategy: SudokuStrategy,
  locationToCheck: CellLocation
];

type StrategyLocationGeneratorFactory = (
  puzzle: readonly (readonly CellProps[])[],
  solution: readonly (readonly SudokuNumber[])[]
) => Generator<CellLocation, void, void>;

export interface SudokuVision
  extends Generator<SudokuVisionItem, void, void> {}

/**
 * Lazily yields wrong user values in row-major order.
 */
function* generateWrongValueLocations(
  puzzle: readonly (readonly CellProps[])[],
  solution: readonly (readonly SudokuNumber[])[]
): Generator<CellLocation, void> {
  for (let r = 0; r < puzzle.length; r += 1) {
    for (let c = 0; c < puzzle[r].length; c += 1) {
      const cell = puzzle[r][c];

      if (cell.type === "value" && cell.value !== solution[r][c]) {
        yield { r, c };
      }
    }
  }
}

/**
 * Lazily yields note cells missing their solution value in row-major order.
 */
function* generateAmendNotesLocations(
  puzzle: readonly (readonly CellProps[])[],
  solution: readonly (readonly SudokuNumber[])[]
): Generator<CellLocation, void> {
  for (let r = 0; r < puzzle.length; r += 1) {
    for (let c = 0; c < puzzle[r].length; c += 1) {
      const cell = puzzle[r][c];

      if (
        cell.type === "note" &&
        !cell.notes.includes(solution[r][c])
      ) {
        yield { r, c };
      }
    }
  }
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
 * Lazily yields valid one-note cells from the note-count scan order.
 */
function* generateObviousSingleLocations(
  puzzle: readonly (readonly CellProps[])[],
  solution: readonly (readonly SudokuNumber[])[]
): Generator<CellLocation, void> {
  for (const { r, c, notes } of createNoteCellsByNoteCount(puzzle)) {
    if (notes.length > 1) {
      break;
    }

    if (notes.length === 1 && notes[0] === solution[r][c]) {
      yield { r, c };
    }
  }
}

const STRATEGY_LOCATION_GENERATOR_FACTORIES: Record<
  SudokuStrategy,
  StrategyLocationGeneratorFactory
> = {
  WRONG_VALUE: generateWrongValueLocations,
  AMEND_NOTES: generateAmendNotesLocations,
  OBVIOUS_SINGLE: generateObviousSingleLocations,
};

/**
 * Yields each strategy and location check in deterministic vision order.
 */
function* generateSudokuVision(
  puzzle: readonly (readonly CellProps[])[],
  solution: readonly (readonly SudokuNumber[])[],
  strategyPriority: readonly SudokuStrategy[]
): SudokuVision {
  for (const strategy of strategyPriority) {
    const generateLocations =
      STRATEGY_LOCATION_GENERATOR_FACTORIES[strategy];

    for (const locationToCheck of generateLocations(puzzle, solution)) {
      yield [strategy, locationToCheck];
    }
  }
}

/**
 * Creates a lazy vision generator that prioritizes strategy and location checks.
 */
export function createSudokuVision(
  puzzle: readonly (readonly CellProps[])[],
  solution: readonly (readonly SudokuNumber[])[],
  strategies?: readonly SudokuStrategy[]
): SudokuVision {
  return generateSudokuVision(
    puzzle,
    solution,
    strategies ?? SUDOKU_STRATEGY_ARRAY
  );
}
