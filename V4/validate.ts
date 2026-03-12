import { CellProps } from "./Types";

export type BoxLayout = {
  boxHeight: number;
  boxWidth: number;
};

export const SUPPORTED_BOARD_SIZES = [1, 2, 4, 6, 8, 9] as const;
export const BOX_LAYOUTS: Record<number, BoxLayout> = {
  1: { boxHeight: 1, boxWidth: 1 },
  2: { boxHeight: 1, boxWidth: 2 },
  4: { boxHeight: 2, boxWidth: 2 },
  6: { boxHeight: 2, boxWidth: 3 },
  8: { boxHeight: 2, boxWidth: 4 },
  9: { boxHeight: 3, boxWidth: 3 },
};

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

export class PuzzleValidationError extends Error {
  public readonly code: PuzzleValidationErrorCode;

  constructor(code: PuzzleValidationErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = "PuzzleValidationError";
    Object.setPrototypeOf(this, PuzzleValidationError.prototype);
  }
}

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

  if (solveState.solutionCount > 1 || solveState.solution === null) {
    throw new PuzzleValidationError(
      PuzzleValidationErrorCode.MULTIPLE_SOLUTIONS,
      "Puzzle has multiple valid solutions."
    );
  }

  return solveState.solution;
}

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

function normalizePuzzle(puzzle: CellProps[][], size: number): number[][] {
  return puzzle.map((row, rowIndex) =>
    row.map((cell, columnIndex) => normalizeCell(cell, size, rowIndex, columnIndex))
  );
}

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

function isSolved(board: number[][]): boolean {
  return board.every((row) => row.every((value) => value !== 0));
}

function cloneBoard(board: number[][]): number[][] {
  return board.map((row) => [...row]);
}

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

  if (index === size * size) {
    solveState.solutionCount += 1;

    if (solveState.solution === null) {
      solveState.solution = cloneBoard(board);
    }

    return;
  }

  const rowIndex = Math.floor(index / size);
  const columnIndex = index % size;

  if (board[rowIndex][columnIndex] !== 0) {
    searchForSolutions(board, size, layout, index + 1, solveState);
    return;
  }

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
