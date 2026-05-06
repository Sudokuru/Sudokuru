import {
  CellProps,
  SupportedBoardSize,
  SUPPORTED_BOARD_SIZES,
} from "../../Types";
import {
  getPuzzleSolution,
  PuzzleValidationError,
  PuzzleValidationErrorCode,
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
 * Explicit runtime fixture type for values that intentionally violate CellProps.
 */
type RuntimeTestValue =
  | CellProps
  | RuntimeTestObject
  | RuntimeTestValue[]
  | string
  | number
  | boolean
  | null
  | undefined;

/**
 * Object shape used by malformed runtime fixtures in validation tests.
 */
type RuntimeTestObject = {
  puzzle?: RuntimeTestValue;
  type?: RuntimeTestValue;
  value?: RuntimeTestValue;
  notes?: RuntimeTestValue;
};

/**
 * Runtime puzzle fixtures include deliberate non-API inputs for validation tests.
 */
type RuntimePuzzleFixture = CellProps[][] | RuntimeTestObject | Array<CellProps[] | string>;

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
function getThrownError(call: () => void): Error {
  try {
    call();
  } catch (error) {
    return error as Error;
  }

  throw new Error("Expected getPuzzleSolution to throw.");
}

/**
 * Asserts the typed error contract and selected message details for a puzzle failure.
 */
function expectPuzzleError(
  puzzle: RuntimePuzzleFixture,
  code: PuzzleValidationErrorCode,
  messageParts: string[]
): void {
  const error: Error = getThrownError(() => {
    getPuzzleSolution(puzzle as CellProps[][]);
  });

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
    const raggedPuzzle: CellProps[][] = [
      puzzle[0],
      puzzle[1],
      puzzle[2].slice(0, 3),
      puzzle[3],
    ];

    expectPuzzleError(raggedPuzzle, PuzzleValidationErrorCode.INVALID_PUZZLE_SHAPE, [
      "non-empty square matrix",
      "Row 3",
      "length 3",
    ]);
  });

  it("throws INVALID_PUZZLE_SHAPE for non-array puzzles", () => {
    expectPuzzleError(
      { puzzle: createEmptyPuzzle(4) },
      PuzzleValidationErrorCode.INVALID_PUZZLE_SHAPE,
      ["non-empty square matrix"]
    );
  });

  it("throws INVALID_PUZZLE_SHAPE for empty puzzles", () => {
    expectPuzzleError([], PuzzleValidationErrorCode.INVALID_PUZZLE_SHAPE, [
      "non-empty square matrix",
    ]);
  });

  it("throws INVALID_PUZZLE_SHAPE when a row is not an array", () => {
    const puzzle: Array<CellProps[] | string> = createEmptyPuzzle(2);
    puzzle[1] = "not a row";

    expectPuzzleError(puzzle, PuzzleValidationErrorCode.INVALID_PUZZLE_SHAPE, [
      "non-empty square matrix",
      "Row 2",
      "not an array",
    ]);
  });

  it("throws UNSUPPORTED_BOARD_SIZE for unsupported square sizes", () => {
    expectPuzzleError(
      createEmptyPuzzle(5),
      PuzzleValidationErrorCode.UNSUPPORTED_BOARD_SIZE,
      ["Unsupported board size 5", "1, 2, 4, 6, 8, 9"]
    );
  });

  it("throws UNSUPPORTED_BOARD_SIZE before validating unsupported-size cells", () => {
    const puzzle = createEmptyPuzzle(5);
    const runtimePuzzle: RuntimeTestValue[][] = puzzle;
    runtimePuzzle[0][0] = { type: "mystery" };

    expectPuzzleError(puzzle, PuzzleValidationErrorCode.UNSUPPORTED_BOARD_SIZE, [
      "Unsupported board size 5",
      "1, 2, 4, 6, 8, 9",
    ]);
  });

  it("throws INVALID_CELL_TYPE for runtime-invalid cell objects", () => {
    const puzzle = createEmptyPuzzle(4);
    const runtimePuzzle: RuntimeTestValue[][] = puzzle;
    runtimePuzzle[1][2] = { type: "mystery" };

    expectPuzzleError(puzzle, PuzzleValidationErrorCode.INVALID_CELL_TYPE, [
      "row 2, column 3",
      '"mystery"',
      '"note", "value", or "given"',
    ]);
  });

  it("throws INVALID_CELL_TYPE for sparse row holes", () => {
    const puzzle = createEmptyPuzzle(4);
    const runtimePuzzle: RuntimeTestValue[][] = puzzle;
    delete runtimePuzzle[1][2];

    expectPuzzleError(puzzle, PuzzleValidationErrorCode.INVALID_CELL_TYPE, [
      "row 2, column 3",
      "undefined",
      '"note", "value", or "given"',
    ]);
  });

  it("throws INVALID_CELL_TYPE for runtime-invalid cell primitives", () => {
    const puzzle = createEmptyPuzzle(4);
    const runtimePuzzle: RuntimeTestValue[][] = puzzle;
    runtimePuzzle[0][1] = null;

    expectPuzzleError(puzzle, PuzzleValidationErrorCode.INVALID_CELL_TYPE, [
      "row 1, column 2",
      "null",
      '"note", "value", or "given"',
    ]);
  });

  it("throws INVALID_CELL_TYPE for runtime-invalid cell arrays", () => {
    const puzzle = createEmptyPuzzle(4);
    const runtimePuzzle: RuntimeTestValue[][] = puzzle;
    runtimePuzzle[2][3] = [];

    expectPuzzleError(puzzle, PuzzleValidationErrorCode.INVALID_CELL_TYPE, [
      "row 3, column 4",
      "[]",
      '"note", "value", or "given"',
    ]);
  });

  it.each([
    { value: undefined, detail: "undefined" },
    { value: 0, detail: "0" },
    { value: 1.5, detail: "1.5" },
    { value: 5, detail: "5" },
  ])("throws INVALID_CELL_VALUE for bad placed value $detail", ({ value, detail }) => {
    const puzzle = createEmptyPuzzle(4);
    const runtimePuzzle: RuntimeTestValue[][] = puzzle;
    runtimePuzzle[0][0] = { type: "given", value };

    expectPuzzleError(puzzle, PuzzleValidationErrorCode.INVALID_CELL_VALUE, [
      "row 1, column 1",
      detail,
      "between 1 and 4",
    ]);
  });

  it.each([
    { notes: "1,2", detail: '"1,2"' },
    { notes: [1, 1], detail: "[1,1]" },
    { notes: [0], detail: "[0]" },
    { notes: [1.5], detail: "[1.5]" },
    { notes: [5], detail: "[5]" },
  ])("throws INVALID_NOTE_VALUE for bad notes $detail", ({ notes, detail }) => {
    const puzzle = createEmptyPuzzle(4);
    const runtimePuzzle: RuntimeTestValue[][] = puzzle;
    runtimePuzzle[0][0] = { type: "note", notes };

    expectPuzzleError(puzzle, PuzzleValidationErrorCode.INVALID_NOTE_VALUE, [
      "row 1, column 1",
      detail,
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
