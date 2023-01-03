import { Cell } from "./Cell";
import { CustomError, CustomErrorEnum } from "./CustomError";
import { SudokuEnum, StrategyEnum, getCellsInRow, getCellsInColumn, getCellsInBox, getNextCell, GroupEnum, getNextCellInGroup } from "./Sudoku"
import { Group } from "./Group";

/**
 * Constructed using 2d array of cells
 * Returns:
 * Whether or object constitutes specific strategies
 * Cause (cells that "cause" the strategy to be applicable)
 * What candidates can be placed as result of strategy
 * What candidates can be removed from cells notes as result of strategy
 * What strategy type this is (correlates to StrategyEnum)
 */
export class Strategy{
    // Contains representation of board being solved
    private board: Cell[][];
    // Contains cells that "cause" strategy to be applicable
    private cells: Cell[][];
    // Contains values that can be placed because of this Strategy
    private values: Cell[];
    // Contains notes that can be removed because of this Strategy
    private notes: Group[];
    // What specific strategy is used (correlated to StrategyEnum)
    private strategyType: number;
    // Whether or not strategy has been identified and ready to use
    private identified: boolean;

    /**
     * Cell object using cells the strategy acts on
     * @constructor
     * @param cells - cells
     */
    constructor(board: Cell[][], cells: Cell[][]) {
        this.board = board;
        this.cells = cells;
        this.identified = false;
        this.values = new Array();
        this.notes = new Array();
    }

    /**
     * Gets cells that "cause" strategy to be applicable
     * @returns cells
     * @throws {@link CustomError}
     * Thrown if strategy hasn't been identified
     */
    public getCause():Cell[][] {
        this.verifyIdentified();
        return this.cells;
    }

    /**
     * Gets values that can be placed
     * @returns Cells containing values that can be placed
     * @throws {@link CustomError}
     * Thrown if strategy hasn't been identified
     */
    public getValuesToPlace():Cell[] {
        this.verifyIdentified();
        return this.values;
    }

    /**
     * Gets notes that can be removed
     * @returns Cells containing notes that can be removed
     * @throws {@link CustomError}
     * Thrown if strategy hasn't been identified
     */
    public getNotesToRemove():Group[] {
        this.verifyIdentified();
        return this.notes;
    }

    /**
     * Verified that a strategy has been identified, otherwise throws an error
     * @throws {@link CustomError}
     * Thrown if strategy hasn't been identified
     */
    private verifyIdentified():void {
        if (!this.identified) {
            throw new CustomError(CustomErrorEnum.STRATEGY_NOT_IDENTIFIED);
        }
        return;
    }

    /**
     * Gets strategyType
     * @returns strategyType
     */
    public getStrategyType():number {
        return this.strategyType;
    }

    /**
     * Checks if strategy is a naked single and if so adds values that can be placed
     * @returns true if strategy is a naked single
     */
    public isNakedSingle():boolean {
        let notes:Group = this.cells[0][0].getNotes();
        // If the Cell provided only has 1 note then it is a naked single
        if (notes.getSize() == 1) {
            // Add Cell to values that can be placed
            for (let i:number = 0; i < SudokuEnum.ROW_LENGTH; i++) {
                if (notes.contains(i)) {
                    let row:number = this.cells[0][0].getRow();
                    let column:number = this.cells[0][0].getColumn();
                    this.values.push(new Cell(row, column, (i+1).toString()));
                }
            }
            // Identify strategy and return that it is a naked single
            this.strategyType = StrategyEnum.NAKED_SINGLE;
            this.identified = true;
            return true;
        }
        return false;
    }

    /**
     * Checks if strategy is a hidden single and if so adds values that can be placed
     * @returns true if strategy is a hidden single
     */
    public isHiddenSingle():boolean {
        // stores candidates found in the cells
        let found:Group = new Group(false);
        // stores possible hidden single for each candidate at their corresponding index
        // initialized to null, set to cell with hidden single, reset to null if multiple cells with note found
        let single:Cell[] = new Array(SudokuEnum.ROW_LENGTH).fill(null);

        let notes:Group;
        let row:number, column:number;
        // Checks notes of every empty cell in group (row/column/box) provided
        for (let i:number = 0; i < this.cells.length; i++) {
            for (let j:number = 0; j < this.cells[i].length; j++) {
                // Checks each note of the cell
                notes = this.cells[i][j].getNotes();
                for (let note:number = 0; note < SudokuEnum.ROW_LENGTH; note++) {
                    if (notes.contains(note)) {
                        // Add cell to hidden single Cell if this note not found before, otherwise set to null
                        if (found.insert(note)) {
                            row = this.cells[i][j].getRow();
                            column = this.cells[i][j].getColumn();
                            single[note] = new Cell(row, column, (note+1).toString());
                        }
                        else {
                            single[note] = null;
                        }
                    }
                }
            }
        }

        // Checks if a hidden single was found
        for (let i:number = 0; i < SudokuEnum.ROW_LENGTH; i++) {
            if (found.contains(i) && single[i] !== null) {
                // Identify strategy and return that it is a hidden single
                this.values.push(single[i]);
                this.strategyType = StrategyEnum.HIDDEN_SINGLE;
                this.identified = true;
                return true;
            }
        }
        return false;
    }

    /**
     * Checks if strategy is a naked pair and if so adds notes that can be removed
     * @returns true if strategy is a naked pair
     */
    public isNakedPair():boolean {
        // Checks each pair by checking each cell against every cell in "front" of it
        let cell: Cell, nextCell: Cell;
        for (let row:number = 0; row < this.cells.length; row++) {
            for (let column:number = 0; column < this.cells[row].length; column++) {
                cell = this.cells[row][column];
                for (let group:GroupEnum = 0; group < GroupEnum.COUNT; group++) {
                    nextCell = getNextCellInGroup(this.cells, cell, group);
                    while (nextCell !== null) {
                        if (cell.getNotes().getSize() === 2 && cell.getNotes().equals(nextCell.getNotes())) {
                            // If the pair shares a row can remove them from every cell in row (except themselves)
                            if (group === GroupEnum.ROW) {
                                for (let column:number = 0; column < SudokuEnum.ROW_LENGTH; column++) {
                                    if (column !== cell.getColumn() && column !== nextCell.getColumn()) {
                                        // Adds notes to remove if there are any to remove
                                        if (this.board[cell.getRow()][column].getNotes().intersection(cell.getNotes()).getSize() > 0) {
                                            let notes:Group = new Group(false, cell.getRow(), column);
                                            notes.insert(cell.getNotes());
                                            this.notes.push(notes);
                                        }
                                    }
                                }
                            }
                            // If the pair shares a column can remove them from every cell in column (except themselves)
                            if (group === GroupEnum.COLUMN) {
                                for (let row:number = 0; row < SudokuEnum.COLUMN_LENGTH; row++) {
                                    if (row !== cell.getRow() && row !== nextCell.getRow()) {
                                        // Adds notes to remove if there are any to remove
                                        if (this.board[row][cell.getColumn()].getNotes().intersection(cell.getNotes()).getSize() > 0) {
                                            let notes:Group = new Group(false, row, cell.getColumn());
                                            notes.insert(cell.getNotes());
                                            this.notes.push(notes);
                                        }
                                    }
                                }
                            }
                            // If the pair shares a box can remove them from every cell in box (except themselves)
                            if (group === GroupEnum.BOX) {
                                let box:number = cell.getBox();
                                let columnStart:number = Cell.getBoxColumnStart(box);
                                let rowStart:number = Cell.getBoxRowStart(box);
                                for (let column:number = columnStart; column < (columnStart + SudokuEnum.BOX_LENGTH); column++) {
                                    for (let row:number = rowStart; row < (rowStart + SudokuEnum.BOX_LENGTH); row++) {
                                        if ((row !== cell.getRow() || column !== cell.getColumn()) && 
                                            (row !== nextCell.getRow() || column !== nextCell.getColumn())) {
                                            // Adds notes to remove if there are any to remove
                                            if (this.board[row][column].getNotes().intersection(cell.getNotes()).getSize() > 0) {
                                                let notes:Group = new Group(false, row, column);
                                                notes.insert(cell.getNotes());
                                                this.notes.push(notes);
                                            }
                                        }
                                    }
                                }
                            }
                            if (this.notes.length !== 0) {
                                this.strategyType = StrategyEnum.NAKED_PAIR;
                                this.identified = true;
                                return true;
                            }
                        }
                        nextCell = getNextCellInGroup(this.cells, nextCell, group);
                    }
                }
            }
        }
        return false;
    }

    /**
     * Creates a Strategy object centered around the nth row in the given board
     * @param cells - cells in a board
     * @param n - row creating strategy around
     * @returns strategy using given row
     */
    public static getRowStrategy(board: Cell[][], cells: Cell[][], n: number):Strategy {
        let row: Cell[][] = getCellsInRow(cells, n);
        return new Strategy(board, row);
    }

    /**
     * Creates a Strategy object centered around the nth column in the given board
     * @param cells - cells in a board
     * @param n - column creating strategy around
     * @returns strategy using given column
     */
    public static getColumnStrategy(board: Cell[][], cells: Cell[][], n: number):Strategy {
        let column: Cell[][] = getCellsInColumn(cells, n);
        return new Strategy(board, column);
    }

    /**
     * Creates a Strategy object centered around the nth box in the given board
     * @param cells - cells in a board
     * @param n - box creating strategy around
     * @returns strategy using given box
     */
    public static getBoxStrategy(board: Cell[][], cells: Cell[][], n: number):Strategy {
        let box: Cell[][] = getCellsInBox(cells, n);
        return new Strategy(board, box);
    }

    /**
     * Returns algorithm which includes all of the strategies in order of least to most complex
     * @returns default algorithm
     */
    public static getDefaultAlgorithm():StrategyEnum[] {
        let algorithm:StrategyEnum[] = new Array();
        // Adds strategies in order of least to most complex
        for (let strategy: number = 0; strategy < StrategyEnum.COUNT; strategy++) {
            algorithm.push(strategy);
        }
        return algorithm;
    }
}