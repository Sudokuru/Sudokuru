import {
  BOX_LAYOUTS,
  BoxLayout,
  CellProps,
  SUPPORTED_BOARD_SIZES,
  SupportedBoardSize,
} from "./Types";

/**
 * Stable error codes returned by the validation/solving module.
 */
export enum PuzzleValidationErrorCode {
  INVALID_PUZZLE_SHAPE = "INVALID_PUZZLE_SHAPE",
  UNSUPPORTED_BOARD_SIZE = "UNSUPPORTED_BOARD_SIZE",
  INVALID_CELL_TYPE = "INVALID_CELL_TYPE",
  INVALID_CELL_VALUE = "INVALID_CELL_VALUE",
  INVALID_NOTE_VALUE = "INVALID_NOTE_VALUE",
  DUPLICATE_VALUE_IN_ROW = "DUPLICATE_VALUE_IN_ROW",
  DUPLICATE_VALUE_IN_COLUMN = "DUPLICATE_VALUE_IN_COLUMN",
  DUPLICATE_VALUE_IN_BOX = "DUPLICATE_VALUE_IN_BOX",
  BOARD_ALREADY_SOLVED = "BOARD_ALREADY_SOLVED",
  UNSOLVABLE = "UNSOLVABLE",
  MULTIPLE_SOLUTIONS = "MULTIPLE_SOLUTIONS",
}

/**
 * Error type thrown by validation and solving functions for user-facing failures.
 */
export class PuzzleValidationError extends Error {
  public readonly code: PuzzleValidationErrorCode;

  /**
   * Creates a typed validation error with a stable code and descriptive message.
   */
  constructor(code: PuzzleValidationErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = "PuzzleValidationError";
    Object.setPrototypeOf(this, PuzzleValidationError.prototype);
  }
}

/**
 * Parses a compact puzzle string into a fresh `CellProps[][]`.
 *
 * The board size is inferred from string length. A `0` creates an empty note cell,
 * and every placed digit creates a given cell.
 */
export function getPuzzle(puzzle: string): CellProps[][] {
  const size: number = getPuzzleStringSize(puzzle);

  if (!isSupportedBoardSize(size)) {
    throw new PuzzleValidationError(
      PuzzleValidationErrorCode.UNSUPPORTED_BOARD_SIZE,
      `Unsupported board size ${size}. Supported sizes are ${SUPPORTED_BOARD_SIZES.join(", ")}.`
    );
  }

  const layout: BoxLayout = getBoxLayout(size);
  const values: number[][] = parsePuzzleStringValues(puzzle, size);

  assertNoDuplicateValues(values, size, layout);

  return valuesToPuzzle(values);
}

/**
 * Validates and solves a puzzle represented as `CellProps[][]`.
 *
 * Notes are validated as user state but are not used as solver constraints.
 * The returned board is always a fresh `number[][]` instance.
 */
export function getPuzzleSolution(puzzle: CellProps[][]): number[][] {
  const size: number = getPuzzleSize(puzzle);

  if (!isSupportedBoardSize(size)) {
    throw new PuzzleValidationError(
      PuzzleValidationErrorCode.UNSUPPORTED_BOARD_SIZE,
      `Unsupported board size ${size}. Supported sizes are ${SUPPORTED_BOARD_SIZES.join(", ")}.`
    );
  }

  const layout: BoxLayout = getBoxLayout(size);
  const normalizedPuzzle: number[][] = normalizePuzzle(puzzle, size);

  assertNoDuplicateValues(normalizedPuzzle, size, layout);

  if (isSolved(normalizedPuzzle)) {
    throw new PuzzleValidationError(
      PuzzleValidationErrorCode.BOARD_ALREADY_SOLVED,
      "Puzzle is already solved."
    );
  }

  const solveState: SolveState = searchForSolutions(normalizedPuzzle, size, layout, 0, {
    solutionCount: 0,
    solution: null,
  });

  if (solveState.solutionCount === 0) {
    throw new PuzzleValidationError(
      PuzzleValidationErrorCode.UNSOLVABLE,
      "Puzzle has no valid solution."
    );
  }

  if (solveState.solutionCount > 1) {
    throw new PuzzleValidationError(
      PuzzleValidationErrorCode.MULTIPLE_SOLUTIONS,
      "Puzzle has multiple valid solutions."
    );
  }

  return solveState.solution;
}

/**
 * Validates that the input is a non-empty square matrix and returns its size.
 */
function getPuzzleSize(puzzle: CellProps[][]): number {
  if (!Array.isArray(puzzle) || puzzle.length === 0) {
    throw new PuzzleValidationError(
      PuzzleValidationErrorCode.INVALID_PUZZLE_SHAPE,
      "Puzzle must be a non-empty square matrix of CellProps rows."
    );
  }

  const size: number = puzzle.length;

  for (let rowIndex: number = 0; rowIndex < size; rowIndex += 1) {
    const row: CellProps[] = puzzle[rowIndex];

    if (!Array.isArray(row)) {
      throw new PuzzleValidationError(
        PuzzleValidationErrorCode.INVALID_PUZZLE_SHAPE,
        `Puzzle must be a non-empty square matrix of CellProps rows. Row ${rowIndex + 1} is not an array.`
      );
    }

    if (row.length !== size) {
      throw new PuzzleValidationError(
        PuzzleValidationErrorCode.INVALID_PUZZLE_SHAPE,
        `Puzzle must be a non-empty square matrix of CellProps rows. Row ${rowIndex + 1} has length ${row.length} instead of ${size}.`
      );
    }
  }

  return size;
}

/**
 * Validates compact string shape and returns the inferred square board size.
 */
function getPuzzleStringSize(puzzle: string): number {
  if (typeof puzzle !== "string") {
    throw new PuzzleValidationError(
      PuzzleValidationErrorCode.INVALID_PUZZLE_SHAPE,
      `Puzzle string must be a string of cell values. Received ${formatValue(puzzle)}.`
    );
  }

  if (puzzle.length === 0) {
    throw new PuzzleValidationError(
      PuzzleValidationErrorCode.INVALID_PUZZLE_SHAPE,
      "Puzzle string must not be empty."
    );
  }

  const size: number = Math.sqrt(puzzle.length);

  if (!Number.isInteger(size)) {
    throw new PuzzleValidationError(
      PuzzleValidationErrorCode.INVALID_PUZZLE_SHAPE,
      `Puzzle string length ${puzzle.length} does not describe a square board.`
    );
  }

  return size;
}

/**
 * Narrows an arbitrary square puzzle size to the supported board-size union.
 */
function isSupportedBoardSize(size: number): size is SupportedBoardSize {
  return SUPPORTED_BOARD_SIZES.includes(size as SupportedBoardSize);
}

/**
 * Looks up the canonical box layout for a supported board size.
 */
function getBoxLayout(size: SupportedBoardSize): BoxLayout {
  return BOX_LAYOUTS[size];
}

/**
 * Converts a compact puzzle string into numeric cell values after validating each character.
 */
function parsePuzzleStringValues(puzzle: string, size: number): number[][] {
  return Array.from({ length: size }, (_: undefined, rowIndex: number) =>
    Array.from({ length: size }, (_inner: undefined, columnIndex: number) =>
      parsePuzzleStringCharacter(
        puzzle[rowIndex * size + columnIndex],
        size,
        rowIndex,
        columnIndex
      )
    )
  );
}

/**
 * Validates one compact puzzle character and converts it to a numeric value.
 */
function parsePuzzleStringCharacter(
  character: string,
  size: number,
  rowIndex: number,
  columnIndex: number
): number {
  const value: number = Number(character);

  if (!isDigit(character) || !isIntegerInRange(value, 0, size)) {
    throw new PuzzleValidationError(
      PuzzleValidationErrorCode.INVALID_CELL_VALUE,
      `Invalid puzzle string value at row ${rowIndex + 1}, column ${
        columnIndex + 1
      }: ${formatValue(character)}. Expected "0" for empty or a digit between 1 and ${size}.`
    );
  }

  return value;
}

/**
 * Returns true when the string is exactly one decimal digit.
 */
function isDigit(character: string): boolean {
  return character.length === 1 && character >= "0" && character <= "9";
}

/**
 * Converts numeric values into public puzzle cells while preserving empty cells as notes.
 */
function valuesToPuzzle(values: number[][]): CellProps[][] {
  return values.map((row: number[]) => row.map(valueToCell));
}

/**
 * Converts one numeric value into the matching public cell shape.
 */
function valueToCell(value: number): CellProps {
  if (value === 0) {
    return { type: "note", notes: [] };
  }

  return { type: "given", value };
}

/**
 * Converts `CellProps[][]` into a numeric board where note cells become `0`.
 */
function normalizePuzzle(puzzle: CellProps[][], size: number): number[][] {
  return puzzle.map((row: CellProps[], rowIndex: number) =>
    Array.from({ length: size }, (_: undefined, columnIndex: number) =>
      // Iterate by index so sparse array holes are validated as invalid cells.
      normalizeCell(row[columnIndex], size, rowIndex, columnIndex)
    )
  );
}

/**
 * Validates a single cell and converts it to its numeric solver representation.
 */
function normalizeCell(
  cell: CellProps,
  size: number,
  rowIndex: number,
  columnIndex: number
): number {
  if (!cell || typeof cell !== "object" || Array.isArray(cell)) {
    throw new PuzzleValidationError(
      PuzzleValidationErrorCode.INVALID_CELL_TYPE,
      `Invalid cell type at row ${rowIndex + 1}, column ${columnIndex + 1}: ${formatValue(
        cell
      )}. Expected one of "note", "value", or "given".`
    );
  }

  if (cell.type === "given" || cell.type === "value") {
    const value: number = cell.value;

    if (!isIntegerInRange(value, 1, size)) {
      throw new PuzzleValidationError(
        PuzzleValidationErrorCode.INVALID_CELL_VALUE,
        `Invalid cell value at row ${rowIndex + 1}, column ${columnIndex + 1}: ${formatValue(
          value
        )}. Expected an integer between 1 and ${size}.`
      );
    }

    return value;
  }

  if (cell.type === "note") {
    const notes: number[] = cell.notes;

    if (!Array.isArray(notes) || !areValidNotes(notes, size)) {
      throw new PuzzleValidationError(
        PuzzleValidationErrorCode.INVALID_NOTE_VALUE,
        `Invalid notes at row ${rowIndex + 1}, column ${columnIndex + 1}: ${formatValue(
          notes
        )}. Notes must be unique integers between 1 and ${size}.`
      );
    }

    return 0;
  }

  throw new PuzzleValidationError(
    PuzzleValidationErrorCode.INVALID_CELL_TYPE,
    `Invalid cell type at row ${rowIndex + 1}, column ${columnIndex + 1}: ${formatValue(
      cell.type
    )}. Expected one of "note", "value", or "given".`
  );
}

/**
 * Narrows runtime values to integers in the inclusive Sudoku value range.
 */
function isIntegerInRange(value: number, min: number, max: number): boolean {
  return Number.isInteger(value) && value >= min && value <= max;
}

/**
 * Validates that every note is unique and within the board's candidate range.
 */
function areValidNotes(notes: number[], size: number): boolean {
  const uniqueNotes: Set<number> = new Set<number>();

  for (const note of notes) {
    if (!isIntegerInRange(note, 1, size) || uniqueNotes.has(note)) {
      return false;
    }

    uniqueNotes.add(note);
  }

  return true;
}

/**
 * Rejects duplicate placed values while preserving the legacy error precedence:
 * rows first, then columns, then boxes.
 */
function assertNoDuplicateValues(board: number[][], size: number, layout: BoxLayout): void {
  for (let rowIndex: number = 0; rowIndex < size; rowIndex += 1) {
    const seen: Set<number> = new Set<number>();

    for (let columnIndex: number = 0; columnIndex < size; columnIndex += 1) {
      const value: number = board[rowIndex][columnIndex];

      if (value === 0) {
        continue;
      }

      if (seen.has(value)) {
        throw new PuzzleValidationError(
          PuzzleValidationErrorCode.DUPLICATE_VALUE_IN_ROW,
          `Duplicate value ${value} found in row ${rowIndex + 1}.`
        );
      }

      seen.add(value);
    }
  }

  for (let columnIndex: number = 0; columnIndex < size; columnIndex += 1) {
    const seen: Set<number> = new Set<number>();

    for (let rowIndex: number = 0; rowIndex < size; rowIndex += 1) {
      const value: number = board[rowIndex][columnIndex];

      if (value === 0) {
        continue;
      }

      if (seen.has(value)) {
        throw new PuzzleValidationError(
          PuzzleValidationErrorCode.DUPLICATE_VALUE_IN_COLUMN,
          `Duplicate value ${value} found in column ${columnIndex + 1}.`
        );
      }

      seen.add(value);
    }
  }

  // Box validation runs last so row/column failures remain the first reported issue.
  for (let boxRow: number = 0; boxRow < size; boxRow += layout.boxHeight) {
    for (let boxColumn: number = 0; boxColumn < size; boxColumn += layout.boxWidth) {
      const seen: Set<number> = new Set<number>();

      for (
        let rowIndex: number = boxRow;
        rowIndex < boxRow + layout.boxHeight;
        rowIndex += 1
      ) {
        for (
          let columnIndex: number = boxColumn;
          columnIndex < boxColumn + layout.boxWidth;
          columnIndex += 1
        ) {
          const value: number = board[rowIndex][columnIndex];

          if (value === 0) {
            continue;
          }

          if (seen.has(value)) {
            throw new PuzzleValidationError(
              PuzzleValidationErrorCode.DUPLICATE_VALUE_IN_BOX,
              `Duplicate value ${value} found in box starting at row ${boxRow + 1}, column ${
                boxColumn + 1
              }.`
            );
          }

          seen.add(value);
        }
      }
    }
  }
}

/**
 * Returns true when the normalized board contains no empty cells.
 */
function isSolved(board: number[][]): boolean {
  return board.every((row: number[]) => row.every((value: number) => value !== 0));
}

/**
 * Produces a deep-enough copy for solver snapshots and immutable branch updates.
 */
function cloneBoard(board: number[][]): number[][] {
  return board.map((row: number[]) => [...row]);
}

/**
 * Immutable solver state captured while traversing the backtracking tree.
 */
type SolveState = {
  solutionCount: number;
  solution: number[][] | null;
};

/**
 * Returns a new board with one value changed while preserving other row references.
 *
 * This keeps backtracking purely functional and avoids mutating parent recursion frames.
 */
function withPlacedValue(
  board: number[][],
  rowIndex: number,
  columnIndex: number,
  value: number
): number[][] {
  const nextRow: number[] = [...board[rowIndex]];
  nextRow[columnIndex] = value;

  return board.map((row: number[], index: number) => (index === rowIndex ? nextRow : row));
}

/**
 * Creates the next immutable solve state when a full solution board is found.
 */
function recordSolution(board: number[][], solveState: SolveState): SolveState {
  const nextSolutionCount: number = solveState.solutionCount + 1;

  if (solveState.solution !== null) {
    return {
      solutionCount: nextSolutionCount,
      solution: solveState.solution,
    };
  }

  return {
    solutionCount: nextSolutionCount,
    solution: cloneBoard(board),
  };
}

/**
 * Performs deterministic backtracking and returns an immutable solve state.
 *
 * Stopping at two solutions is enough to distinguish unique puzzles from ambiguous ones
 * without exploring the entire search tree.
 */
function searchForSolutions(
  board: number[][],
  size: number,
  layout: BoxLayout,
  index: number,
  solveState: SolveState
): SolveState {
  // A completed traversal means the current board is a valid full solution.
  if (index === size * size) {
    return recordSolution(board, solveState);
  }

  const rowIndex: number = Math.floor(index / size);
  const columnIndex: number = index % size;

  // Filled cells are part of the fixed puzzle state, so continue to the next position.
  if (board[rowIndex][columnIndex] !== 0) {
    return searchForSolutions(board, size, layout, index + 1, solveState);
  }

  let nextSolveState: SolveState = solveState;

  // Candidates are tried in ascending order to keep the solver deterministic.
  for (let candidate: number = 1; candidate <= size; candidate += 1) {
    if (!isCandidate(board, size, layout, rowIndex, columnIndex, candidate)) {
      continue;
    }

    const boardWithCandidate: number[][] = withPlacedValue(
      board,
      rowIndex,
      columnIndex,
      candidate
    );
    nextSolveState = searchForSolutions(
      boardWithCandidate,
      size,
      layout,
      index + 1,
      nextSolveState
    );

    if (nextSolveState.solutionCount > 1) {
      return nextSolveState;
    }
  }

  return nextSolveState;
}

/**
 * Checks whether a candidate can be placed in a cell under row, column, and box rules.
 */
function isCandidate(
  board: number[][],
  size: number,
  layout: BoxLayout,
  rowIndex: number,
  columnIndex: number,
  candidate: number
): boolean {
  for (let offset: number = 0; offset < size; offset += 1) {
    if (board[rowIndex][offset] === candidate) {
      return false;
    }

    if (board[offset][columnIndex] === candidate) {
      return false;
    }
  }

  const boxRowStart: number = Math.floor(rowIndex / layout.boxHeight) * layout.boxHeight;
  const boxColumnStart: number = Math.floor(columnIndex / layout.boxWidth) * layout.boxWidth;

  for (
    let boxRow: number = boxRowStart;
    boxRow < boxRowStart + layout.boxHeight;
    boxRow += 1
  ) {
    for (
      let boxColumn: number = boxColumnStart;
      boxColumn < boxColumnStart + layout.boxWidth;
      boxColumn += 1
    ) {
      if (board[boxRow][boxColumn] === candidate) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Formats runtime values so error messages stay readable.
 */
function formatValue(value: CellProps | string | number | number[]): string {
  return String(JSON.stringify(value));
}
