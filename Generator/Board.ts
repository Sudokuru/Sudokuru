import { CustomError, CustomErrorEnum } from "./CustomError";
import { SudokuEnum } from "./Sudoku";
import { Solver } from "./Solver";

/**
 * Constructed using board string
 * Throws exception if invalid board
 * Returns:
 * Board (2d array, one array per row each containing one string per cell)
 * Solution (2d array or string)
 * Most complex strategy that could be needed to solve
 * Difficulty (integer on scale)
 */
export class Board{
    private board: string[][];
    private solution: string[][];
    private solutionString: string;
    private strategy: number;

    /**
     * Creates board object if valid, otherwise throws error
     * 
     * @param board - 81 length board string (left to right, top to bottom)
     * @throws {@link CustomError}
     * Thrown if board has invalid length, characters, or is already solved
     */
    constructor(board: string) {
        // Regex ^[0123456789]*$ which makes sure only contains those chars
        let valid:string = SudokuEnum.EMPTY_CELL + SudokuEnum.CANDIDATES;
        valid = "^[" + valid + "]*$";

        if (board.length !== SudokuEnum.BOARD_LENGTH) {
            throw new CustomError(CustomErrorEnum.INVALID_BOARD_LENGTH);
        }
        else if (!new RegExp(valid).test(board)) {
            throw new CustomError(CustomErrorEnum.INVALID_BOARD_CHARACTERS);
        }
        else if (!board.includes(SudokuEnum.EMPTY_CELL)) {
            throw new CustomError(CustomErrorEnum.BOARD_ALREADY_SOLVED);
        }

        this.setBoard(board);

        this.strategy = 0;
        this.solve();
    }

    /**
     * Get board array
     * @returns board array
     */
    public getBoard():string[][] {
        return this.board;
    }

    /**
     * Get solution array
     * @returns solution array
     */
    public getSolution():string[][] {
        return this.solution;
    }

    /**
     * Get solution string
     * @returns solution string
     */
    public getSolutionString():string {
        return this.solutionString;
    }

    /**
     * Get strategy score
     * @returns strategy score
     */
    public getStrategyScore():number {
        return this.strategy;
    }

    /**
     * Solves the puzzle and sets strategy and solution
     */
    private solve():void {
        let s:Solver = new Solver(this.board);
        let strategy:number = s.nextStep();
        while (strategy !== null) {
            if (strategy > this.strategy) {
                this.strategy = strategy;
            }
            strategy = s.nextStep();
        }
        this.solution = s.getSolution();
        this.setSolutionString();
        return;
    }

    /**
     * Sets solution string
     */
    private setSolutionString():void {
        this.solutionString = "";
        for (let i:number = 0; i < this.solution.length; i++) {
            for (let j:number = 0; j < this.solution[i].length; j++) {
                this.solutionString += this.solution[i][j];
            }
        }
        return;
    }

    /**
     * Sets board array
     * @param board - board string
     */
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