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
        this.initializeCellArray(this.board, board.length);
        for (let i:number = 0; i < board.length; i++) {
            for (let j:number = 0; j < board[i].length; j++) {
                this.board[i].push(new Cell(i, j, board[i][j]));
            }
        }

        this.solved = false;
    }

    public nextStep():number {
        let cells: Cell[][];
        this.initializeCellArray(cells, this.board.length);
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
                this.initializeCellArray(single, 1);
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
                    cells[i].push(new Cell(i, j));
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