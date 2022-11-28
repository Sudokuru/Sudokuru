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

        // simplify notes THIS NEEDS TO BE WORKED ON
        // need to simpliyf for columns and boxes
        // need to refactor so this is done when values placed
        for (let i:number = 0; i < board.length; i++) {
            for (let j:number = 0; j < board[i].length; j++) {
                if (this.board[i][j].isEmpty()) {
                    // remove notes from non empty cells in same row
                    for (let r:number = 0; r < board[i].length; r++) {
                        if (!this.board[i][r].isEmpty()) {
                            this.board[i][j].removeNote(this.board[i][r].getValue());
                        }
                    }
                }
            }
        }

        this.solved = false;
    }

    public nextStep():number {
        let cells: Cell[][];
        //this.initializeCellArray(cells, this.board.length);
        cells = new Array();
        for (let i:number = 0; i < this.board.length; i++) {
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

    private initializeCellArray(cells: Cell[][], rowCount: number):void {
        cells = new Array();
        for (let i:number = 0; i < rowCount; i++) {
            cells.push(new Array());
        }
        return;
    }

    private addEveryEmptyCell(cells: Cell[][]):void {
        for (let i:number = 0; i < this.board.length; i++) {
            for (let j:number = 0; j < this.board[i].length; j++) {
                if (this.board[i][j].isEmpty()) {
                    //cells[i].push(new Cell(i, j));
                    cells[i].push(this.board[i][j]);
                }
            }
        }
        return;
    }

    private placeValues(cells: Cell[]):void {
        for (let i:number = 0; i < cells.length; i++) {
            this.board[cells[i].getRow()][cells[i].getColumn()].setValue(cells[i].getValue());
        }
        return;
    }
}