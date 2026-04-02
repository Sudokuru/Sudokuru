import { CellProps, SudokuValue } from "../../Types";
import { SupportedBoardSize } from "../../validate";

/**
 * Canonical solved boards used by V4 unit tests.
 *
 * Keeping these explicit removes puzzle-generation logic from tests so intent stays clear.
 */
export const SOLVED_TEST_BOARDS: Record<SupportedBoardSize, SudokuValue[][]> = {
  1: [[1]],
  2: [
    [1, 2],
    [2, 1],
  ],
  4: [
    [1, 2, 3, 4],
    [3, 4, 1, 2],
    [4, 1, 2, 3],
    [2, 3, 4, 1],
  ],
  6: [
    [1, 2, 3, 4, 5, 6],
    [4, 5, 6, 1, 2, 3],
    [5, 6, 1, 2, 3, 4],
    [2, 3, 4, 5, 6, 1],
    [3, 4, 5, 6, 1, 2],
    [6, 1, 2, 3, 4, 5],
  ],
  8: [
    [1, 2, 3, 4, 5, 6, 7, 8],
    [5, 6, 7, 8, 1, 2, 3, 4],
    [6, 7, 8, 1, 2, 3, 4, 5],
    [2, 3, 4, 5, 6, 7, 8, 1],
    [3, 4, 5, 6, 7, 8, 1, 2],
    [7, 8, 1, 2, 3, 4, 5, 6],
    [8, 1, 2, 3, 4, 5, 6, 7],
    [4, 5, 6, 7, 8, 1, 2, 3],
  ],
  9: [
    [1, 2, 3, 4, 5, 6, 7, 8, 9],
    [4, 5, 6, 7, 8, 9, 1, 2, 3],
    [7, 8, 9, 1, 2, 3, 4, 5, 6],
    [8, 9, 1, 2, 3, 4, 5, 6, 7],
    [2, 3, 4, 5, 6, 7, 8, 9, 1],
    [5, 6, 7, 8, 9, 1, 2, 3, 4],
    [6, 7, 8, 9, 1, 2, 3, 4, 5],
    [9, 1, 2, 3, 4, 5, 6, 7, 8],
    [3, 4, 5, 6, 7, 8, 9, 1, 2],
  ],
};

/**
 * Static replacement for one cell in a numeric solved board converted to `CellProps[][]`.
 */
export type TestBoardCellPatch = {
  row: number;
  column: number;
  cell: CellProps;
};

/**
 * One static note-cell patch per supported size.
 * Each patch turns the final cell into a note so the solver must fill exactly one value.
 */
export const SINGLE_NOTE_PATCH_BY_SIZE: Record<SupportedBoardSize, TestBoardCellPatch[]> = {
  1: [{ row: 0, column: 0, cell: { type: "note", notes: [1] } }],
  2: [{ row: 1, column: 1, cell: { type: "note", notes: [1] } }],
  4: [{ row: 3, column: 3, cell: { type: "note", notes: [1] } }],
  6: [{ row: 5, column: 5, cell: { type: "note", notes: [5] } }],
  8: [{ row: 7, column: 7, cell: { type: "note", notes: [3] } }],
  9: [{ row: 8, column: 8, cell: { type: "note", notes: [2] } }],
};

/**
 * Static patch used to prove that note values are ignored semantically by the solver.
 * For 4x4, cell (0,1) should solve to 2 even when the note says 1.
 */
export const MISLEADING_NOTE_PATCH_4X4: TestBoardCellPatch[] = [
  { row: 0, column: 1, cell: { type: "note", notes: [1] } },
];
