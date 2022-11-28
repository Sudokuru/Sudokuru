import { CustomError, CustomErrorEnum } from "./CustomError";
import { SudokuEnum } from "./Sudoku";
import { Solver } from "./Solver";

/**
 * Constructed using board string
 * Throws exception if invalid board
 * Returns:
 * Board (2d array, one array per row each containing one string per cell)
 * Solution (2d array)
 * Most complex strategy that could be needed to solve
 * Difficulty (integer on scale)
 */
export class Board{
    private board: string[][];
    private solution: string[][];
    private strategy: number;

    /**
     * Creates board object if valid, otherwise throws error
     * @constructor
     * @param {string} board - 81 length board string (left to right, top to bottom)
     */
    constructor(board: string) {
        // Regex !^[0123456789]*$ which makes sure only contains those chars
        let valid:string = SudokuEnum.EMPTY_CELL + SudokuEnum.CANDIDATES;
        valid = "^[" + valid + "]*$";

        if (board.length !== SudokuEnum.BOARD_LENGTH) {
            throw new CustomError(CustomErrorEnum.INVALID_BOARD_LENGTH);
        }
        else if (!new RegExp(valid).test(board)) {
            throw new CustomError(CustomErrorEnum.INVALID_BOARD_CHARACTERS);
        }
        // add error if no zeros i.e. already solved

        this.setBoard(board);

        this.strategy = 0;
        this.solve();
    }

    public getBoard():string[][] {
        return this.board;
    }

    public getSolution():string[][] {
        return this.solution;
    }

    public getSolutionString():string {
        let solution:string = "";
        for (let i:number = 0; i < this.solution.length; i++) {
            for (let j:number = 0; j < this.solution[i].length; j++) {
                solution += this.solution[i][j];
            }
        }
        return solution;
    }

    private solve():void {
        let s:Solver = new Solver(this.board);
        let strategy:number = s.nextStep();
        while (!strategy === null) {
            if (strategy > this.strategy) {
                this.strategy = strategy;
            }
            strategy = s.nextStep();
        }
        this.solution = s.getSolution();
        return;
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