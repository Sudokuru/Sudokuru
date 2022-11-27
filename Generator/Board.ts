import { CustomError, CustomErrorEnum } from "./CustomError";
import { SudokuEnum } from "./Sudoku";

/**
 * Constructed using board string
 * Throws exception if invalid board
 * Returns:
 * Board (2d array, one array per row each containing one string per cell)
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
        // Regex !^[0123456789]*$ which makes sure only contains those chars
        let valid:string = SudokuEnum.EMPTY_CELL + SudokuEnum.CANDIDATES;
        valid = "!^[" + valid + "]*$";

        if (board.length !== SudokuEnum.BOARD_LENGTH) {
            throw new CustomError(CustomErrorEnum.INVALID_BOARD_LENGTH);
        }
        else if (new RegExp(valid).test(board)) {
            throw new CustomError(CustomErrorEnum.INVALID_BOARD_CHARACTERS);
        }

        this.setBoard(board);
    }

    public getBoard():string[][] {
        return this.board;
    }

    private setBoard(board: string):void {
        this.board = new Array();
        for (let i:number = 0; i < SudokuEnum.COLUMN_LENGTH; i++) {
            this.board.push([]);
            for (let j:number = 0; j < SudokuEnum.ROW_LENGTH; j++) {
                this.board[i].push(board[(i*SudokuEnum.ROW_LENGTH)+j]);
            }
        }
    }
}