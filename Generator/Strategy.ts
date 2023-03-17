import { Cell } from "./Cell";
import { CustomError, CustomErrorEnum } from "./CustomError";
import { SudokuEnum, StrategyEnum, getCellsInRow, getCellsInColumn, getCellsInBox, GroupEnum, getNextCellInGroup, TupleEnum, getCellsInGroup, getUnionOfSetNotes, inSubset, getCellsSubset, getCellsInSubset } from "./Sudoku"
import { Group } from "./Group";
import { CellBoard } from "./CellBoard";

/**
 * Includes lower bounds for strategies difficulty ratings
 * @enum
 */
enum DifficultyLowerBounds {
    AMEND_NOTES = 10,
    NAKED_SINGLE = 10,
    HIDDEN_SINGLE = 20,
    NAKED_PAIR = 40,
    NAKED_TRIPLET = 60,
    NAKED_QUADRUPLET = 90,
    NAKED_QUINTUPLET = 140,
    NAKED_SEXTUPLET = 200,
    NAKED_SEPTUPLET = 300,
    NAKED_OCTUPLET = 450,
    SIMPLIFY_NOTES = 10
}

/**
 * Includes upper bounds for strategies difficulty ratings
 * @enum
 */
enum DifficultyUpperBounds {
    AMEND_NOTES = 10,
    NAKED_SINGLE = 10,
    HIDDEN_SINGLE = 40,
    NAKED_PAIR = 60,
    NAKED_TRIPLET = 90,
    NAKED_QUADRUPLET = 140,
    NAKED_QUINTUPLET = 140,
    NAKED_SEXTUPLET = 200,
    NAKED_SEPTUPLET = 300,
    NAKED_OCTUPLET = 450,
    SIMPLIFY_NOTES = 10
}

/**
 * Gets max difficulty
 * @returns largest difficulty upper bound
 */
function getMaxDifficulty():number {
    const upperBounds = Object.values(DifficultyUpperBounds);
    let maxDifficulty:number = DifficultyUpperBounds.SIMPLIFY_NOTES;
    let temp:number;
    for (let i:number = 0; i < upperBounds.length; i++) {
        temp = Number(upperBounds[i]);
        if (!Number.isNaN(temp)) {
            maxDifficulty = Math.max(maxDifficulty, temp);
        }
    }
    return maxDifficulty;
}

export const MAX_DIFFICULTY:number = getMaxDifficulty();

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
    // Contains representation of board being solved and maintains metadata about it
    private cellBoard: CellBoard;
    // Contains representation of board being solved
    private board: Cell[][];
    // Contains cells that "cause" strategy to be applicable (may have same cell multiple times)
    private cause: Cell[];
    // 2d array containing arrays with number representing GroupEnum and index or groups that cause strategy e.g. [[0, 1]] for 2nd row
    private groups: number[][];
    // Cells that don't have a value placed in them yet
    private emptyCells: Cell[][];
    // Contains values that can be placed because of this Strategy
    private values: Cell[];
    // Contains notes that can be removed because of this Strategy
    private notes: Group[];
    // What specific strategy is used (correlated to StrategyEnum)
    private strategyType: number;
    // Whether or not strategy has been identified and ready to use
    private identified: boolean;
    // Stores number representing its difficulty rating (calculated to be in between the strategies upper/lower bounds)
    private difficulty: number;
    // Stores solution board if provided, AmendNotes Strategy can use it to correct players who remove "correct" notes
    private solution: string[][];

    /**
     * Cell object using cells the strategy acts on
     * @constructor
     * @param cells - cells
     */
    constructor(cellBoard: CellBoard, board: Cell[][], emptyCells: Cell[][], solution?: string[][]) {
        this.cellBoard = cellBoard;
        this.board = board;
        this.emptyCells = emptyCells;
        this.identified = false;
        this.values = new Array();
        this.notes = new Array();
        this.cause = new Array();
        this.groups = new Array();
        if (solution !== undefined) {
            this.solution = solution;
        }
    }

    /**
     * Checks if strategy is a given strategy type and if so sets values to place, notes to remove
     * @param strategyType - strategy type that is being checked for
     * @returns true if strategy is strategyType
     */
    public setStrategyType(strategyType: StrategyEnum):boolean {
        if (strategyType === StrategyEnum.AMEND_NOTES && this.isStrategy(StrategyEnum.AMEND_NOTES)) {
            this.strategyType = StrategyEnum.AMEND_NOTES;
            return true;
        }
        else if (strategyType === StrategyEnum.NAKED_SINGLE && this.isNakedSet(TupleEnum.SINGLE)) {
            this.strategyType = StrategyEnum.NAKED_SINGLE;
            return true;
        }
        else if (strategyType === StrategyEnum.NAKED_PAIR && this.isNakedSet(TupleEnum.PAIR)) {
            this.strategyType = StrategyEnum.NAKED_PAIR;
            return true;
        }
        else if (strategyType === StrategyEnum.NAKED_TRIPLET && this.isNakedSet(TupleEnum.TRIPLET)) {
            this.strategyType = StrategyEnum.NAKED_TRIPLET;
            return true;
        }
        else if (strategyType === StrategyEnum.NAKED_QUADRUPLET && this.isNakedSet(TupleEnum.QUADRUPLET)) {
            this.strategyType = StrategyEnum.NAKED_QUADRUPLET;
            return true;
        }
        else if (strategyType === StrategyEnum.NAKED_QUINTUPLET && this.isNakedSet(TupleEnum.QUINTUPLET)) {
            this.strategyType = StrategyEnum.NAKED_QUINTUPLET;
            return true;
        }
        else if (strategyType === StrategyEnum.NAKED_SEXTUPLET && this.isNakedSet(TupleEnum.SEXTUPLET)) {
            this.strategyType = StrategyEnum.NAKED_SEXTUPLET;
            return true;
        }
        else if (strategyType === StrategyEnum.NAKED_SEPTUPLET && this.isNakedSet(TupleEnum.SEPTUPLET)) {
            this.strategyType = StrategyEnum.NAKED_SEPTUPLET;
            return true;
        }
        else if (strategyType === StrategyEnum.NAKED_OCTUPLET && this.isNakedSet(TupleEnum.OCTUPLET)) {
            this.strategyType = StrategyEnum.NAKED_OCTUPLET
            return true;
        }
        else if (strategyType === StrategyEnum.HIDDEN_SINGLE && this.isHiddenSet(TupleEnum.SINGLE)) {
            this.strategyType = StrategyEnum.HIDDEN_SINGLE;
            return true;
        }
        else if (strategyType === StrategyEnum.SIMPLIFY_NOTES && this.isStrategy(StrategyEnum.SIMPLIFY_NOTES)) {
            this.strategyType = StrategyEnum.SIMPLIFY_NOTES;
            return true;
        }
        return false;
    }

    /**
     * Checks if strategy is a given strategy type and if so sets values to place, notes to remove
     * @param strategyType - strategy type that is being checked for
     * @returns true if strategy is strategyType 
     */
    public isStrategy(strategyType: StrategyEnum):boolean {
        if (strategyType === StrategyEnum.AMEND_NOTES || strategyType === StrategyEnum.SIMPLIFY_NOTES) {
            for (let r:number = 0; r < this.emptyCells.length; r++) {
                for (let c:number = 0; c < this.emptyCells[r].length; c++) {
                    if (strategyType === StrategyEnum.AMEND_NOTES && this.isAmendNotes(r, c)) {
                        return true;
                    }
                    else if (strategyType === StrategyEnum.SIMPLIFY_NOTES && this.isSimplifyNotes(r, c)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     * Gets cells that "cause" strategy to be applicable
     * @returns cells
     * @throws {@link CustomError}
     * Thrown if strategy hasn't been identified
     */
    public getCause():Cell[] {
        this.verifyIdentified();
        return this.cause;
    }

    /**
     * Gets groups that "cause" strategy to be applicable
     * @returns 2d array containing arrays with number representing GroupEnum and index or groups that cause strategy e.g. [[0, 1]] for 2nd row
     * @throws {@link CustomError}
     * Thrown if strategy hasn't been identified
     */
    public getGroups():number[][] {
        this.verifyIdentified();
        return this.groups;
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
     * Gets difficulty rating for the strategy represented as an integer
     * @returns difficulty int
     * @throws {@link CustomError}
     * Thrown if strategy hasn't been identified
     */
    public getDifficulty():number {
        this.verifyIdentified();
        return this.difficulty;
    }

    /**
     * Given a tuple like pair returns the difficulty lower bound for that naked set like naked pair
     * @param tuple - tuple e.g. naked single, pair, ...
     * @returns lower bound for naked single of given tuple
     */
    private getNakedSetDifficultyLowerBound(tuple: TupleEnum):DifficultyLowerBounds {
        if (tuple === TupleEnum.SINGLE) {
            return DifficultyLowerBounds.NAKED_SINGLE;
        }
        else if (tuple === TupleEnum.PAIR) {
            return DifficultyLowerBounds.NAKED_PAIR;
        }
        else if (tuple === TupleEnum.TRIPLET) {
            return DifficultyLowerBounds.NAKED_TRIPLET;
        }
        else if (tuple === TupleEnum.QUADRUPLET) {
            return DifficultyLowerBounds.NAKED_QUADRUPLET;
        }
        else if (tuple === TupleEnum.QUINTUPLET) {
            return DifficultyLowerBounds.NAKED_QUINTUPLET;
        }
        else if (tuple === TupleEnum.SEXTUPLET) {
            return DifficultyLowerBounds.NAKED_SEXTUPLET;
        }
        else if (tuple === TupleEnum.SEPTUPLET) {
            return DifficultyLowerBounds.NAKED_SEPTUPLET;
        }
        else if (tuple === TupleEnum.OCTUPLET) {
            return DifficultyLowerBounds.NAKED_OCTUPLET;
        }
    }

    /**
     * Given a tuple like pair returns the difficulty upper bound for that naked set like naked pair
     * @param tuple - tuple e.g. naked single, pair, ...
     * @returns upper bound for naked single of given tuple
     */
    private getNakedSetDifficultyUpperBound(tuple: TupleEnum):DifficultyUpperBounds {
        if (tuple === TupleEnum.SINGLE) {
            return DifficultyUpperBounds.NAKED_SINGLE;
        }
        else if (tuple === TupleEnum.PAIR) {
            return DifficultyUpperBounds.NAKED_PAIR;
        }
        else if (tuple === TupleEnum.TRIPLET) {
            return DifficultyUpperBounds.NAKED_TRIPLET;
        }
        else if (tuple === TupleEnum.QUADRUPLET) {
            return DifficultyUpperBounds.NAKED_QUADRUPLET;
        }
        else if (tuple === TupleEnum.QUINTUPLET) {
            return DifficultyUpperBounds.NAKED_QUINTUPLET;
        }
        else if (tuple === TupleEnum.SEXTUPLET) {
            return DifficultyUpperBounds.NAKED_SEXTUPLET;
        }
        else if (tuple === TupleEnum.SEPTUPLET) {
            return DifficultyUpperBounds.NAKED_SEPTUPLET;
        }
        else if (tuple === TupleEnum.OCTUPLET) {
            return DifficultyUpperBounds.NAKED_OCTUPLET;
        }
    }

    /**
     * Checks if strategy is a naked set of given tuple and if so adds values to be placed and notes to remove
     * @param tuple - e.g. could be single or pair for naked single or naked pair respectively
     * @returns true if strategy is a naked tuple
     */
    private isNakedSet(tuple: TupleEnum):boolean {
        // Checks if tuple exists by getting all cells (with note size <= tuple) in each group and trying to build tuple
        // Checks every subset (combination) of cells in each group (row/column/box)
        let subsets:Group[] = Group.getSubset(tuple);
        // Used to prevent adding cells to notes to remove multiple times when evaluating box after finding row/column set
        let usedRow:number = -1;
        let usedColumn:number = -1;
        for (let group:GroupEnum = 0; group < GroupEnum.COUNT; group++) {
            for (let i:number = 0; i < SudokuEnum.ROW_LENGTH; i++) {
                // Skips over groups where there aren't enough unfilled cells left to form set
                if (this.cellBoard.getValuesPlaced(group, i).getSize() > (SudokuEnum.ROW_LENGTH - tuple)) {
                    continue;
                }
                // Contains cells in the same row, column, or box
                let cells: Cell[] = getCellsInGroup(this.emptyCells, group, i);
                // Tries to build a naked set of size tuple for each possible size tuple subset of candidates
                // Is naked set iff union of all cells has notes size equal to tuple
                for (let j:number = 0; j < subsets.length; j++) {
                    // Stores indexes of the cells that make up the naked set
                    let inNakedSet:Group = getCellsSubset(cells, subsets[j], group);
                    // Stores the cellls that make up the naked set
                    let nakedSet:Cell[] = getCellsInSubset(cells, inNakedSet);
                    // If naked set is correct size (i.e. every element in subset was in cells)
                    if (nakedSet.length === tuple) {
                        // Calculates all notes in naked set
                        let nakedSetCandidates:Group = getUnionOfSetNotes(nakedSet);
                        // Is naked set if it has correct number of notes
                        if (nakedSetCandidates.getSize() === tuple) {
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
                                this.cause.push(new Cell(row, column));
                                this.identified = true;
                                this.difficulty = DifficultyLowerBounds.NAKED_SINGLE;
                                return true;
                            }
                            // Adds notes to remove if there are any to remove
                            for (let k:number = 0; k < cells.length; k++) {
                                // If cell isn't part of naked set itself and it contains some of the same values as naked set remove them
                                // Skip if row or column is 'used' i.e. removed due to shared row or column already and checking for others in shared box
                                if (!inNakedSet.contains(k) && (cells[k].getNotes().intersection(nakedSetCandidates)).getSize() > 0) {
                                    let notes:Group = new Group(false, cells[k].getRow(), cells[k].getColumn());
                                    notes.insert(nakedSetCandidates);
                                    this.notes.push(notes);
                                }
                            }
                            // If notes can be removed as result of naked set then it is a valid strategy
                            if (this.notes.length > 0) {
                                this.identified = true;
                                for (let k:number = 0; k < nakedSet.length; k++) {
                                    this.cause.push(new Cell(nakedSet[k].getRow(), nakedSet[k].getColumn()));
                                }
                                let groups:number[] = new Array(2);
                                groups[0] = group;
                                groups[1] = i;
                                this.groups.push(groups);
                                // Calculate difficulty based on how far apart the naked set cells are
                                let distanceRatio:number;
                                if (group === GroupEnum.ROW) {
                                    distanceRatio = nakedSet[nakedSet.length - 1].getRow() - nakedSet[0].getRow();
                                    distanceRatio /= SudokuEnum.COLUMN_LENGTH - 1;
                                }
                                else if (group === GroupEnum.COLUMN) {
                                    distanceRatio = nakedSet[nakedSet.length - 1].getColumn() - nakedSet[0].getColumn();
                                    distanceRatio /= SudokuEnum.ROW_LENGTH - 1;
                                }
                                else {
                                    let minRow:number = SudokuEnum.COLUMN_LENGTH, minColumn:number = SudokuEnum.ROW_LENGTH;
                                    let maxRow:number = 0, maxColumn:number = 0;
                                    for (let k:number = 0; k < nakedSet.length; k++) {
                                        minRow = Math.min(minRow, nakedSet[k].getRow());
                                        minColumn = Math.min(minColumn, nakedSet[k].getColumn());
                                        maxRow = Math.max(maxRow, nakedSet[k].getRow());
                                        maxColumn = Math.max(maxColumn, nakedSet[k].getColumn());
                                    }
                                    distanceRatio = (maxRow - minRow) + (maxColumn - minColumn);
                                    distanceRatio /= (SudokuEnum.BOX_LENGTH - 1) * 2;
                                }
                                this.difficulty = this.getNakedSetDifficultyLowerBound(tuple);
                                this.difficulty += Math.ceil(distanceRatio * (this.getNakedSetDifficultyUpperBound(tuple) - this.getNakedSetDifficultyLowerBound(tuple)));
                                // If naked set shares a row or column it might also share a box so skip to check that
                                if (group !== GroupEnum.BOX) {
                                    // Set used row or column to avoiding adding same cells notes twice
                                    if (group === GroupEnum.ROW) {
                                        usedRow = this.notes[0].getRow();
                                    }
                                    else {
                                        usedColumn = this.notes[0].getColumn();
                                    }
                                    // Check if naked set shares a box
                                    let boxes:Group = new Group(false);
                                    let box:number;
                                    for (let k:number = 0; k < nakedSet.length; k++) {
                                        box = nakedSet[k].getBox();
                                        boxes.insert(box);
                                    }
                                    if (boxes.getSize() === 1) {
                                        // Since the naked set also all share the same box add to notes any notes you can remove from cells in the shared box
                                        let boxCells: Cell[] = getCellsInGroup(this.emptyCells, GroupEnum.BOX, box);
                                        for (let k:number = 0; k < boxCells.length; k++) {
                                            if (boxCells[k].getRow() !== usedRow && boxCells[k].getColumn() !== usedColumn) {
                                                if ((boxCells[k].getNotes().intersection(nakedSetCandidates)).getSize() > 0) {
                                                    let notes:Group = new Group(false, boxCells[k].getRow(), boxCells[k].getColumn());
                                                    notes.insert(nakedSetCandidates);
                                                    this.notes.push(notes);
                                                    if (this.groups.length === 1) {
                                                        let boxGroup:number[] = new Array(2);
                                                        boxGroup[0] = GroupEnum.BOX;
                                                        boxGroup[1] = boxCells[k].getBox();
                                                        this.groups.push(boxGroup);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                return this.identified;
                            }
                        }
                    }
                }
            }
        }
        return this.identified;
    }

    /**
     * Checks if strategy is a hidden set of given tuple and if so adds notes to remove
     * @param tuple - e.g. could be single or pair for hidden single or hidden pair respectively
     * @returns true if strategy is a hidden tuple
     */
    private isHiddenSet(tuple: TupleEnum):boolean {
        // Checks if tuple exists by getting all cells in each group and trying to build hidden tuple
        // Checks every subset (combination) of cells in each group (row/column/box)
        let subsets:Group[] = Group.getSubset(tuple);
        for (let group:GroupEnum = 0; group < GroupEnum.COUNT; group++) {
            for (let i:number = 0; i < SudokuEnum.ROW_LENGTH; i++) {
                // Skips over groups where there aren't enough unfilled cells left to form set
                if (this.cellBoard.getValuesPlaced(group, i).getSize() > (SudokuEnum.ROW_LENGTH - tuple)) {
                    continue;
                }
                // Contains cells in the same row, column, or box
                let cells: Cell[] = getCellsInGroup(this.emptyCells, group, i);
                // Tries to build a hidden set of size tuple for each possible size tuple subset of candidates
                // Is hidden single iff the number of candidates that don't exist outside of the hidden tuple
                // is equal to the tuple (e.g. hidden pair if there are two numbers only in the pair in the row)
                for (let j:number = 0; j < subsets.length; j++) {
                    // Stores indexes of the cells that make up the hidden set
                    let inHiddenSet:Group = getCellsSubset(cells, subsets[j], group);
                    // Stores the cells that make up the hidden set
                    let hiddenSet:Cell[] = getCellsInSubset(cells, inHiddenSet);
                    // If hidden set is correct size (i.e. every element in subset was in cells)
                    if (hiddenSet.length === tuple) {
                        // Stores all of the cells in the hidden sets group (except the hidden set itself and non empty cells)
                        let notHiddenSet:Cell[] = new Array();
                        for (let k:number = 0; k < cells.length; k++) {
                            if (!inHiddenSet.contains(k) && cells[k].isEmpty()) {
                                notHiddenSet.push(cells[k]);
                            }
                        }
                        // Calculates notes that aren't in the hidden set
                        let notHiddenSetCandidates:Group = getUnionOfSetNotes(notHiddenSet);
                        // Calculates notes that are in the hidden set
                        let hiddenSetCandidates:Group = getUnionOfSetNotes(hiddenSet);
                        // Get values that have already been placed in the group and remove them as candidates
                        let used:Group = new Group(false);
                        let groupCells: Cell[] = getCellsInGroup(this.board, group, i);
                        for (let k:number = 0; k < groupCells.length; k++) {
                            if (!groupCells[k].isEmpty()) {
                                used.insert(groupCells[k].getValue());
                            }
                        }
                        notHiddenSetCandidates.remove(used);
                        hiddenSetCandidates.remove(used);
                        // Is hidden set if correct number of candidates don't exist outside of the hidden set
                        if ((hiddenSetCandidates.getSize() - (hiddenSetCandidates.intersection(notHiddenSetCandidates)).getSize()) === tuple) {
                            // Remove candidates that aren't part of the hidden set from the hidden sets notes
                            for (let k:number = 0; k < tuple; k++) {
                                if ((hiddenSet[k].getNotes().intersection(notHiddenSetCandidates)).getSize() > 0) {
                                    let notes:Group = new Group(false, hiddenSet[k].getRow(), hiddenSet[k].getColumn());
                                    notes.insert(notHiddenSetCandidates);
                                    this.notes.push(notes);
                                    this.identified = true;
                                }
                            }
                            // If notes were found you can remove as part of the hidden single then strategy identified
                            if (this.identified) {
                                let groups:number[] = new Array(2);
                                groups[0] = group;
                                groups[1] = i;
                                this.groups.push(groups);
                                for (let k:number = 0; k < notHiddenSet.length; k++) {
                                    this.cause.push(new Cell(notHiddenSet[k].getRow(), notHiddenSet[k].getColumn()));
                                }
                                // Calculate ratio of number of notes to possible number (more notes to obscure hidden set = higher difficulty)
                                let noteCount:number = 0;
                                for (let k:number = 0; k < tuple; k++) {
                                    noteCount += (hiddenSet[k].getNotes()).getSize();
                                }
                                let noteRatio:number = noteCount / (SudokuEnum.ROW_LENGTH * SudokuEnum.ROW_LENGTH);
                                if (tuple === TupleEnum.SINGLE) {
                                    this.difficulty = DifficultyLowerBounds.HIDDEN_SINGLE;
                                    this.difficulty += Math.ceil(noteRatio * (DifficultyUpperBounds.HIDDEN_SINGLE - DifficultyLowerBounds.HIDDEN_SINGLE));
                                }
                                return this.identified;
                            }
                        }
                    }
                }
            }
        }
        return this.identified;
    }

    /**
     * Checks if strategy is simplify notes and if so adds notes to remove from a cell
     * @param i - corresponds to an array in empty cells
     * @param j - corresponds to an index in an array in emptyCells
     * @returns true if strategy is simplify notes
     */
    private isSimplifyNotes(i: number, j: number):boolean {
        let cell: Cell = this.emptyCells[i][j];
        let row: number = cell.getRow();
        let column: number = cell.getColumn();
        let box: number = cell.getBox();
        let boxRowStart: number = Cell.getBoxRowStart(box);
        let boxColumnStart: number = Cell.getBoxColumnStart(box);
        let notes: Group = new Group(false);
        // Add every placed value from given row
        for (let k:number = 0; notes.getSize() === 0 && k < SudokuEnum.ROW_LENGTH; k++) {
            if (!this.board[row][k].isEmpty() && (cell.getNotes()).contains(this.board[row][k].getValue())) {
                notes.insert(this.board[row][k].getValue());
                this.cause.push(this.board[row][k]);
                this.groups.push([GroupEnum.ROW, row]);
            }
        }
        // Add every placed value from given column
        for (let k:number = 0; notes.getSize() === 0 && k < SudokuEnum.COLUMN_LENGTH; k++) {
            if (!this.board[k][column].isEmpty() && (cell.getNotes()).contains(this.board[k][column].getValue())) {
                notes.insert(this.board[k][column].getValue());
                this.cause.push(this.board[k][column]);
                this.groups.push([GroupEnum.COLUMN, column]);
            }
        }
        // Add every placed value from given box
        for (let r:number = boxRowStart; r < (boxRowStart + SudokuEnum.BOX_LENGTH); r++) {
            for (let c:number = boxColumnStart; notes.getSize() === 0 && c < (boxColumnStart + SudokuEnum.BOX_LENGTH); c++) {
                if (!this.board[r][c].isEmpty() && (cell.getNotes()).contains(this.board[r][c].getValue())) {
                    notes.insert(this.board[r][c].getValue());
                    this.cause.push(this.board[r][c]);
                    this.groups.push([GroupEnum.BOX, this.board[r][c].getBox()]);
                }
            }
        }
        // If there are any notes to remove then strategy is identified
        if (notes.getSize() > 0) {
            let notesToRemove: Group = new Group(false, row, column);
            notesToRemove.insert(notes);
            this.notes.push(notesToRemove);
            this.identified = true;
            this.difficulty = DifficultyLowerBounds.SIMPLIFY_NOTES;
            return this.identified;
        }
        return this.identified;
    }

    /**
     * Checks if strategy is amend notes and if so adds notes to remove from a cell (every note not removed should be added)
     * @param r - corresponds to an array in empty cells
     * @param c - corresponds to an index in an array in emptyCells
     * @returns true if strategy is amend notes
     */
    private isAmendNotes(r: number, c: number):boolean {
        let cell:Cell = this.emptyCells[r][c];
        let row:number = cell.getRow();
        let column:number = cell.getColumn();
        // Checks if correct number has been wrongly removed from a cell and if so removes all notes from it so it is amended in next if
        if (this.solution !== undefined && !(cell.getNotes()).contains(this.solution[row][column])) {
            cell.removeNotes(new Group(true));
        }
        if ((cell.getNotes()).getSize() === 0) {
            // Add back in all notes then remove the ones that can be simplified away
            let box: number = cell.getBox();
            let boxRowStart: number = Cell.getBoxRowStart(box);
            let boxColumnStart: number = Cell.getBoxColumnStart(box);
            let notesToRemove: Group = new Group(false, row, column);
            let usedGroup:boolean = false;
            // Add every placed value from given row
            for (let k:number = 0; k < SudokuEnum.ROW_LENGTH; k++) {
                if (!this.board[row][k].isEmpty()) {
                    notesToRemove.insert(this.board[row][k].getValue());
                    this.cause.push(this.board[row][k]);
                    if (!usedGroup) {
                        this.groups.push([GroupEnum.ROW, row]);
                        usedGroup = true;
                    }
                }
            }
            usedGroup = false;
            // Add every placed value from given column
            for (let k:number = 0; k < SudokuEnum.COLUMN_LENGTH; k++) {
                if (!this.board[k][column].isEmpty()) {
                    if (!notesToRemove.contains(this.board[k][column].getValue())) {
                        notesToRemove.insert(this.board[k][column].getValue());
                        this.cause.push(this.board[k][column]);
                        if (!usedGroup) {
                            this.groups.push([GroupEnum.COLUMN, column]);
                            usedGroup = true;
                        }
                    }
                }
            }
            usedGroup = false;
            // Add every placed value from given box
            for (let r:number = boxRowStart; r < (boxRowStart + SudokuEnum.BOX_LENGTH); r++) {
                for (let c:number = boxColumnStart; c < (boxColumnStart + SudokuEnum.BOX_LENGTH); c++) {
                    if (!this.board[r][c].isEmpty()) {
                        if (!notesToRemove.contains(this.board[r][c].getValue())) {
                            notesToRemove.insert(this.board[r][c].getValue());
                            this.cause.push(this.board[r][c]);
                            if (!usedGroup) {
                                this.groups.push([GroupEnum.BOX, this.board[r][c].getBox()]);
                                usedGroup = true;
                            }
                        }
                    }
                }
            }
            // If there are notes to remove then return them
            if (notesToRemove.getSize() > 0) {
                this.notes.push(notesToRemove);
                this.identified = true;
                this.difficulty = DifficultyLowerBounds.AMEND_NOTES;
                return this.identified;
            }
        }
        return this.identified;
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

    /**
     * Given an array of strategy strings returns the highest difficulty upper bound of them
     * @param strategies array of strategy strings
     * @returns highest strategy upper bound of given strategies
     */
    public static getHighestStrategyDifficultyBound(strategies: string[]):number {
        let bound:number = -1;
        for (let i:number = 0; i < strategies.length; i++) {
            bound = Math.max(bound, DifficultyUpperBounds[strategies[i]]);
        }
        return bound;
    }
}