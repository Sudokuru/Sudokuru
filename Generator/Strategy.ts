import { Cell } from "./Cell";
import { CustomError, CustomErrorEnum } from "./CustomError";
import { SudokuEnum, StrategyEnum, getCellsInRow, getCellsInColumn, getCellsInBox, GroupEnum, getNextCellInGroup, TupleEnum } from "./Sudoku"
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
     * Given a cell and a group type and a subset returns whether or not the cell is in the part of the group designated by the subset
     * For example if the group is ROW and the subset contains 1 and 3 then returns whether or not the cell is in the 2nd or 4th column of the row
     * @param subset - contains some candidates in group
     * @param cell - cell in group
     * @param group - group e.g. row, column, or box
     * @returns if cell is in subset of group
     */
    private inSubset(subset: Group, cell: Cell, group: GroupEnum):boolean {
        if (group === GroupEnum.ROW) {
            return subset.contains(cell.getColumn());
        }
        else if (group === GroupEnum.COLUMN) {
            return subset.contains(cell.getRow());
        }
        else {
            let boxRowStart:number = Cell.getBoxRowStart(cell.getBox());
            let boxColumnStart:number = Cell.getBoxColumnStart(cell.getBox());
            let boxIndex:number = (cell.getRow() - boxRowStart) * 3;
            boxIndex += cell.getColumn() - boxColumnStart;
            return subset.contains(boxIndex);
        }
    }

    /**
     * Checks if strategy is a naked set of given tuple and if so adds values that can be placed
     * @param tuple - e.g. could be single or pair for naked single or naked pair respectively
     * @returns true if strategy is a naked tuple
     */
    public isNakedSet(tuple: TupleEnum):boolean {
        // Checks if tuple exists by getting all cells (with note size <= tuple) in each group and trying to build tuple
        // Checks every subset (combination) of cells in each group (row/column/box)
        let subsets:Group[] = Group.getSubset(tuple);
        // Used to prevent adding cells to notes to remove multiple times when evaluating box after finding row/column set
        let usedRow:number = -1;
        let usedColumn:number = -1;
        for (let group:GroupEnum = 0; group < GroupEnum.COUNT; group++) {
            for (let i:number = 0; i < SudokuEnum.ROW_LENGTH; i++) {
                // Contains cells in the same row, column, or box
                let cells: Cell[] = new Array();
                let nextCell:Cell = getNextCellInGroup(this.cells, null, group, i);
                // Adds every cell in same row, column, or box to cells
                while (nextCell !== null) {
                    cells.push(nextCell);
                    nextCell = getNextCellInGroup(this.cells, cells[cells.length - 1], group);
                }
                // Tries to build a naked set of size tuple for each possible size tuple subset of candidates
                // Is naked set iff union of all cells has notes size equal to tuple
                for (let j:number = 0; j < subsets.length; j++) {
                    // Stores indexes of the cells that make up the naked set
                    let inNakedSet:Group = new Group(false);
                    // Stores the cellls that make up the naked set
                    let nakedSet:Cell[] = new Array();
                    // Adds each cell in cells that is part of the subset to the naked set
                    for (let k:number = 0; k < cells.length; k++) {
                        if (this.inSubset(subsets[j], cells[k], group)) { 
                            nakedSet.push(cells[k]);
                            inNakedSet.insert(k);
                        }
                    }
                    // If naked set is correct size (i.e. every element in subset was in cells)
                    if (nakedSet.length === tuple) {
                        // Stores notes contained by cells in naked set
                        let nakedSetNotes:Group[] = new Array();
                        for (let k:number = 0; k < tuple; k++) {
                            nakedSetNotes.push(nakedSet[k].getNotes());
                        }
                        // Calculates alll notes in naked set
                        let nakedSetCandidates:Group = Group.union(nakedSetNotes);
                        // If naked set has correct number of notes
                        if (nakedSetCandidates.getSize() <= tuple) {
                            // If it is a naked single places value
                            if (tuple === TupleEnum.SINGLE) {
                                let row:number = nakedSet[0].getRow();
                                let column:number = nakedSet[0].getColumn();
                                let single:string = undefined;
                                for (let singleCandidate:number = 0; singleCandidate < SudokuEnum.ROW_LENGTH; singleCandidate++) {
                                    if (nakedSetCandidates.contains(singleCandidate)) {
                                        single = (singleCandidate+1).toString();
                                    }
                                }
                                this.values.push(new Cell(row, column, single));
                                this.strategyType = StrategyEnum.NAKED_SINGLE;
                                this.identified = true;
                                return true;
                            }
                            // Adds notes to remove if there are any to remove
                            for (let k:number = 0; k < cells.length; k++) {
                                // If cell isn't part of naked set itself and it contains some of the same values as naked set remove them
                                // Skip if row or column is 'used' i.e. removed due to shared row or column already and checking for others in shared box
                                if (!inNakedSet.contains(k) && (cells[k].getNotes().intersection(nakedSetCandidates)).getSize() > 0 && 
                                    cells[k].getRow() !== usedRow && cells[k].getColumn () !== usedColumn) {
                                    let notes:Group = new Group(false, cells[k].getRow(), cells[k].getColumn());
                                    notes.insert(nakedSetCandidates);
                                    this.notes.push(notes);
                                }
                            }
                            // If notes can be removed as result of naked set then it is a valid strategy
                            if (this.notes.length > 0) {
                                if (tuple === TupleEnum.PAIR) {
                                    this.strategyType = StrategyEnum.NAKED_PAIR;
                                }
                                else if (tuple === TupleEnum.TRIPLET) {
                                    this.strategyType = StrategyEnum.NAKED_TRIPLET;
                                }
                                else if (tuple === TupleEnum.QUADRUPLET) {
                                    this.strategyType = StrategyEnum.NAKED_QUADRUPLET;
                                }
                                else if (tuple === TupleEnum.QUINTUPLET) {
                                    this.strategyType = StrategyEnum.NAKED_QUINTUPLET;
                                }
                                else if (tuple === TupleEnum.SEXTUPLET) {
                                    this.strategyType = StrategyEnum.NAKED_SEXTUPLET;
                                }
                                else if (tuple === TupleEnum.SEPTUPLET) {
                                    this.strategyType = StrategyEnum.NAKED_SEPTUPLET;
                                }
                                this.identified = true;
                                // If naked set shares a row or column it might also share a box so skip to check that
                                if (group !== GroupEnum.BOX) {
                                    // Set used row or column to avoiding adding same cells notes twice
                                    if (group === GroupEnum.ROW) {
                                        usedRow = this.notes[0].getRow();
                                    }
                                    else {
                                        usedColumn = this.notes[0].getColumn();
                                    }
                                    // Skip to box part of for loop to check if box is also shared
                                    group = GroupEnum.BOX - 1;
                                    j = subsets.length;
                                    i = SudokuEnum.ROW_LENGTH;
                                }
                            }
                        }
                    }
                }
            }
        }
        return this.identified;
    }

    /**
     * Checks if strategy is a naked single and if so adds values that can be placed
     * @returns true if strategy is a naked single
     */
    public isNakedSingle():boolean {
        return this.isNakedSet(TupleEnum.SINGLE);
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
        return this.isNakedSet(TupleEnum.PAIR);
    }

    /**
     * Checks if strategy is a naked triplet and if so adds notes that can be removed
     * @returns true if strategy is a naked triplet
     */
    public isNakedTriplet():boolean {
        return this.isNakedSet(TupleEnum.TRIPLET);
    }

    /**
     * Checks if strategy is a naked quadruplet and if so adds notes that can be removed
     * @returns true if strategy is a naked quadruplet
     */
    public isNakedQuadruplet():boolean {
        return this.isNakedSet(TupleEnum.QUADRUPLET);
    }

    /**
     * Checks if strategy is a naked quintuplet and if so adds notes that can be removed
     * @returns true if strategy is a naked quintuplet
     */
    public isNakedQuintuplet():boolean {
        return this.isNakedSet(TupleEnum.QUINTUPLET);
    }

    /**
     * Checks if strategy is a naked sextuplet and if so adds notes that can be removed
     * @returns true if strategy is a naked sextuplet
     */
    public isNakedSextuplet():boolean {
        return this.isNakedSet(TupleEnum.SEXTUPLET);
    }

    /**
     * Checks if strategy is a naked septuplet and if so adds notes that can be removed
     * @returns true if strategy is a naked septuplet
     */
    public isNakedSeptuplet():boolean {
        return this.isNakedSet(TupleEnum.SEPTUPLET);
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