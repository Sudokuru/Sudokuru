import { CustomError, CustomErrorEnum } from "./CustomError";
import { SudokuEnum } from "./Sudoku";

/**
 * Constructed using board string
 * Throws exception if invalid board
 * Returns:
 * Board (2d array)
 * Solution (2d array)
 * Strategy objects (that could be needed to solve)
 * Difficulty (integer on scale)
 */
export class Board{
    private board: string[][];

    /**
     * Creates board object if valid, otherwise throws error
     * @constructor
     * @param {string} board - 81 length board string (left to right, top to bottom)
     */
    constructor(board: string) {
        if (board.length !== SudokuEnum.BOARD_LENGTH) {
            throw new CustomError(CustomErrorEnum.INVALID_BOARD_LENGTH);
        }
    }
}