import { Cell } from "./Cell";
import { CustomError, CustomErrorEnum } from "./CustomError";
import { Strategy } from "./Strategy";
import { SudokuEnum, StrategyEnum } from "./Sudoku";
import { HiddenSingleHint, Hint, NakedPairHint, NakedSingleHint } from "./Hint";
import { Group } from "./Group";

/**
 * Constructed using 2d board array
 * Returns:
 * Strategy used to solve each step or null if solved or unsolvable error
 * Solution 2d board array
 */
export class Solver{
    // Stores representation of board being solved
    private board: Cell[][];
    // Stores whether or not the board has been successfully solved
    private solved: boolean;
    // Stores a hint corresponding to a step
    private hint: Hint;
    // Stores order in which the Solver uses strategies to solve the Sudoku board (modified for testing strategies)
    private algorithm: StrategyEnum[];

    /**
     * Creates solver object
     * @param board - 2d board array
     * @param algorithm - optional parameter specifying order to apply strategies
     */
    constructor(board: string[][], algorithm: StrategyEnum[] = Strategy.getDefaultAlgorithm()) {
        this.board = new Array();
        this.initializeCellArray(this.board, board.length);
        this.initializeBoard(board);
        this.simplifyAllNotes();
        this.solved = false;
        this.algorithm = algorithm;
    }

    /**
     * Takes the next step in solving puzzle
     * @returns hint used or null if finished
     * @throws {@link CustomError}
     * Thrown if board is unsolvable
     */
    public nextStep():Hint {
        let cells: Cell[][] = new Array();
        this.initializeCellArray(cells, SudokuEnum.COLUMN_LENGTH);
        this.addEveryEmptyCell(cells);

        if (this.isFinished(cells)) {
            return null;
        }

        this.setHint(cells);
        if (this.hint !== null) {
            this.applyHint();
            return this.hint;
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
     * Gets and sets the next hint if a strategy can be applied, otherwise sets to null
     * @param cells - empty cells
     */
    private setHint(cells: Cell[][]):void {
        // Attempts to use strategies in order specified by algorithm
        for (let i: number = 0; i < StrategyEnum.COUNT; i++) {
            if (this.algorithm[i] === StrategyEnum.NAKED_SINGLE && this.setNakedSingle(cells)) {
                return;
            }
            else if (this.algorithm[i] === StrategyEnum.HIDDEN_SINGLE && this.setHiddenSingle(cells)) {
                return;
            }
            else if (this.algorithm[i] === StrategyEnum.NAKED_PAIR && this.setNakedPair(cells)) {
                return;
            }
        }
    }

    /**
     * Applies hint (places values according to hint)
     */
    private applyHint():void {
        this.placeValues(this.hint.getEffectPlacements());
        this.removeNotes(this.hint.getEffectRemovals());
    }

    /**
     * Returns true if puzzle has a naked single and sets hint, otherwise returns false
     * @param cells - empty cells
     * @returns true if contains a naked single
     */
    private setNakedSingle(cells: Cell[][]):boolean {
        // Checks every cell for a naked single
        for (let i:number = 0; i < cells.length; i++) {
            for (let j:number = 0; j < cells[i].length; j++) {
                // Creates a Cell array containing a possible naked single
                let single: Cell[][] = new Array();
                this.initializeCellArray(single, 1);
                single[0].push(cells[i][j]);
                // Create a naked single strategy using the array of cells
                let nakedSingle: Strategy = new Strategy(this.board, single);
                // Checks if strategy object constitutes a naked single
                if (nakedSingle.isNakedSingle()) {
                    this.hint = new NakedSingleHint(nakedSingle);
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * If given Strategy is a hidden single it sets the hint to it and returns true
     * @param hiddenSingle - Strategy
     * @returns true if given Strategy is a hidden single
     */
    private setHiddenSingleHint(hiddenSingle: Strategy):boolean {
        if (hiddenSingle.isHiddenSingle()) {
            this.hint = new HiddenSingleHint(hiddenSingle);
            return true;
        }
        return false;
    }

    /**
     * If given Strategy is a naked pair it sets the hint to it and returns true
     * @param nakedPair - Strategy
     * @returns true if given Strategy is a naked pair
     */
    private setNakedPairHint(nakedPair: Strategy):boolean {
        if (nakedPair.isNakedPair()) {
            this.hint = new NakedPairHint(nakedPair);
            return true;
        }
        return false;
    }

    /**
     * Returns true if puzzle has given strategy (in a row, column, or box) and sets hint, otherwise returns false
     * @param strategy - strategy to check for
     * @param cells - cells to create strategy with
     * @returns true if contains given strategy
     */
    private setGroupStrategy(strategy: StrategyEnum, cells: Cell[][]):boolean {
        // Checks every group of rows, columns, and boxes for given strategy
        for (let group:number = 0; group < SudokuEnum.ROW_LENGTH; group++) {
            let row: Strategy = Strategy.getRowStrategy(this.board, cells, group);
            let column: Strategy = Strategy.getColumnStrategy(this.board, cells, group);
            let box: Strategy = Strategy.getBoxStrategy(this.board, cells, group);
            if (strategy === StrategyEnum.HIDDEN_SINGLE) {
                if (this.setHiddenSingleHint(row) || this.setHiddenSingleHint(column) || this.setHiddenSingleHint(box)) {
                    return true;
                }
            }
            else if (strategy === StrategyEnum.NAKED_PAIR) {
                if (this.setNakedPairHint(row) || this.setNakedPairHint(column) || this.setNakedPairHint(box)) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Returns true if puzzle has a hidden single and sets hint, otherwise returns false
     * @param cells - empty cells
     * @returns true if contains a hidden single
     */
    private setHiddenSingle(cells: Cell[][]):boolean {
        return this.setGroupStrategy(StrategyEnum.HIDDEN_SINGLE, cells);
    }

    /**
     * Returns true if puzzle has a naked pair and sets hint, otherwise returns false
     * @param cells - empty cells
     * @returns true if contains a naked pair
     */
    private setNakedPair(cells: Cell[][]):boolean {
        return this.setGroupStrategy(StrategyEnum.NAKED_PAIR, cells);
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
        return this.getBoard();
    }

    /**
     * Returns current state of the board being solved
     * @returns current board array
     */
    public getBoard():string[][] {
        let board:string[][] = new Array();
        for (let row:number = 0; row < SudokuEnum.COLUMN_LENGTH; row++) {
            board.push(new Array());
            for (let column:number = 0; column < SudokuEnum.ROW_LENGTH; column++) {
                board[row].push(this.board[row][column].getValue());
            }
        }
        return board;
    }

    /**
     * Returns current notes stored by the Solver
     * @returns array of notes arrays in order (one array with an array for each cell)
     */
    public getNotes():string[][] {
        let notes:string[][] = new Array();
        let i:number = -1;
        for (let row:number = 0; row < SudokuEnum.COLUMN_LENGTH; row++) {
            for (let column:number = 0; column < SudokuEnum.ROW_LENGTH; column++) {
                notes.push(new Array());
                i++;
                let cellNotes:Group = this.board[row][column].getNotes();
                for (let j:number = 0; j < SudokuEnum.ROW_LENGTH; j++) {
                    if (cellNotes.contains(j)) {
                        notes[i].push((j+1).toString());
                    }
                }
            }
        }
        return notes;
    }

    /**
     * Simplify notes by removing filled cells values from rest of their row/column/boxes
     */
    private simplifyAllNotes():void {
        for (let column:number = 0; column < SudokuEnum.ROW_LENGTH; column++) {
            for (let row:number = 0; row < SudokuEnum.COLUMN_LENGTH; row++) {
                if (!this.board[row][column].isEmpty()) {
                    this.simplifyNotes(this.board[row][column]);
                }
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

    /**
     * Removes given notes from board
     * @param notes - Groups containing notes to remove
     */
    private removeNotes(notes: Group[]):void {
        let row:number, column:number;
        for (let i:number = 0; i < notes.length; i++) {
            row = notes[i].getRow();
            column = notes[i].getColumn();
            this.board[row][column].removeNotes(notes[i]);
        }
    }
}