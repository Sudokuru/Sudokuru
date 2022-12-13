import { CustomError, CustomErrorEnum } from "./CustomError";
import { getBoardArray, SudokuEnum } from "./Sudoku";
import { Solver } from "./Solver";
import { Hint } from "./Hint";
import { StrategyEnum } from "./Sudoku"
import { Cell } from "./Cell";

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
    private mostDifficultStrategy: StrategyEnum;

    /**
     * Creates board object if valid, otherwise throws error
     * @param board - 81 length board string (left to right, top to bottom)
     */
    constructor(board: string) {

        this.validatePuzzle(board);

        this.board = getBoardArray(board);

        this.mostDifficultStrategy = -1;
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
        return this.mostDifficultStrategy;
    }

    /**
     * Solves the puzzle and sets strategy and solution
     */
    private solve():void {
        let s:Solver = new Solver(this.board);
        let hint:Hint = s.nextStep();
        while (hint !== null) {
            if (hint.getStrategyType() > this.mostDifficultStrategy) {
                this.mostDifficultStrategy = hint.getStrategyType();
            }
            hint = s.nextStep();
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
     * Determines if the input board is a valid Sudoku board
     * @param board - 81 length board string (left to right, top to bottom)
     * @throws {@link CustomError}
     * Thrown if board has invalid length, characters, is already solved, or if there are duplicate values 
     * in a row, column, or box (Excluding zeros)
     */
    public validatePuzzle(board: string):boolean {

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
        else {
            // Checks board for duplicate values in the same row/column/box
            var boardArray: string[][] = getBoardArray(board);
            // checks every row for duplicate values
            for (let row:number = 0; row < SudokuEnum.COLUMN_LENGTH; row++) {
                // seen stores whetehr or not a value has been seen in the row already
                let seen:boolean[] = new Array(SudokuEnum.ROW_LENGTH).fill(false);
                for (let column:number = 0; column < SudokuEnum.ROW_LENGTH; column++) {
                    // If value hasn't beeen seen before (or if there is no value) in this row mark it as seen, else throw a duplicate value error
                    if ((boardArray[row][column] === "0") || !seen[Number(boardArray[row][column])-1]) {
                        seen[Number(boardArray[row][column])-1] = true;
                    }
                    else {
                        throw new CustomError(CustomErrorEnum.DUPLICATE_VALUE_IN_ROW);
                    }
                }
            }
            // checks every column for duplicate values
            for (let column:number = 0; column < SudokuEnum.ROW_LENGTH; column++) {
                // seen stores whetehr or not a value has been seen in the row already
                let seen:boolean[] = new Array(SudokuEnum.ROW_LENGTH).fill(false);
                for (let row:number = 0; row < SudokuEnum.COLUMN_LENGTH; row++) {
                    // If value hasn't beeen seen before (or if there is no value) in this column mark it as seen, else throw a duplicate value error
                    if ((boardArray[row][column] === "0") || !seen[Number(boardArray[row][column])-1]) {
                        seen[Number(boardArray[row][column])-1] = true;
                    }
                    else {
                        throw new CustomError(CustomErrorEnum.DUPLICATE_VALUE_IN_COLUMN);
                    }
                }
            }
            // checks every box for duplicate values
            for (let box:number = 0; box < SudokuEnum.BOX_COUNT; box++) {
                // seen stores whether or not a value has been seen in the box already
                let seen:boolean[] = new Array(SudokuEnum.ROW_LENGTH).fill(false);
                let rowStart:number = Cell.getBoxRowStart(box);
                for (let row:number = rowStart; row < (rowStart + SudokuEnum.BOX_LENGTH); row++) {
                    let columnStart:number = Cell.getBoxColumnStart(box);
                    for (let column:number = columnStart; column < (columnStart + SudokuEnum.BOX_LENGTH); column++) {
                        // If value hasn't beeen seen before (or if there is no value) in this box mark it as seen, else throw a duplicate value error
                        if ((boardArray[row][column] === "0") || !seen[Number(boardArray[row][column])-1]) {
                            seen[Number(boardArray[row][column])-1] = true;
                        }
                        else {
                            throw new CustomError(CustomErrorEnum.DUPLICATE_VALUE_IN_BOX);
                        }
                    }
                }
            }
        }
        return true;
    }
}