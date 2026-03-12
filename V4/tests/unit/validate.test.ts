import { CellProps } from "../../Types";
import {
  BOX_LAYOUTS,
  getPuzzleSolution,
  PuzzleValidationError,
  PuzzleValidationErrorCode,
  SUPPORTED_BOARD_SIZES,
} from "../../validate";

type SupportedBoardSize = (typeof SUPPORTED_BOARD_SIZES)[number];

/**
 * Alternates `given` and `value` cells so tests exercise both placed-cell variants.
 */
function createPlacedCell(rowIndex: number, columnIndex: number, value: number): CellProps {
  return (rowIndex + columnIndex) % 2 === 0
    ? { type: "given", value }
    : { type: "value", value };
}

/**
 * Builds a valid solved board for each supported size using a closed-form Sudoku pattern.
 *
 * The tests intentionally keep this generator separate from production code so the
 * expected solutions do not rely on solver internals.
 */
function generateSolvedGrid(size: SupportedBoardSize): number[][] {
  const { boxHeight, boxWidth } = BOX_LAYOUTS[size];

  return Array.from({ length: size }, (_, rowIndex) =>
    Array.from(
      { length: size },
      (_, columnIndex) =>
        ((boxWidth * (rowIndex % boxHeight) +
          Math.floor(rowIndex / boxHeight) +
          columnIndex) %
          size) +
        1
    )
  );
}

/**
 * Converts a solved numeric board into placed `CellProps`.
 */
function createSolvedPuzzle(grid: number[][]): CellProps[][] {
  return grid.map((row, rowIndex) =>
    row.map((value, columnIndex) => createPlacedCell(rowIndex, columnIndex, value))
  );
}

/**
 * Creates an almost-solved puzzle with exactly one note cell and the matching solution.
 */
function createPuzzleWithSingleNote(
  size: SupportedBoardSize,
  noteRow = size - 1,
  noteColumn = size - 1,
  noteValues?: number[]
): { puzzle: CellProps[][]; solution: number[][] } {
  const solution = generateSolvedGrid(size);
  const fallbackNotes = [solution[noteRow][noteColumn]];

  const puzzle = solution.map((row, rowIndex) =>
    row.map((value, columnIndex) => {
      if (rowIndex === noteRow && columnIndex === noteColumn) {
        return {
          type: "note" as const,
          notes: noteValues ?? fallbackNotes,
        };
      }

      return createPlacedCell(rowIndex, columnIndex, value);
    })
  );

  return { puzzle, solution };
}

/**
 * Converts a numeric board into puzzle cells where `0` becomes an empty note cell.
 */
function createPuzzleFromNumbers(grid: number[][]): CellProps[][] {
  return grid.map((row, rowIndex) =>
    row.map((value, columnIndex) => {
      if (value === 0) {
        return { type: "note", notes: [] };
      }

      return createPlacedCell(rowIndex, columnIndex, value);
    })
  );
}

/**
 * Creates an all-empty puzzle for shape, size, and ambiguity tests.
 */
function createEmptyPuzzle(size: number): CellProps[][] {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ({ type: "note", notes: [] }))
  );
}

/**
 * Captures the thrown error from a synchronous call or fails if nothing was thrown.
 */
function getThrownError(call: () => unknown): unknown {
  try {
    call();
  } catch (error) {
    return error;
  }

  throw new Error("Expected getPuzzleSolution to throw.");
}

/**
 * Asserts the typed error contract and selected message details for a puzzle failure.
 */
function expectPuzzleError(
  puzzle: CellProps[][],
  code: PuzzleValidationErrorCode,
  messageParts: string[]
): void {
  const error = getThrownError(() => getPuzzleSolution(puzzle));

  expect(error).toBeInstanceOf(PuzzleValidationError);
  expect((error as PuzzleValidationError).code).toBe(code);

  for (const messagePart of messageParts) {
    expect((error as PuzzleValidationError).message).toContain(messagePart);
  }
}

describe("getPuzzleSolution", () => {
  it.each(SUPPORTED_BOARD_SIZES)(
    "solves a %ix%i puzzle with a single note cell",
    (size) => {
      const { puzzle, solution } = createPuzzleWithSingleNote(size);

      expect(getPuzzleSolution(puzzle)).toEqual(solution);
    }
  );

  it("ignores note contents while solving", () => {
    const { puzzle, solution } = createPuzzleWithSingleNote(4, 0, 1, [1]);

    expect(solution[0][1]).toBe(2);
    expect(getPuzzleSolution(puzzle)).toEqual(solution);
  });

  it("does not mutate the input puzzle", () => {
    const { puzzle } = createPuzzleWithSingleNote(6);
    const originalPuzzle = structuredClone(puzzle);

    getPuzzleSolution(puzzle);

    expect(puzzle).toEqual(originalPuzzle);
  });

  it("throws INVALID_PUZZLE_SHAPE for ragged puzzles", () => {
    const puzzle = createEmptyPuzzle(4);
    const raggedPuzzle = [
      puzzle[0],
      puzzle[1],
      puzzle[2].slice(0, 3),
      puzzle[3],
    ] as unknown as CellProps[][];

    expectPuzzleError(raggedPuzzle, PuzzleValidationErrorCode.INVALID_PUZZLE_SHAPE, [
      "non-empty square matrix",
      "Row 3",
      "length 3",
    ]);
  });

  it("throws UNSUPPORTED_BOARD_SIZE for unsupported square sizes", () => {
    expectPuzzleError(
      createEmptyPuzzle(5),
      PuzzleValidationErrorCode.UNSUPPORTED_BOARD_SIZE,
      ["Unsupported board size 5", "1, 2, 4, 6, 8, 9"]
    );
  });

  it("throws INVALID_CELL_TYPE for runtime-invalid cell objects", () => {
    const puzzle = createEmptyPuzzle(4);
    (puzzle as unknown as Array<Array<unknown>>)[1][2] = { type: "mystery" };

    expectPuzzleError(puzzle, PuzzleValidationErrorCode.INVALID_CELL_TYPE, [
      "row 2, column 3",
      '"mystery"',
      '"note", "value", or "given"',
    ]);
  });

  it("throws INVALID_CELL_VALUE for placed values outside the allowed range", () => {
    const puzzle = createEmptyPuzzle(4);
    puzzle[0][0] = { type: "given", value: 5 };

    expectPuzzleError(puzzle, PuzzleValidationErrorCode.INVALID_CELL_VALUE, [
      "row 1, column 1",
      "5",
      "between 1 and 4",
    ]);
  });

  it("throws INVALID_NOTE_VALUE for duplicate or out-of-range notes", () => {
    const puzzle = createEmptyPuzzle(4);
    puzzle[0][0] = { type: "note", notes: [1, 1, 5] };

    expectPuzzleError(puzzle, PuzzleValidationErrorCode.INVALID_NOTE_VALUE, [
      "row 1, column 1",
      "[1,1,5]",
      "unique integers between 1 and 4",
    ]);
  });

  it("throws DUPLICATE_VALUE_IN_ROW for repeated row values", () => {
    const puzzle = createEmptyPuzzle(4);
    puzzle[0][0] = { type: "given", value: 1 };
    puzzle[0][2] = { type: "value", value: 1 };

    expectPuzzleError(puzzle, PuzzleValidationErrorCode.DUPLICATE_VALUE_IN_ROW, [
      "Duplicate value 1",
      "row 1",
    ]);
  });

  it("throws DUPLICATE_VALUE_IN_COLUMN for repeated column values", () => {
    const puzzle = createEmptyPuzzle(4);
    puzzle[0][0] = { type: "given", value: 1 };
    puzzle[2][0] = { type: "value", value: 1 };

    expectPuzzleError(puzzle, PuzzleValidationErrorCode.DUPLICATE_VALUE_IN_COLUMN, [
      "Duplicate value 1",
      "column 1",
    ]);
  });

  it("throws DUPLICATE_VALUE_IN_BOX for repeated box values", () => {
    const puzzle = createEmptyPuzzle(4);
    puzzle[0][0] = { type: "given", value: 1 };
    puzzle[1][1] = { type: "value", value: 1 };

    expectPuzzleError(puzzle, PuzzleValidationErrorCode.DUPLICATE_VALUE_IN_BOX, [
      "Duplicate value 1",
      "row 1, column 1",
    ]);
  });

  it("throws BOARD_ALREADY_SOLVED for solved puzzles", () => {
    const puzzle = createSolvedPuzzle(generateSolvedGrid(4));

    expectPuzzleError(puzzle, PuzzleValidationErrorCode.BOARD_ALREADY_SOLVED, [
      "already solved",
    ]);
  });

  it("throws UNSOLVABLE for puzzles with no valid solutions", () => {
    const puzzle = createPuzzleFromNumbers([
      [0, 0, 1, 4],
      [3, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);

    expectPuzzleError(puzzle, PuzzleValidationErrorCode.UNSOLVABLE, [
      "no valid solution",
    ]);
  });

  it("throws MULTIPLE_SOLUTIONS for puzzles with more than one valid solution", () => {
    expectPuzzleError(
      createEmptyPuzzle(4),
      PuzzleValidationErrorCode.MULTIPLE_SOLUTIONS,
      ["multiple valid solutions"]
    );
  });

  it("throws INTERNAL_ERROR when solver state becomes inconsistent", () => {
    const { puzzle } = createPuzzleWithSingleNote(4);
    const originalMap = Array.prototype.map;
    let numericBoardCloneCount = 0;

    // Force the second numeric board clone to fail so the solver records a solution count
    // without storing the solved grid. That exercises the invariant-violation branch
    // without changing the public API just for tests.
    Array.prototype.map = function patchedMap<T, U>(
      this: T[],
      callback: (value: T, index: number, array: T[]) => U,
      thisArg?: unknown
    ): U[] {
      const isNumericBoard =
        this.length > 0 &&
        Array.isArray(this[0]) &&
        this.every(
          (row) => Array.isArray(row) && row.every((value) => typeof value === "number")
        );

      if (isNumericBoard) {
        numericBoardCloneCount += 1;

        if (numericBoardCloneCount === 2) {
          return null as unknown as U[];
        }
      }

      return originalMap.call(this, callback, thisArg);
    };

    try {
      expectPuzzleError(puzzle, PuzzleValidationErrorCode.INTERNAL_ERROR, [
        "Internal solver error",
        "without capturing the solution grid",
      ]);
    } finally {
      Array.prototype.map = originalMap;
    }
  });
});
