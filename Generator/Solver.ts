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
     * @constructor
     * @param {string[][]} board - 2d board array
     */
    constructor(board: string[][]) {
        //this.initializeCellArray(this.board, board.length);
        this.board = new Array();
        for (let i:number = 0; i < board.length; i++) {
            this.board.push(new Array());
        }
        for (let i:number = 0; i < board.length; i++) {
            for (let j:number = 0; j < board[i].length; j++) {
                this.board[i].push(new Cell(i, j, board[i][j]));
            }
        }

        // Simplify notes by removing filled cells values from rest of their row/column/boxes
        for (let column:number = 0; column < SudokuEnum.ROW_LENGTH; column++) {
            for (let row:number = 0; row < SudokuEnum.COLUMN_LENGTH; row++) {
                this.simplifyNotes(this.board[row][column]);
            }
        }

        this.solved = false;
    }

    public nextStep():number {
        let cells: Cell[][];
        //this.initializeCellArray(cells, this.board.length);
        cells = new Array();
        for (let i:number = 0; i < SudokuEnum.COLUMN_LENGTH; i++) {
            cells.push(new Array());
        }
        this.addEveryEmptyCell(cells);
        // Check if finished
        for (let i: number = 0; i < cells.length; i++) {
            if (cells[i].length > 0) {
                i = cells.length;
            }
            if (i === (cells.length - 1)) {
                this.solved = true;
                return null;
            }
        }
        // Check for naked singles
        for (let i:number = 0; i < cells.length; i++) {
            for (let j:number = 0; j < cells[i].length; j++) {
                let single: Cell[][];
                //this.initializeCellArray(single, 1);
                single = new Array();
                single.push(new Array());
                single[0].push(cells[i][j]);
                let nakedSingle: Strategy = new Strategy(single);
                if (nakedSingle.isNakedSingle()) {
                    this.placeValues(nakedSingle.getValuesToPlace());
                    return StrategyEnum.NAKED_SINGLE;
                }
            }
        }
        throw new CustomError(CustomErrorEnum.UNSOLVABLE);
    }

    public getSolution():string[][] {
        if (!this.solved) {
            // throw error
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

    private initializeCellArray(cells: Cell[][], rowCount: number):void {
        cells = new Array();
        for (let i:number = 0; i < rowCount; i++) {
            cells.push(new Array());
        }
        return;
    }

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