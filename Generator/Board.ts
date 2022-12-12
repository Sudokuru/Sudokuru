import { CustomError, CustomErrorEnum } from "./CustomError";
import { getBoardArray, SudokuEnum } from "./Sudoku";
import { Solver } from "./Solver";
import { Hint } from "./Hint";
import { StrategyEnum } from "./Sudoku"

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
     * 
     * @param board - 81 length board string (left to right, top to bottom)
     * @throws {@link CustomError}
     * Thrown if board has invalid length, characters, or is already solved
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
            var boardArray: string[][] = getBoardArray(board);
            for (let i:number = 0; i < SudokuEnum.COLUMN_LENGTH; i++){
                for (let j:number = 0; j < SudokuEnum.ROW_LENGTH; j++){
                    if (boardArray[i][j] != "0"){
                        // checks to see if there are any duplicate values in the row
                        for (let k:number = 0; k < j; k++){
                            if (boardArray[i][j] == boardArray[i][k]){
                                throw new CustomError(CustomErrorEnum.DUPLICATE_VALUE_IN_ROW);
                            }
                        }
                        // checks to see if there are any duplicate values in the column
                        for (let k:number = 0; k < i; k++){
                            if (boardArray[i][j] == boardArray[k][j]){
                                throw new CustomError(CustomErrorEnum.DUPLICATE_VALUE_IN_COLUMN);
                            }
                        }
                        // checks to see if there are any duplicate values in the box
                        if (i%3 == 2 && j%3 == 2){
                            for (let k:number = 0; k < SudokuEnum.BOX_LENGTH; k++){
                                for (let l:number = 0; l < SudokuEnum.BOX_LENGTH; l++) {
                                    for(let m: number = 0; m < SudokuEnum.BOX_LENGTH; m++){
                                        for (let n: number = 0; n < SudokuEnum.BOX_LENGTH; n++){
                                            
                                            let baseColumn: number = i-(SudokuEnum.BOX_LENGTH-1);
                                            let compareColumn: number = baseColumn+k;
                                            let column: number = baseColumn + m;
                                            
                                            let baseRow: number = j-(SudokuEnum.BOX_LENGTH-1);
                                            let compareRow: number = baseRow+l;
                                            let row: number = baseRow + n;
                                            
                                            let array1 = boardArray[column][row];
                                            let array2 = boardArray[compareColumn][compareRow];
                                            if (((column != compareColumn) && (row != compareRow)) && (boardArray[column][row] != "0") 
                                                && (boardArray[column][row] == boardArray[compareColumn][compareRow])){
                                                throw new CustomError(CustomErrorEnum.DUPLICATE_VALUE_IN_BOX);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return true;
    }
}