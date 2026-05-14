import {
  CellProps,
  SudokuValue,
  SupportedBoardSize,
  SUPPORTED_BOARD_SIZES,
} from "../../Types";
import {
  getPuzzle,
  getPuzzleString,
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
  ALL_ADDITIONAL_BOARDS,
  ALL_ADDITIONAL_SOLUTIONS,
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
 * Runtime puzzle-string fixtures include deliberate non-API inputs for parser tests.
 */
type RuntimePuzzleStringFixture =
  | string
  | RuntimeTestObject
  | number
  | boolean
  | null
  | undefined;

/**
 * Runtime numeric puzzle fixtures include deliberate non-API inputs for stringifier tests.
 */
type RuntimeNumericPuzzleFixture =
  | SudokuValue[][]
  | RuntimeTestObject
  | Array<SudokuValue[] | string>;

/**
 * Converts a numeric board into the expected public puzzle shape.
 */
function createExpectedPuzzleFromNumbers(grid: SudokuValue[][]): CellProps[][] {
  return grid.map((row: SudokuValue[]) =>
    row.map((value: SudokuValue) => {
      if (value === 0) {
        return { type: "note", notes: [] };
      }

      return { type: "given", value };
    })
  );
}

/**
 * Converts public puzzle cells back into the numeric fixture shape.
 */
function createNumbersFromPuzzle(puzzle: CellProps[][]): SudokuValue[][] {
  return puzzle.map((row: CellProps[]) =>
    row.map((cell: CellProps) => (cell.type === "note" ? 0 : cell.value))
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
  const puzzle = getPuzzle(getPuzzleString(solution));

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
function getThrownError(call: () => void, functionName: string): Error {
  try {
    call();
  } catch (error) {
    return error as Error;
  }

  throw new Error(`Expected ${functionName} to throw.`);
}

/**
 * Asserts the typed error contract and selected message details for validation failures.
 */
function expectValidationError(
  call: () => void,
  functionName: string,
  code: PuzzleValidationErrorCode,
  messageParts: string[]
): void {
  const error: Error = getThrownError(call, functionName);

  expect(error).toBeInstanceOf(PuzzleValidationError);
  expect((error as PuzzleValidationError).code).toBe(code);

  for (const messagePart of messageParts) {
    expect((error as PuzzleValidationError).message).toContain(messagePart);
  }
}

/**
 * Asserts the typed error contract and selected message details for puzzle failures.
 */
function expectPuzzleError(
  puzzle: RuntimePuzzleFixture,
  code: PuzzleValidationErrorCode,
  messageParts: string[]
): void {
  expectValidationError(
    () => getPuzzleSolution(puzzle as CellProps[][]),
    "getPuzzleSolution",
    code,
    messageParts
  );
}

/**
 * Asserts the typed error contract and selected message details for parser failures.
 */
function expectGetPuzzleError(
  puzzle: RuntimePuzzleStringFixture,
  code: PuzzleValidationErrorCode,
  messageParts: string[]
): void {
  expectValidationError(() => getPuzzle(puzzle as string), "getPuzzle", code, messageParts);
}

/**
 * Asserts the typed error contract and selected message details for stringifier failures.
 */
function expectGetPuzzleStringError(
  puzzle: RuntimeNumericPuzzleFixture,
  code: PuzzleValidationErrorCode,
  messageParts: string[]
): void {
  expectValidationError(
    () => getPuzzleString(puzzle as SudokuValue[][]),
    "getPuzzleString",
    code,
    messageParts
  );
}

describe("getPuzzleString", () => {
  it.each(SUPPORTED_BOARD_SIZES.map((size: SupportedBoardSize) => [size, size] as const))(
    "stringifies a %ix%i solved test board",
    (size: SupportedBoardSize) => {
      const puzzle: SudokuValue[][] = SOLVED_TEST_BOARDS[size];

      expect(getPuzzleString(puzzle)).toBe(puzzle.flat().join(""));
    }
  );

  it("stringifies additional 9x9 boards with empty cells", () => {
    for (const puzzle of ADDITIONAL_SOLVABLE_PUZZLES) {
      expect(getPuzzleString(puzzle)).toBe(puzzle.flat().join(""));
    }
  });

  it("throws INVALID_PUZZLE_SHAPE for non-array puzzles", () => {
    expectGetPuzzleStringError(
      { puzzle: [[0]] },
      PuzzleValidationErrorCode.INVALID_PUZZLE_SHAPE,
      ["non-empty square matrix"]
    );
  });

  it("throws INVALID_PUZZLE_SHAPE for empty puzzles", () => {
    expectGetPuzzleStringError([], PuzzleValidationErrorCode.INVALID_PUZZLE_SHAPE, [
      "non-empty square matrix",
    ]);
  });

  it("throws INVALID_PUZZLE_SHAPE when a row is not an array", () => {
    const puzzle: Array<SudokuValue[] | string> = [
      [0, 0],
      "not a row",
    ];

    expectGetPuzzleStringError(puzzle, PuzzleValidationErrorCode.INVALID_PUZZLE_SHAPE, [
      "non-empty square matrix",
      "Row 2",
      "not an array",
    ]);
  });

  it("throws INVALID_PUZZLE_SHAPE for ragged puzzles", () => {
    expectGetPuzzleStringError(
      [
        [0, 0],
        [0],
      ],
      PuzzleValidationErrorCode.INVALID_PUZZLE_SHAPE,
      ["non-empty square matrix", "Row 2", "length 1"]
    );
  });

  it("throws UNSUPPORTED_BOARD_SIZE for unsupported square sizes", () => {
    expectGetPuzzleStringError(
      [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
      ],
      PuzzleValidationErrorCode.UNSUPPORTED_BOARD_SIZE,
      ["Unsupported board size 3", "1, 2, 4, 6, 8, 9"]
    );
  });

  it("throws UNSUPPORTED_BOARD_SIZE before validating unsupported-size cells", () => {
    expectGetPuzzleStringError(
      [
        [10, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
      ],
      PuzzleValidationErrorCode.UNSUPPORTED_BOARD_SIZE,
      ["Unsupported board size 3", "1, 2, 4, 6, 8, 9"]
    );
  });

  it("throws INVALID_CELL_VALUE for digits outside the board range", () => {
    expectGetPuzzleStringError(
      [
        [5, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      PuzzleValidationErrorCode.INVALID_CELL_VALUE,
      ["row 1, column 1", '"5"', "between 1 and 4"]
    );
  });

  it("throws INVALID_CELL_VALUE for sparse row holes", () => {
    const puzzle: SudokuValue[][] = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    delete puzzle[1][2];

    expectGetPuzzleStringError(puzzle, PuzzleValidationErrorCode.INVALID_CELL_VALUE, [
      "row 2, column 3",
      "undefined",
      "between 0 and 4",
    ]);
  });

  it("throws DUPLICATE_VALUE_IN_ROW for repeated row values", () => {
    expectGetPuzzleStringError(
      [
        [1, 0, 1, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      PuzzleValidationErrorCode.DUPLICATE_VALUE_IN_ROW,
      ["Duplicate value 1", "row 1"]
    );
  });

  it("throws DUPLICATE_VALUE_IN_COLUMN for repeated column values", () => {
    expectGetPuzzleStringError(
      [
        [1, 0, 0, 0],
        [0, 0, 0, 0],
        [1, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      PuzzleValidationErrorCode.DUPLICATE_VALUE_IN_COLUMN,
      ["Duplicate value 1", "column 1"]
    );
  });

  it("throws DUPLICATE_VALUE_IN_BOX for repeated box values", () => {
    expectGetPuzzleStringError(
      [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      PuzzleValidationErrorCode.DUPLICATE_VALUE_IN_BOX,
      ["Duplicate value 1", "row 1, column 1"]
    );
  });
});

describe("getPuzzle", () => {
  it.each(SUPPORTED_BOARD_SIZES.map((size: SupportedBoardSize) => [size, size] as const))(
    "parses a %ix%i solved test board",
    (size: SupportedBoardSize) => {
      const board: SudokuValue[][] = SOLVED_TEST_BOARDS[size];

      expect(getPuzzle(getPuzzleString(board))).toEqual(
        createExpectedPuzzleFromNumbers(board)
      );
    }
  );

  it("parses additional 9x9 boards with empty cells", () => {
    for (const board of ADDITIONAL_SOLVABLE_PUZZLES) {
      expect(getPuzzle(getPuzzleString(board))).toEqual(
        createExpectedPuzzleFromNumbers(board)
      );
    }
  });

  it("maps zeros to empty note cells and placed digits to givens", () => {
    expect(getPuzzle("1034000000000000")[0]).toEqual([
      { type: "given", value: 1 },
      { type: "note", notes: [] },
      { type: "given", value: 3 },
      { type: "given", value: 4 },
    ]);
  });

  it("round-trips every board fixture without mutating inputs", () => {
    const boards: SudokuValue[][][] = [
      ...Object.values(SOLVED_TEST_BOARDS),
      ...ALL_ADDITIONAL_BOARDS,
      ...ALL_ADDITIONAL_SOLUTIONS,
    ];

    for (const board of boards) {
      const originalBoard = structuredClone(board);

      // First direction: numeric fixture board -> compact public puzzle string.
      const puzzleString = getPuzzleString(board);

      expect(board).toEqual(originalBoard);

      // Second direction: compact puzzle string -> public CellProps[][] puzzle.
      const parsedPuzzle = getPuzzle(puzzleString);
      const parsedPuzzleSnapshot = structuredClone(parsedPuzzle);

      // Convert parsed cells back to fixture numbers so we can run the inverse API again.
      const parsedBoard = createNumbersFromPuzzle(parsedPuzzle);
      const parsedBoardSnapshot = structuredClone(parsedBoard);

      expect(parsedPuzzle).toEqual(createExpectedPuzzleFromNumbers(board));
      expect(getPuzzleString(parsedBoard)).toBe(puzzleString);

      // Neither public conversion API should mutate caller-owned input.
      expect(board).toEqual(originalBoard);
      expect(parsedPuzzle).toEqual(parsedPuzzleSnapshot);
      expect(parsedBoard).toEqual(parsedBoardSnapshot);
    }
  });

  it("throws INVALID_PUZZLE_SHAPE for non-string puzzle input", () => {
    expectGetPuzzleError(
      { puzzle: "0" },
      PuzzleValidationErrorCode.INVALID_PUZZLE_SHAPE,
      ["Puzzle string", "Received", '{"puzzle":"0"}']
    );
  });

  it("throws INVALID_PUZZLE_SHAPE for empty puzzle strings", () => {
    expectGetPuzzleError("", PuzzleValidationErrorCode.INVALID_PUZZLE_SHAPE, [
      "must not be empty",
    ]);
  });

  it("throws INVALID_PUZZLE_SHAPE for non-square puzzle string lengths", () => {
    expectGetPuzzleError("000", PuzzleValidationErrorCode.INVALID_PUZZLE_SHAPE, [
      "length 3",
      "square board",
    ]);
  });

  it("throws UNSUPPORTED_BOARD_SIZE for unsupported square puzzle strings", () => {
    expectGetPuzzleError("0".repeat(9), PuzzleValidationErrorCode.UNSUPPORTED_BOARD_SIZE, [
      "Unsupported board size 3",
      "1, 2, 4, 6, 8, 9",
    ]);
  });

  it("throws UNSUPPORTED_BOARD_SIZE before validating unsupported-size characters", () => {
    expectGetPuzzleError("x00000000", PuzzleValidationErrorCode.UNSUPPORTED_BOARD_SIZE, [
      "Unsupported board size 3",
      "1, 2, 4, 6, 8, 9",
    ]);
  });

  it("throws INVALID_CELL_VALUE for non-digit puzzle string values", () => {
    expectGetPuzzleError("x000000000000000", PuzzleValidationErrorCode.INVALID_CELL_VALUE, [
      "row 1, column 1",
      '"x"',
      "between 1 and 4",
    ]);
  });

  it("throws INVALID_CELL_VALUE for digits outside the inferred board range", () => {
    expectGetPuzzleError("5000000000000000", PuzzleValidationErrorCode.INVALID_CELL_VALUE, [
      "row 1, column 1",
      '"5"',
      "between 1 and 4",
    ]);
  });

  it("throws DUPLICATE_VALUE_IN_ROW for repeated row values", () => {
    expectGetPuzzleError("1010000000000000", PuzzleValidationErrorCode.DUPLICATE_VALUE_IN_ROW, [
      "Duplicate value 1",
      "row 1",
    ]);
  });

  it("throws DUPLICATE_VALUE_IN_COLUMN for repeated column values", () => {
    expectGetPuzzleError(
      "1000000010000000",
      PuzzleValidationErrorCode.DUPLICATE_VALUE_IN_COLUMN,
      ["Duplicate value 1", "column 1"]
    );
  });

  it("throws DUPLICATE_VALUE_IN_BOX for repeated box values", () => {
    expectGetPuzzleError("1000010000000000", PuzzleValidationErrorCode.DUPLICATE_VALUE_IN_BOX, [
      "Duplicate value 1",
      "row 1, column 1",
    ]);
  });
});

describe("getPuzzleSolution", () => {
  it.each(SUPPORTED_BOARD_SIZES.map((size: SupportedBoardSize) => [size, size] as const))(
    "solves a %ix%i puzzle with a single note cell",
    (size: SupportedBoardSize) => {
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
    const puzzle = getPuzzle(getPuzzleString(SOLVED_TEST_BOARDS[4]));

    expectPuzzleError(puzzle, PuzzleValidationErrorCode.BOARD_ALREADY_SOLVED, [
      "already solved",
    ]);
  });

  it("throws UNSOLVABLE for puzzles with no valid solutions", () => {
    const puzzle = getPuzzle(getPuzzleString([
      [0, 0, 1, 4],
      [3, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]));

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
      const puzzle = getPuzzle(
        getPuzzleString(ADDITIONAL_SOLVABLE_PUZZLES[index])
      );
      const expectedSolution = ADDITIONAL_SOLVABLE_SOLUTIONS[index];
      expect(getPuzzleSolution(puzzle)).toEqual(expectedSolution);
    }
  });

});
