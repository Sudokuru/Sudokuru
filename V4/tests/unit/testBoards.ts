import { SudokuValue } from "../../Types";
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
