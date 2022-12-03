import { finished } from "stream";
import { Cell } from "./Cell";
import { CustomError, CustomErrorEnum } from "./CustomError";
import { Strategy, StrategyEnum } from "./Strategy";
import { SudokuEnum } from "./Sudoku";

/**
 * Constructed using 2d board array
 * Returns:
 * Strategy used to solve each step or null if solved or unsolvable error
 * Solution 2d board array
 */
export class Solver{
    private board: Cell[][];
    private solved: boolean;

    /**
     * Creates solver object
     * @param board - 2d board array
     */
    constructor(board: string[][]) {
        this.board = new Array();
        this.initializeCellArray(this.board, board.length);
        this.initializeBoard(board);
        this.simplifyAllNotes();
        this.solved = false;
    }

    /**
     * Takes the next step in solving puzzle
     * @returns strategy used or null if finished
     * @throws {@link CustomError}
     * Thrown if board is unsolvable
     */
    public nextStep():number {
        let cells: Cell[][] = new Array();
        this.initializeCellArray(cells, SudokuEnum.COLUMN_LENGTH);
        this.addEveryEmptyCell(cells);

        if (this.isFinished(cells)) {
            return null;
        }

        let strategy:number = this.getStrategy(cells);
        if (strategy !== null) {
            return strategy;
        }

        throw new CustomError(CustomErrorEnum.UNSOLVABLE);
    }

    /**
     * Checks if puzzle is finished
     * @param cells - empty cells
     * @returns true if puzzle is finished
     */
    private isFinished(cells: Cell[][]):boolean {
        for (let i: number = 0; i < cells.length; i++) {
            if (cells[i].length > 0) {
                return false;
            }
            if (i === (cells.length - 1)) {
                this.solved = true;
                return true;
            }
        }
    }

    /**
     * Gets and applies the next applicable strategy
     * @param cells - empty cells
     * @returns strategy if one is available, else returns null
     */
    private getStrategy(cells: Cell[][]):number {
        if(this.hasNakedSingle(cells)) {
            return StrategyEnum.NAKED_SINGLE;
        }
        return null;
    }

    /**
     * Returns if puzzle has a naked single and applies it
     * @param cells - empty cells
     * @returns true is contains a naked single
     */
    private hasNakedSingle(cells: Cell[][]):boolean {
        for (let i:number = 0; i < cells.length; i++) {
            for (let j:number = 0; j < cells[i].length; j++) {
                let single: Cell[][] = new Array();
                this.initializeCellArray(single, 1);
                single[0].push(cells[i][j]);
                let nakedSingle: Strategy = new Strategy(single);
                if (nakedSingle.isNakedSingle()) {
                    this.placeValues(nakedSingle.getValuesToPlace());
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Gets solution array if solved, otherwise throws error
     * @returns solution array
     * @throws {@link CustomError}
     * Thrown if puzzle isn't solved
     */
    public getSolution():string[][] {
        if (!this.solved) {
            throw new CustomError(CustomErrorEnum.NOT_SOLVED);
        }

        let solution:string[][] = new Array();
        for (let i:number = 0; i < this.board.length; i++) {
            solution.push(new Array());
            for (let j:number = 0; j < this.board[i].length; j++) {
                solution[i].push(this.board[i][j].getValue());
            }
        }
        return solution;
    }

    /**
     * Simplify notes by removing filled cells values from rest of their row/column/boxes
     */
    private simplifyAllNotes():void {
        for (let column:number = 0; column < SudokuEnum.ROW_LENGTH; column++) {
            for (let row:number = 0; row < SudokuEnum.COLUMN_LENGTH; row++) {
                this.simplifyNotes(this.board[row][column]);
            }
        }
    }

    /**
     * Removes cell's value from all other cells in its row/column/box
     * 
     * @param cell - cell that has had value placed in it
     */
    private simplifyNotes(cell: Cell):void {
        let value:string = cell.getValue();

        this.simplifyRowNotes(value, cell.getRow());
        this.simplifyColumnNotes(value, cell.getColumn());
        this.simplifyBoxNotes(value, cell.getBoxRowStart(), cell.getBoxColumnStart());
    }

    /**
     * Removes given value from each cell in given row
     * 
     * @param value - value to remove
     * @param row - row to remove value from
     */
    private simplifyRowNotes(value:string, row:number):void {
        for (let column:number = 0; column < SudokuEnum.ROW_LENGTH; column++) {
            this.board[row][column].removeNote(value);
        }
        return;
    }

    /**
     * Removes given value from each cell in given column
     * 
     * @param value - value to remove
     * @param column - column to remove value from
     */
    private simplifyColumnNotes(value:string, column:number):void {
        for (let row:number = 0; row < SudokuEnum.COLUMN_LENGTH; row++) {
            this.board[row][column].removeNote(value);
        }
        return;
    }

    /**
     * Removes given value from each cell in given box
     * 
     * @param value - value to remove
     * @param box - box to remove value from
     */
    private simplifyBoxNotes(value:string, row:number, column:number):void {
        for (let r:number = row; r < (row + SudokuEnum.BOX_LENGTH); r++) {
            for (let c:number = column; c < (column + SudokuEnum.BOX_LENGTH); c++) {
                this.board[r][c].removeNote(value);
            }
        }
    }

    /**
     * Initializes 2d cell array
     * @param cells - 2d array to intialize
     * @param rowCount - number of rows in array
     */
    private initializeCellArray(cells: Cell[][], rowCount: number):void {
        for (let i:number = 0; i < rowCount; i++) {
            cells.push(new Array());
        }
        return;
    }

    /**
     * Initializes board cell array
     * @param board - board array
     */
    private initializeBoard(board: string[][]):void {
        for (let i:number = 0; i < board.length; i++) {
            for (let j:number = 0; j < board[i].length; j++) {
                this.board[i].push(new Cell(i, j, board[i][j]));
            }
        }
    }

    /**
     * Adds every empty cell in board to cells
     * @param cells - cell array
     */
    private addEveryEmptyCell(cells: Cell[][]):void {
        for (let row:number = 0; row < SudokuEnum.COLUMN_LENGTH; row++) {
            for (let column:number = 0; column < SudokuEnum.ROW_LENGTH; column++) {
                if (this.board[row][column].isEmpty()) {
                    cells[row].push(this.board[row][column]);
                }
            }
        }
        return;
    }

    /**
     * Places values from given cells into board
     * @param cells - cells array
     */
    private placeValues(cells: Cell[]):void {
        let row:number, column:number;
        for (let i:number = 0; i < cells.length; i++) {
            row = cells[i].getRow();
            column = cells[i].getColumn();
            this.board[row][column].setValue(cells[i].getValue());
            this.simplifyNotes(this.board[row][column]);
        }
        return;
    }
}