import { Cell } from "./Cell";
import { CustomError, CustomErrorEnum } from "./CustomError";
import { Strategy } from "./Strategy";
import { SudokuEnum, StrategyEnum } from "./Sudoku";
import { Hint } from "./Hint";
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
    // Stores empty cells in board
    private emptyCells: Cell[][];
    // Stores whether or not the board has been successfully solved
    private solved: boolean;
    // Stores a hint corresponding to a step
    private hint: Hint;
    // Stores hints for all strategies that are applicable at this step
    private allHints: Hint[];
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
        if (notes !== undefined) {
            this.setNotes(notes);
        }
        this.setEmptyCells();
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
        if (this.isFinished(this.emptyCells)) {
            return null;
        }

        this.setHint(this.emptyCells);
        if (this.hint !== null) {
            this.applyHint();
            // Resets allHints so getAllHints doesn't return Hints from prior step
            this.allHints = undefined;
            // Updates empty cells
            this.setEmptyCells();
            return this.hint;
        }

        throw new CustomError(CustomErrorEnum.UNSOLVABLE);
    }

    /**
     * Gets an array containing Hint objects for each strategy that can be used at this step
     * @returns array of Hints for all applicable strategies at this step
     */
    public getAllHints():Hint[] {
        if (this.allHints === undefined) {
            this.setAllHints();
        }
        return this.allHints;
    }

    /**
     * Creates a Hint object for each strategy that can be used at this step and adds it to allHints
     */
    private setAllHints():void {
        this.allHints = new Array();
        for (let strategy: StrategyEnum = (StrategyEnum.INVALID + 1); strategy < StrategyEnum.COUNT; strategy++) {
            let strategyObj:Strategy = new Strategy(this.board, this.emptyCells);
            if (strategyObj.setStrategyType(strategy)) {
                this.allHints.push(new Hint(strategyObj));
            }
        }
        return;
    }

    /**
     * Sets emptyCells to be all of the empty cells in the board
     */
    private setEmptyCells():void {
        this.emptyCells = new Array();
        this.initializeCellArray(this.emptyCells, SudokuEnum.COLUMN_LENGTH);
        this.addEveryEmptyCell(this.emptyCells);
        return;
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
        let strategy:Strategy = new Strategy(this.board, cells);
        for (let i: number = 0; i < StrategyEnum.COUNT; i++) {
            if (strategy.setStrategyType(this.algorithm[i])) {
                this.hint = new Hint(strategy);
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