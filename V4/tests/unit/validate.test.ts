import { CellProps } from "../../Types";
import {
  BOX_LAYOUTS,
  getPuzzleSolution,
  PuzzleValidationError,
  PuzzleValidationErrorCode,
  SUPPORTED_BOARD_SIZES,
} from "../../validate";

type SupportedBoardSize = (typeof SUPPORTED_BOARD_SIZES)[number];

function createPlacedCell(rowIndex: number, columnIndex: number, value: number): CellProps {
  return (rowIndex + columnIndex) % 2 === 0
    ? { type: "given", value }
    : { type: "value", value };
}

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

function createSolvedPuzzle(grid: number[][]): CellProps[][] {
  return grid.map((row, rowIndex) =>
    row.map((value, columnIndex) => createPlacedCell(rowIndex, columnIndex, value))
  );
}

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

function createEmptyPuzzle(size: number): CellProps[][] {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ({ type: "note", notes: [] }))
  );
}

function getThrownError(call: () => unknown): unknown {
  try {
    call();
  } catch (error) {
    return error;
  }

  throw new Error("Expected getPuzzleSolution to throw.");
}

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
});
