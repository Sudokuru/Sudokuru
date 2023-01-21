import { Cell } from "./Cell";
import { CustomError, CustomErrorEnum } from "./CustomError";
import { Strategy } from "./Strategy";
import { SudokuEnum, StrategyEnum } from "./Sudoku";
import { HiddenSingleHint, Hint, NakedPairHint, NakedSingleHint, NakedTripletHint, NakedQuadrupletHint, NakedQuintupletHint, NakedSextupletHint, NakedSeptupletHint, NakedOctupletHint } from "./Hint";
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
     * @param notes - optional parameter specifying initial state of the notes (one array with an array for each cell in order)
     */
    constructor(board: string[][], algorithm: StrategyEnum[] = Strategy.getDefaultAlgorithm(), notes?: string[][]) {
        this.board = new Array();
        this.initializeCellArray(this.board, board.length);
        this.initializeBoard(board);
        if (notes === undefined) {
            this.simplifyAllNotes();
        }
        else {
            this.setNotes(notes);
        }
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
            else if (this.algorithm[i] === StrategyEnum.NAKED_TRIPLET && this.setNakedTriplet(cells)) {
                return;
            }
            else if (this.algorithm[i] === StrategyEnum.NAKED_QUADRUPLET && this.setNakedQuadruplet(cells)) {
                return;
            }
            else if (this.algorithm[i] === StrategyEnum.NAKED_QUINTUPLET && this.setNakedQuintuplet(cells)) {
                return;
            }
            else if (this.algorithm[i] === StrategyEnum.NAKED_SEXTUPLET && this.setNakedSextuplet(cells)) {
                return;
            }
            else if (this.algorithm[i] === StrategyEnum.NAKED_SEPTUPLET && this.setNakedSeptuplet(cells)) {
                return;
            }
            else if (this.algorithm[i] === StrategyEnum.NAKED_OCTUPLET && this.setNakedOctuplet(cells)) {
                return;
            }
        }
        this.hint = null;
        return;
    }

    /**
     * Applies hint (places values according to hint)
     */
    private applyHint():void {
        this.placeValues(this.hint.getEffectPlacements());
        this.removeNotes(this.hint.getEffectRemovals());
    }

    /**
     * Returns true if puzzle has a hidden single and sets hint, otherwise returns false
     * @param cells - empty cells
     * @returns true if contains a hidden single
     */
    private setHiddenSingle(cells: Cell[][]):boolean {
        let hiddenSingle: Strategy = new Strategy(this.board, cells);
        if (hiddenSingle.isHiddenSingle()) {
            this.hint = new HiddenSingleHint(hiddenSingle);
            return true;
        }
        return false;
    }

    /**
     * Returns true if puzzle has a naked single and sets hint, otherwise returns false
     * @param cells - empty cells
     * @returns true if contains a naked single
     */
    private setNakedSingle(cells: Cell[][]):boolean {
        let nakedSingle: Strategy = new Strategy(this.board, cells);
        if (nakedSingle.isNakedSingle()) {
            this.hint = new NakedSingleHint(nakedSingle);
            return true;
        }
        return false;
    }

    /**
     * Returns true if puzzle has a naked pair and sets hint, otherwise returns false
     * @param cells - empty cells
     * @returns true if contains a naked pair
     */
    private setNakedPair(cells: Cell[][]):boolean {
        let nakedPair: Strategy = new Strategy(this.board, cells);
        if (nakedPair.isNakedPair()) {
            this.hint = new NakedPairHint(nakedPair);
            return true;
        }
        return false;
    }

    /**
     * Returns true if puzzle has a naked triplet and sets hint, otherwise returns false
     * @param cells - empty cells
     * @returns true if contains a naked triplet
     */
    private setNakedTriplet(cells: Cell[][]):boolean {
        let nakedTriplet: Strategy = new Strategy(this.board, cells);
        if (nakedTriplet.isNakedTriplet()) {
            this.hint = new NakedTripletHint(nakedTriplet);
            return true;
        }
        return false;
    }

    /**
     * Returns true if puzzle has a naked quadruplet and sets hint, otherwise returns false
     * @param cells - empty cells
     * @returns true if contains a naked quadruplet
     */
    private setNakedQuadruplet(cells: Cell[][]):boolean {
        let nakedQuadruplet: Strategy = new Strategy(this.board, cells);
        if (nakedQuadruplet.isNakedQuadruplet()) {
            this.hint = new NakedQuadrupletHint(nakedQuadruplet);
            return true;
        }
        return false;
    }

    /**
     * Returns true if puzzle has a naked quintuplet and sets hint, otherwise returns false
     * @param cells - empty cells
     * @returns true if contains a naked quintuplet
     */
    private setNakedQuintuplet(cells: Cell[][]):boolean {
        let nakedQuintuplet: Strategy = new Strategy(this.board, cells);
        if (nakedQuintuplet.isNakedQuintuplet()) {
            this.hint = new NakedQuintupletHint(nakedQuintuplet);
            return true;
        }
        return false;
    }

    /**
     * Returns true if puzzle has a naked sextuplet and sets hint, otherwise returns false
     * @param cells - empty cells
     * @returns true if contains a naked sextuplet
     */
    private setNakedSextuplet(cells: Cell[][]):boolean {
        let nakedSextuplet: Strategy = new Strategy(this.board, cells);
        if (nakedSextuplet.isNakedSextuplet()) {
            this.hint = new NakedSextupletHint(nakedSextuplet);
            return true;
        }
        return false;
    }

    /**
     * Returns true if puzzle has a naked septuplet and sets hint, otherwise returns false
     * @param cells - empty cells
     * @returns true if contains a naked septuplet
     */
    private setNakedSeptuplet(cells: Cell[][]):boolean {
        let nakedSeptuplet: Strategy = new Strategy(this.board, cells);
        if (nakedSeptuplet.isNakedSeptuplet()) {
            this.hint = new NakedSeptupletHint(nakedSeptuplet);
            return true;
        }
        return false;
    }

    /**
     * Returns true if puzzle has a naked octuplet and sets hint, otherwise returns false
     * @param cells - empty cells
     * @returns true if contains a naked octuplet
     */
    private setNakedOctuplet(cells: Cell[][]):boolean {
        let nakedOctuplet: Strategy = new Strategy(this.board, cells);
        if (nakedOctuplet.isNakedOctuplet()) {
            this.hint = new NakedOctupletHint(nakedOctuplet);
            return true;
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
     * Sets boards notes to given notes
     * @param notes - array of notes arrays in order (one array with an array for each cell)
     */
    public setNotes(notes: string[][]):void {
        let index:number;
        for (let row:number = 0; row < SudokuEnum.COLUMN_LENGTH; row++) {
            for (let column:number = 0; column < SudokuEnum.ROW_LENGTH; column++) {
                // Remove every note except ones provided
                let removedNotes:Group = new Group(true);
                index = (row * SudokuEnum.COLUMN_LENGTH) + column;
                for (let note:number = 0; note < notes[index].length; note++) {
                    removedNotes.remove(notes[index][note]);
                }
                this.board[row][column].removeNotes(removedNotes);
            }
        }
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