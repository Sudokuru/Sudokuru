import { CellProps } from "../../Types";
import {
  getPuzzleSolution,
  PuzzleValidationError,
  PuzzleValidationErrorCode,
  SupportedBoardSize,
  SUPPORTED_BOARD_SIZES,
} from "../../validate";
import {
  MISLEADING_NOTE_PATCH_4X4,
  SINGLE_NOTE_PATCH_BY_SIZE,
  SOLVED_TEST_BOARDS,
  TestBoardCellPatch,
} from "./testBoards";
import {
  ADDITIONAL_SOLVABLE_PUZZLES,
  ADDITIONAL_SOLVABLE_SOLUTIONS,
} from "./additionalBoards";

/**
 * Converts a numeric board into puzzle cells where `0` becomes an empty note cell.
 * TODO: delete this function and replace usage with getPuzzle helper function once it is implemented
 */
function createPuzzleFromNumbers(grid: number[][]): CellProps[][] {
  return grid.map((row) =>
    row.map((value) => {
      if (value === 0) {
        return { type: "note", notes: [] };
      }

      return { type: "given", value };
    })
  );
}

/**
 * Applies static cell patches on top of a solved test board and returns puzzle + solution.
 */
function createPatchedPuzzleFromSolvedBoard(
  size: SupportedBoardSize,
  patches: TestBoardCellPatch[]
): { puzzle: CellProps[][]; solution: number[][] } {
  const solution = SOLVED_TEST_BOARDS[size];
  const puzzle = createPuzzleFromNumbers(solution);

  for (const patch of patches) {
    puzzle[patch.row][patch.column] = patch.cell;
  }

  return { puzzle, solution };
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
      const { puzzle, solution } = createPatchedPuzzleFromSolvedBoard(
        size,
        SINGLE_NOTE_PATCH_BY_SIZE[size]
      );

      expect(getPuzzleSolution(puzzle)).toEqual(solution);
    }
  );

  it("ignores note contents while solving", () => {
    const { puzzle, solution } = createPatchedPuzzleFromSolvedBoard(
      4,
      MISLEADING_NOTE_PATCH_4X4
    );

    expect(solution[0][1]).toBe(2);
    expect(getPuzzleSolution(puzzle)).toEqual(solution);
  });

  it("does not mutate the input puzzle", () => {
    const { puzzle } = createPatchedPuzzleFromSolvedBoard(6, SINGLE_NOTE_PATCH_BY_SIZE[6]);
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

  it("throws INVALID_CELL_TYPE for sparse row holes", () => {
    const puzzle = createEmptyPuzzle(4);
    delete (puzzle as unknown as Array<Array<unknown>>)[1][2];

    expectPuzzleError(puzzle, PuzzleValidationErrorCode.INVALID_CELL_TYPE, [
      "row 2, column 3",
      "undefined",
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
    const puzzle = createPuzzleFromNumbers(SOLVED_TEST_BOARDS[4]);

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

  it("solves every additional solvable board to the expected solution", () => {
    expect(ADDITIONAL_SOLVABLE_PUZZLES.length).toBe(ADDITIONAL_SOLVABLE_SOLUTIONS.length);

    for (let index = 0; index < ADDITIONAL_SOLVABLE_PUZZLES.length; index += 1) {
      const puzzle = createPuzzleFromNumbers(ADDITIONAL_SOLVABLE_PUZZLES[index]);
      const expectedSolution = ADDITIONAL_SOLVABLE_SOLUTIONS[index];
      expect(getPuzzleSolution(puzzle)).toEqual(expectedSolution);
    }
  });

});
