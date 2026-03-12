import { CellProps } from "./Types";

/**
 * Describes the rectangular sub-grid dimensions for a supported board size.
 */
export type BoxLayout = {
  boxHeight: number;
  boxWidth: number;
};

/**
 * Board sizes currently supported by the V4 validation/solving module.
 */
export const SUPPORTED_BOARD_SIZES = [1, 2, 4, 6, 8, 9] as const;

/**
 * Maps each supported board size to its canonical rectangular box layout.
 */
export const BOX_LAYOUTS: Record<number, BoxLayout> = {
  1: { boxHeight: 1, boxWidth: 1 },
  2: { boxHeight: 1, boxWidth: 2 },
  4: { boxHeight: 2, boxWidth: 2 },
  6: { boxHeight: 2, boxWidth: 3 },
  8: { boxHeight: 2, boxWidth: 4 },
  9: { boxHeight: 3, boxWidth: 3 },
};

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
  INTERNAL_ERROR = "INTERNAL_ERROR",
}

/**
 * Error type thrown by `getPuzzleSolution` for validation and solving failures.
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
 * Validates and solves a puzzle represented as `CellProps[][]`.
 *
 * Notes are validated as user state but are not used as solver constraints.
 * The returned board is always a fresh `number[][]` instance.
 */
export function getPuzzleSolution(puzzle: CellProps[][]): number[][] {
  const size = getPuzzleSize(puzzle);
  const layout = getBoxLayout(size);
  const normalizedPuzzle = normalizePuzzle(puzzle, size);

  assertNoDuplicateValues(normalizedPuzzle, size, layout);

  if (isSolved(normalizedPuzzle)) {
    throw new PuzzleValidationError(
      PuzzleValidationErrorCode.BOARD_ALREADY_SOLVED,
      "Puzzle is already solved."
    );
  }

  const solvingBoard = cloneBoard(normalizedPuzzle);
  const solveState = {
    solutionCount: 0,
    solution: null as number[][] | null,
  };

  searchForSolutions(solvingBoard, size, layout, 0, solveState);

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

  if (solveState.solution === null) {
    throw new PuzzleValidationError(
      PuzzleValidationErrorCode.INTERNAL_ERROR,
      "Internal solver error: a solution count was recorded without capturing the solution grid."
    );
  }

  return solveState.solution;
}

/**
 * Validates that the input is a non-empty square matrix and returns its size.
 */
function getPuzzleSize(puzzle: unknown): number {
  if (!Array.isArray(puzzle) || puzzle.length === 0) {
    throw new PuzzleValidationError(
      PuzzleValidationErrorCode.INVALID_PUZZLE_SHAPE,
      "Puzzle must be a non-empty square matrix of CellProps rows."
    );
  }

  const size = puzzle.length;

  for (let rowIndex = 0; rowIndex < size; rowIndex += 1) {
    const row = puzzle[rowIndex];

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
 * Looks up the canonical box layout for a supported board size.
 */
function getBoxLayout(size: number): BoxLayout {
  const layout = BOX_LAYOUTS[size];

  if (!layout) {
    throw new PuzzleValidationError(
      PuzzleValidationErrorCode.UNSUPPORTED_BOARD_SIZE,
      `Unsupported board size ${size}. Supported sizes are ${SUPPORTED_BOARD_SIZES.join(", ")}.`
    );
  }

  return layout;
}

/**
 * Converts `CellProps[][]` into a numeric board where note cells become `0`.
 */
function normalizePuzzle(puzzle: CellProps[][], size: number): number[][] {
  return puzzle.map((row, rowIndex) =>
    row.map((cell, columnIndex) => normalizeCell(cell, size, rowIndex, columnIndex))
  );
}

/**
 * Validates a single cell and converts it to its numeric solver representation.
 */
function normalizeCell(
  cell: unknown,
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

  const cellType = (cell as { type?: unknown }).type;

  if (cellType === "given" || cellType === "value") {
    const value = (cell as { value?: unknown }).value;

    if (!Number.isInteger(value) || value < 1 || value > size) {
      throw new PuzzleValidationError(
        PuzzleValidationErrorCode.INVALID_CELL_VALUE,
        `Invalid cell value at row ${rowIndex + 1}, column ${columnIndex + 1}: ${formatValue(
          value
        )}. Expected an integer between 1 and ${size}.`
      );
    }

    return value as number;
  }

  if (cellType === "note") {
    const notes = (cell as { notes?: unknown }).notes;

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
      cellType
    )}. Expected one of "note", "value", or "given".`
  );
}

/**
 * Validates that every note is unique and within the board's candidate range.
 */
function areValidNotes(notes: unknown[], size: number): boolean {
  const uniqueNotes = new Set<number>();

  for (const note of notes) {
    if (!Number.isInteger(note) || note < 1 || note > size || uniqueNotes.has(note as number)) {
      return false;
    }

    uniqueNotes.add(note as number);
  }

  return true;
}

/**
 * Rejects duplicate placed values while preserving the legacy error precedence:
 * rows first, then columns, then boxes.
 */
function assertNoDuplicateValues(board: number[][], size: number, layout: BoxLayout): void {
  for (let rowIndex = 0; rowIndex < size; rowIndex += 1) {
    const seen = new Set<number>();

    for (let columnIndex = 0; columnIndex < size; columnIndex += 1) {
      const value = board[rowIndex][columnIndex];

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

  for (let columnIndex = 0; columnIndex < size; columnIndex += 1) {
    const seen = new Set<number>();

    for (let rowIndex = 0; rowIndex < size; rowIndex += 1) {
      const value = board[rowIndex][columnIndex];

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
  for (let boxRow = 0; boxRow < size; boxRow += layout.boxHeight) {
    for (let boxColumn = 0; boxColumn < size; boxColumn += layout.boxWidth) {
      const seen = new Set<number>();

      for (let rowIndex = boxRow; rowIndex < boxRow + layout.boxHeight; rowIndex += 1) {
        for (
          let columnIndex = boxColumn;
          columnIndex < boxColumn + layout.boxWidth;
          columnIndex += 1
        ) {
          const value = board[rowIndex][columnIndex];

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
  return board.every((row) => row.every((value) => value !== 0));
}

/**
 * Produces a deep-enough copy for the mutable backtracking search.
 */
function cloneBoard(board: number[][]): number[][] {
  return board.map((row) => [...row]);
}

/**
 * Performs deterministic backtracking and captures up to the first two solutions.
 *
 * Stopping at two solutions is enough to distinguish unique puzzles from ambiguous ones
 * without exploring the entire search tree.
 */
function searchForSolutions(
  board: number[][],
  size: number,
  layout: BoxLayout,
  index: number,
  solveState: { solutionCount: number; solution: number[][] | null }
): void {
  if (solveState.solutionCount > 1) {
    return;
  }

  // A completed traversal means the current board is a valid full solution.
  if (index === size * size) {
    solveState.solutionCount += 1;

    if (solveState.solution === null) {
      solveState.solution = cloneBoard(board);
    }

    return;
  }

  const rowIndex = Math.floor(index / size);
  const columnIndex = index % size;

  // Filled cells are part of the fixed puzzle state, so continue to the next position.
  if (board[rowIndex][columnIndex] !== 0) {
    searchForSolutions(board, size, layout, index + 1, solveState);
    return;
  }

  // Candidates are tried in ascending order to keep the solver deterministic.
  for (let candidate = 1; candidate <= size; candidate += 1) {
    if (!isCandidate(board, size, layout, rowIndex, columnIndex, candidate)) {
      continue;
    }

    board[rowIndex][columnIndex] = candidate;
    searchForSolutions(board, size, layout, index + 1, solveState);
    board[rowIndex][columnIndex] = 0;

    if (solveState.solutionCount > 1) {
      return;
    }
  }
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
  for (let offset = 0; offset < size; offset += 1) {
    if (board[rowIndex][offset] === candidate) {
      return false;
    }

    if (board[offset][columnIndex] === candidate) {
      return false;
    }
  }

  const boxRowStart = Math.floor(rowIndex / layout.boxHeight) * layout.boxHeight;
  const boxColumnStart = Math.floor(columnIndex / layout.boxWidth) * layout.boxWidth;

  for (let boxRow = boxRowStart; boxRow < boxRowStart + layout.boxHeight; boxRow += 1) {
    for (
      let boxColumn = boxColumnStart;
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
 * Formats unknown runtime values so error messages stay readable.
 */
function formatValue(value: unknown): string {
  if (typeof value === "string") {
    return JSON.stringify(value);
  }

  try {
    const json = JSON.stringify(value);
    return json === undefined ? String(value) : json;
  } catch {
    return String(value);
  }
}
