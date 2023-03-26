import { Cell } from "./Cell";
import { CustomError, CustomErrorEnum } from "./CustomError";
import { SudokuEnum, StrategyEnum, GroupEnum, TupleEnum, getUnionOfSetNotes, getSubsetOfCells, cellsEqual } from "./Sudoku"
import { Group } from "./Group";
import { CellBoard } from "./CellBoard";
import { Hint } from "./Hint";

/**
 * Includes lower bounds for strategies difficulty ratings
 * @enum
 */
enum DifficultyLowerBounds {
    AMEND_NOTES = 10,
    NAKED_SINGLE = 10,
    HIDDEN_SINGLE = 20,
    NAKED_PAIR = 20,
    HIDDEN_PAIR = 30,
    POINTING_PAIR = 40,
    NAKED_TRIPLET = 30,
    HIDDEN_TRIPLET = 40,
    POINTING_TRIPLET = 40,
    NAKED_QUADRUPLET = 40,
    HIDDEN_QUADRUPLET = 50,
    NAKED_QUINTUPLET = 40,
    HIDDEN_QUINTUPLET = 50,
    NAKED_SEXTUPLET = 40,
    HIDDEN_SEXTUPLET = 50,
    NAKED_SEPTUPLET = 40,
    HIDDEN_SEPTUPLET = 50,
    NAKED_OCTUPLET = 40,
    HIDDEN_OCTUPLET = 50,
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
    NAKED_PAIR = 40,
    HIDDEN_PAIR = 50,
    POINTING_PAIR = 60,
    NAKED_TRIPLET = 50,
    HIDDEN_TRIPLET = 60,
    POINTING_TRIPLET = 60,
    NAKED_QUADRUPLET = 60,
    HIDDEN_QUADRUPLET = 70,
    NAKED_QUINTUPLET = 60,
    HIDDEN_QUINTUPLET = 70,
    NAKED_SEXTUPLET = 60,
    HIDDEN_SEXTUPLET = 70,
    NAKED_SEPTUPLET = 60,
    HIDDEN_SEPTUPLET = 70,
    NAKED_OCTUPLET = 60,
    HIDDEN_OCTUPLET = 70,
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
    // Stores drill hint
    private drillHint: Hint;

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
     * Resets Strategy object fields to initial state
     */
    public reset():void {
        this.cause = new Array();
        this.groups = new Array();
        this.values = new Array();
        this.notes = new Array();
        this.strategyType = undefined;
        this.identified = false;
        this.difficulty = undefined;
    }

    /**
     * Checks if strategy is a given strategy type and if so sets values to place, notes to remove
     * @param strategyType - strategy type that is being checked for
     * @returns true if strategy is strategyType
     */
    public setStrategyType(strategyType: StrategyEnum, drill: boolean = false):boolean {
        if (this.isStrategy(strategyType, drill)) {
            this.strategyType = strategyType;
            this.identified = true;
            return true;
        }
        return false;
    }

    /**
     * Given a strategy type returns its tuple type e.g naked triplet returns triplet
     * @param strategyType - strategy type
     * @returns tuple type for given strategy type
     */
    public getStrategyTuple(strategyType: StrategyEnum):TupleEnum {
        if (strategyType === StrategyEnum.NAKED_SINGLE || strategyType === StrategyEnum.HIDDEN_SINGLE) {
            return TupleEnum.SINGLE;
        }
        else if (strategyType === StrategyEnum.NAKED_PAIR || strategyType === StrategyEnum.HIDDEN_PAIR) {
            return TupleEnum.PAIR;
        }
        else if (strategyType === StrategyEnum.NAKED_TRIPLET || strategyType === StrategyEnum.HIDDEN_TRIPLET) {
            return TupleEnum.TRIPLET;
        }
        else if (strategyType === StrategyEnum.NAKED_QUADRUPLET || strategyType === StrategyEnum.HIDDEN_QUADRUPLET) {
            return TupleEnum.QUADRUPLET;
        }
        else if (strategyType === StrategyEnum.NAKED_QUINTUPLET || strategyType === StrategyEnum.HIDDEN_QUINTUPLET) {
            return TupleEnum.QUINTUPLET;
        }
        else if (strategyType === StrategyEnum.NAKED_SEXTUPLET || strategyType === StrategyEnum.HIDDEN_SEXTUPLET) {
            return TupleEnum.SEXTUPLET;
        }
        else if (strategyType === StrategyEnum.NAKED_SEPTUPLET || strategyType === StrategyEnum.HIDDEN_SEPTUPLET) {
            return TupleEnum.SEPTUPLET;
        }
        else if (strategyType === StrategyEnum.NAKED_OCTUPLET || strategyType === StrategyEnum.HIDDEN_OCTUPLET) {
            return TupleEnum.OCTUPLET;
        }
    }

    /**
     * Returns true if strategy is a naked set strategy
     * @param strategyType - strategy type
     * @returns true if strategy type is a naked set strategy
     */
    public isNakedSetStrategy(strategyType: StrategyEnum):boolean {
        if (strategyType === StrategyEnum.NAKED_SINGLE || strategyType === StrategyEnum.NAKED_PAIR || 
            strategyType === StrategyEnum.NAKED_TRIPLET || strategyType === StrategyEnum.NAKED_QUADRUPLET || 
            strategyType === StrategyEnum.NAKED_QUINTUPLET || strategyType === StrategyEnum.NAKED_SEXTUPLET || 
            strategyType === StrategyEnum.NAKED_SEPTUPLET || strategyType === StrategyEnum.NAKED_OCTUPLET) {
            return true;
        }
        return false;
    }

    /**
     * Returns true if strategy is a hidden set strategy
     * @param strategyType - strategy type
     * @returns true if strategy type is a hidden set strategy
     */
    public isHiddenSetStrategy(strategyType: StrategyEnum):boolean {
        if (strategyType === StrategyEnum.HIDDEN_SINGLE || strategyType === StrategyEnum.HIDDEN_PAIR || 
            strategyType === StrategyEnum.HIDDEN_TRIPLET || strategyType === StrategyEnum.HIDDEN_QUADRUPLET || 
            strategyType === StrategyEnum.HIDDEN_QUINTUPLET || strategyType === StrategyEnum.HIDDEN_SEXTUPLET || 
            strategyType === StrategyEnum.HIDDEN_SEPTUPLET || strategyType === StrategyEnum.HIDDEN_OCTUPLET) {
            return true;
        }
        return false;
    }

    /**
     * Checks if strategy is a given strategy type and if so sets values to place, notes to remove
     * @param strategyType - strategy type that is being checked for
     * @param drill - true if checking if strategy if valid for drill which requires there to be exactly one instance of given strategy
     * @returns true if strategy is strategyType 
     */
    public isStrategy(strategyType: StrategyEnum, drill: boolean = false):boolean {
        // keeps track of strategies found already so can filter out drills that could be confusing due to multiple instances of same strategy
        let used:boolean = false;
        if (strategyType === StrategyEnum.AMEND_NOTES || strategyType === StrategyEnum.SIMPLIFY_NOTES) {
            for (let r:number = 0; r < this.emptyCells.length; r++) {
                for (let c:number = 0; c < this.emptyCells[r].length; c++) {
                    let column:number = this.emptyCells[r][c].getColumn();
                    let box:number = Cell.calculateBox(r, column);
                    // Skips over cells that have already been checked for this strategy (without any relevant changes being made since)
                    if (this.cellBoard.getSearchedGroups(strategyType, GroupEnum.ROW, r) &&
                        this.cellBoard.getSearchedGroups(strategyType, GroupEnum.COLUMN, column) &&
                        this.cellBoard.getSearchedGroups(strategyType, GroupEnum.BOX, box)) {
                        continue;
                    }
                    if ((strategyType === StrategyEnum.AMEND_NOTES && this.isAmendNotes(r, c)) ||
                        (strategyType === StrategyEnum.SIMPLIFY_NOTES && this.isSimplifyNotes(r, c))) {
                        if (!drill) {
                            return true;
                        }

                        // If this is first instance of the strategy found for drill we record it
                        // If we have already found a instance of strategy for this drill we check if this is the same instance, if not return fales
                        if (!used) {
                            this.strategyType = strategyType;
                            this.drillHint = new Hint(this);
                            this.reset();
                            used = true;
                        }
                        else if (!cellsEqual(this.cause, this.drillHint.getCellsCause())) {
                            return false;
                        }
                    }
                }
            }
            // Since this strategy wasn't found records that this strategy has been checked already (unless strategy was found via drill)
            for (let i:number = 0; i < SudokuEnum.ROW_LENGTH; i++) {
                this.cellBoard.setSearchedGroups(strategyType, GroupEnum.ROW, i, !used);
                this.cellBoard.setSearchedGroups(strategyType, GroupEnum.COLUMN, i, !used);
                this.cellBoard.setSearchedGroups(strategyType, GroupEnum.BOX, i, !used);
            }
        }
        else if (this.isNakedSetStrategy(strategyType) || this.isHiddenSetStrategy(strategyType)) {
            let tuple:TupleEnum = this.getStrategyTuple(strategyType);
            let subsets:Group[] = Group.getSubset(tuple);
            for (let group:GroupEnum = 0; group < GroupEnum.COUNT; group++) {
                for (let i:number = 0; i < SudokuEnum.ROW_LENGTH; i++) {
                    // Skips over groups that have already been checked for this strategy (without any relevant changes being made since)
                    if (this.cellBoard.getSearchedGroups(strategyType, group, i)) {
                        continue;
                    }
                    // Checks if tuple exists by getting all cells in each group and trying to build tuple
                    // Skips over groups where there aren't enough unfilled cells left to form set
                    if (this.cellBoard.getValuesPlaced(group, i).getSize() > (SudokuEnum.ROW_LENGTH - tuple)) {
                        continue;
                    }
                    // Contains cells in the same row, column, or box
                    let cells: Cell[] = this.cellBoard.getEmptyCellsInGroup(group, i);
                    for (let j:number = 0; j < subsets.length; j++) {
                        if ((this.isNakedSetStrategy(strategyType) && this.isNakedSet(tuple, group, i, cells, subsets[j])) ||
                            (this.isHiddenSetStrategy(strategyType) && this.isHiddenSet(tuple, group, i, cells, subsets[j]))) {
                            if (!drill) {
                                return true;
                            }

                            // If this is first instance of the strategy found for drill we record it
                            // If we have already found a instance of strategy for this drill we check if this is the same instance, if not return fales
                            if (!used) {
                                this.strategyType = strategyType;
                                this.drillHint = new Hint(this);
                                this.reset();
                                used = true;
                            }
                            else if (!cellsEqual(this.cause, this.drillHint.getCellsCause())) {
                                return false;
                            }
                        }
                    }
                    // Since this strategy wasn't found records that this group has been checked already (unless strategy was found via drill)
                    this.cellBoard.setSearchedGroups(strategyType, group, i, !used);
                }
            }
        }
        else if (strategyType === StrategyEnum.POINTING_PAIR || strategyType === StrategyEnum.POINTING_TRIPLET) {
            for (let box:number = 0; box < SudokuEnum.ROW_LENGTH; box++) {
                let set:TupleEnum = this.isPointingSet(box);
                if ((strategyType === StrategyEnum.POINTING_PAIR && set === TupleEnum.PAIR) || 
                    (strategyType === StrategyEnum.POINTING_TRIPLET && set === TupleEnum.TRIPLET)) {
                    if (!drill) {
                        return true;
                    }

                    // If this is first instance of the strategy found for drill we record it
                    // If we have already found a instance of strategy for this drill we check if this is the same instance, if not return fales
                    if (!used) {
                        this.strategyType = strategyType;
                        this.drillHint = new Hint(this);
                        this.reset();
                        used = true;
                    }
                    else if (!cellsEqual(this.cause, this.drillHint.getCellsCause())) {
                        return false;
                    }
                }
            }
        }
        return used;
    }

    /**
     * Gets drill hint
     * @returns drill hint object
     */
    public getDrillHint():Hint {
        return this.drillHint;
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
     * Given a tuple like pair returns the difficulty lower bound for that set like naked pair
     * @param strategyType - strategy type
     * @param tuple - tuple e.g. naked single, pair, ...
     * @returns lower bound for given strategy set of given tuple
     */
    private getSetDifficultyLowerBound(strategyType: StrategyEnum, tuple: TupleEnum):DifficultyLowerBounds {
        if (tuple === TupleEnum.SINGLE) {
            if (this.isNakedSetStrategy(strategyType)) {
                return DifficultyLowerBounds.NAKED_SINGLE;
            }
            else if (this.isHiddenSetStrategy(strategyType)) {
                return DifficultyLowerBounds.HIDDEN_SINGLE;
            }
        }
        else if (tuple === TupleEnum.PAIR) {
            if (this.isNakedSetStrategy(strategyType)) {
                return DifficultyLowerBounds.NAKED_PAIR;
            }
            else if (this.isHiddenSetStrategy(strategyType)) {
                return DifficultyLowerBounds.HIDDEN_PAIR;
            }
        }
        else if (tuple === TupleEnum.TRIPLET) {
            if (this.isNakedSetStrategy(strategyType)) {
                return DifficultyLowerBounds.NAKED_TRIPLET;
            }
            else if (this.isHiddenSetStrategy(strategyType)) {
                return DifficultyLowerBounds.HIDDEN_TRIPLET;
            }
        }
        else if (tuple === TupleEnum.QUADRUPLET) {
            if (this.isNakedSetStrategy(strategyType)) {
                return DifficultyLowerBounds.NAKED_QUADRUPLET;
            }
            else if (this.isHiddenSetStrategy(strategyType)) {
                return DifficultyLowerBounds.HIDDEN_QUADRUPLET;
            }
        }
        else if (tuple === TupleEnum.QUINTUPLET) {
            if (this.isNakedSetStrategy(strategyType)) {
                return DifficultyLowerBounds.NAKED_QUINTUPLET;
            }
            else if (this.isHiddenSetStrategy(strategyType)) {
                return DifficultyLowerBounds.HIDDEN_QUINTUPLET;
            }
        }
        else if (tuple === TupleEnum.SEXTUPLET) {
            if (this.isNakedSetStrategy(strategyType)) {
                return DifficultyLowerBounds.NAKED_SEXTUPLET;
            }
            else if (this.isHiddenSetStrategy(strategyType)) {
                return DifficultyLowerBounds.HIDDEN_SEXTUPLET;
            }
        }
        else if (tuple === TupleEnum.SEPTUPLET) {
            if (this.isNakedSetStrategy(strategyType)) {
                return DifficultyLowerBounds.NAKED_SEPTUPLET;
            }
            else if (this.isHiddenSetStrategy(strategyType)) {
                return DifficultyLowerBounds.HIDDEN_SEPTUPLET;
            }
        }
        else if (tuple === TupleEnum.OCTUPLET) {
            if (this.isNakedSetStrategy(strategyType)) {
                return DifficultyLowerBounds.NAKED_OCTUPLET;
            }
            else if (this.isHiddenSetStrategy(strategyType)) {
                return DifficultyLowerBounds.HIDDEN_OCTUPLET;
            }
        }
    }

    /**
     * Given a tuple like pair returns the difficulty upper bound for that set like naked pair
     * @param strategyType - strategy type
     * @param tuple - tuple e.g. naked single, pair, ...
     * @returns upper bound for given strategy set of given tuple
     */
    private getSetDifficultyUpperBound(strategyType: StrategyEnum, tuple: TupleEnum):DifficultyUpperBounds {
        if (tuple === TupleEnum.SINGLE) {
            if (this.isNakedSetStrategy(strategyType)) {
                return DifficultyUpperBounds.NAKED_SINGLE;
            }
            else if (this.isHiddenSetStrategy(strategyType)) {
                return DifficultyUpperBounds.HIDDEN_SINGLE;
            }
        }
        else if (tuple === TupleEnum.PAIR) {
            if (this.isNakedSetStrategy(strategyType)) {
                return DifficultyUpperBounds.NAKED_PAIR;
            }
            else if (this.isHiddenSetStrategy(strategyType)) {
                return DifficultyUpperBounds.HIDDEN_PAIR;
            }
        }
        else if (tuple === TupleEnum.TRIPLET) {
            if (this.isNakedSetStrategy(strategyType)) {
                return DifficultyUpperBounds.NAKED_TRIPLET;
            }
            else if (this.isHiddenSetStrategy(strategyType)) {
                return DifficultyUpperBounds.HIDDEN_TRIPLET;
            }
        }
        else if (tuple === TupleEnum.QUADRUPLET) {
            if (this.isNakedSetStrategy(strategyType)) {
                return DifficultyUpperBounds.NAKED_QUADRUPLET;
            }
            else if (this.isHiddenSetStrategy(strategyType)) {
                return DifficultyUpperBounds.HIDDEN_QUADRUPLET;
            }
        }
        else if (tuple === TupleEnum.QUINTUPLET) {
            if (this.isNakedSetStrategy(strategyType)) {
                return DifficultyUpperBounds.NAKED_QUINTUPLET;
            }
            else if (this.isHiddenSetStrategy(strategyType)) {
                return DifficultyUpperBounds.HIDDEN_QUINTUPLET;
            }
        }
        else if (tuple === TupleEnum.SEXTUPLET) {
            if (this.isNakedSetStrategy(strategyType)) {
                return DifficultyUpperBounds.NAKED_SEXTUPLET;
            }
            else if (this.isHiddenSetStrategy(strategyType)) {
                return DifficultyUpperBounds.HIDDEN_SEXTUPLET;
            }
        }
        else if (tuple === TupleEnum.SEPTUPLET) {
            if (this.isNakedSetStrategy(strategyType)) {
                return DifficultyUpperBounds.NAKED_SEPTUPLET;
            }
            else if (this.isHiddenSetStrategy(strategyType)) {
                return DifficultyUpperBounds.HIDDEN_SEPTUPLET;
            }
        }
        else if (tuple === TupleEnum.OCTUPLET) {
            if (this.isNakedSetStrategy(strategyType)) {
                return DifficultyUpperBounds.NAKED_OCTUPLET;
            }
            else if (this.isHiddenSetStrategy(strategyType)) {
                return DifficultyUpperBounds.HIDDEN_OCTUPLET;
            }
        }
    }

    /**
     * Calculates a ratio (number between 0 and 1) based on distance between cells being used by strategy
     * @param cells - cells being used by this strategy
     * @param groupType - optional parameter if this strategy uses a specific group type
     * @returns ratio based on distance between given cells
     */
    private getDistanceRatio(cells: Cell[], groupType?: GroupEnum):number {
        let distanceRatio:number;
        let minRow:number = SudokuEnum.COLUMN_LENGTH, minColumn:number = SudokuEnum.ROW_LENGTH;
        let maxRow:number = 0, maxColumn:number = 0;
        for (let i:number = 0; i < cells.length; i++) {
            minRow = Math.min(minRow, cells[i].getRow());
            minColumn = Math.min(minColumn, cells[i].getColumn());
            maxRow = Math.max(maxRow, cells[i].getRow());
            maxColumn = Math.max(maxColumn, cells[i].getColumn());
        }
        if (groupType === undefined) {
            distanceRatio = (maxRow - minRow) + (maxColumn - minColumn);
            distanceRatio /= SudokuEnum.ROW_LENGTH + SudokuEnum.COLUMN_LENGTH;
        }
        else if (groupType === GroupEnum.ROW) {
            distanceRatio = (maxRow - minRow) / SudokuEnum.ROW_LENGTH;
        }
        else if (groupType === GroupEnum.COLUMN) {
            distanceRatio = (maxColumn - minColumn) / SudokuEnum.COLUMN_LENGTH;
        }
        else if (groupType === GroupEnum.BOX) {
            distanceRatio = (maxRow - minRow) + (maxColumn - minColumn);
            distanceRatio /= (SudokuEnum.BOX_LENGTH - 1) * 2;
        }
        return distanceRatio;
    }

    /**
     * Checks if strategy is a naked set of given tuple and if so adds values to be placed and notes to remove
     * @param tuple - e.g. could be single or pair for naked single or naked pair respectively
     * @param group - group type being check for a naked set e.g. row
     * @param i - index of group being checked e.g. 3 for 4th group e.g. 4th row
     * @param cells - array of cells in the given row, column, or box
     * @param inNakedSet - stores indexes of the cells that make up the naked set
     * @returns true if strategy is a naked tuple
     */
    private isNakedSet(tuple: TupleEnum, group: GroupEnum, i: number, cells: Cell[], inNakedSet: Group):boolean {
        // used to prevent adding cells to notes to remove a second time when evaluating box after finding row/column set
        let usedRow:number = -1, usedColumn = -1;
        // Tries to build a naked set of size tuple for each possible size tuple subset of candidates
        // Is naked set iff union of all cells has notes size equal to tuple
        // Stores the cellls that make up the naked set
        let nakedSet:Cell[] = getSubsetOfCells(cells, inNakedSet);
        // Check if naked set is correct size (i.e. every element in subset was in cells)
        if (nakedSet.length !== tuple) {
            return false;
        }
        // Calculates all notes in naked set
        let nakedSetCandidates:Group = getUnionOfSetNotes(nakedSet);
        // Check if naked set has correct number of notes
        if (nakedSetCandidates.getSize() !== tuple) {
            return false;
        }
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
        // Check if notes can be removed as result of naked set
        if (this.notes.length === 0) {
            return false;
        }
        this.identified = true;
        for (let k:number = 0; k < nakedSet.length; k++) {
            this.cause.push(new Cell(nakedSet[k].getRow(), nakedSet[k].getColumn()));
        }
        let groups:number[] = new Array(2);
        groups[0] = group;
        groups[1] = i;
        this.groups.push(groups);
        // Calculate difficulty based on how far apart the naked set cells are
        let distanceRatio:number = this.getDistanceRatio(nakedSet, group);
        this.difficulty = this.getSetDifficultyLowerBound(StrategyEnum.NAKED_SINGLE, tuple);
        this.difficulty += Math.ceil(distanceRatio * (this.getSetDifficultyUpperBound(StrategyEnum.NAKED_SINGLE, tuple) - this.getSetDifficultyLowerBound(StrategyEnum.NAKED_SINGLE, tuple)));
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
                let boxCells: Cell[] = this.cellBoard.getEmptyCellsInGroup(GroupEnum.BOX, box);
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
        return true;
    }

    /**
     * Checks if strategy is a hidden set of given tuple and if so adds notes to remove
     * @param tuple - e.g. could be single or pair for hidden single or hidden pair respectively
     * @param group - group type being check for a naked set e.g. row
     * @param i - index of group being checked e.g. 3 for 4th group e.g. 4th row
     * @param cells - array of cells in the given row, column, or box
     * @param inHiddenSet - stores indexes of the cells that make up the hidden set
     * @returns true if strategy is a hidden tuple
     */
    private isHiddenSet(tuple: TupleEnum, group: GroupEnum, i: number, cells: Cell[], inHiddenSet: Group):boolean {
        // Tries to build a hidden set of size tuple for each possible size tuple subset of candidates
        // Is hidden single iff the number of candidates that don't exist outside of the hidden tuple
        // is equal to the tuple (e.g. hidden pair if there are two numbers only in the pair in the row)
        // Stores the cells that make up the hidden set
        let hiddenSet:Cell[] = getSubsetOfCells(cells, inHiddenSet);
        // Check if hidden set is correct size (i.e. every element in subset was in cells)
        if (hiddenSet.length !== tuple) {
            return false;
        }
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
        let groupCells: Cell[] = this.cellBoard.getCellsInGroup(group, i);
        for (let k:number = 0; k < groupCells.length; k++) {
            if (!groupCells[k].isEmpty()) {
                used.insert(groupCells[k].getValue());
            }
        }
        notHiddenSetCandidates.remove(used);
        hiddenSetCandidates.remove(used);
        // Check if hidden set has correct number of candidates that don't exist outside of the hidden set
        if ((hiddenSetCandidates.getSize() - (hiddenSetCandidates.intersection(notHiddenSetCandidates)).getSize()) !== tuple) {
            return false;
        }
        // Remove candidates that aren't part of the hidden set from the hidden sets notes
        for (let k:number = 0; k < tuple; k++) {
            if ((hiddenSet[k].getNotes().intersection(notHiddenSetCandidates)).getSize() > 0) {
                let notes:Group = new Group(false, hiddenSet[k].getRow(), hiddenSet[k].getColumn());
                notes.insert(notHiddenSetCandidates);
                this.notes.push(notes);
                this.identified = true;
            }
        }
        // If notes weren't found you can remove as part of the hidden single then strategy not identified
        if (!this.identified) {
            return false;
        }
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
        this.difficulty = this.getSetDifficultyLowerBound(StrategyEnum.HIDDEN_SINGLE, tuple);
        this.difficulty += Math.ceil(noteRatio * (this.getSetDifficultyUpperBound(StrategyEnum.HIDDEN_SINGLE, tuple) - this.getSetDifficultyLowerBound(StrategyEnum.HIDDEN_SINGLE, tuple)));
        return true;
    }

    /**
     * Given a box checks for a pointing set
     * @param box - index of box being checked
     * @returns set tuple e.g. pair if its pointing pair or triplet if its pointing triplet, null if no pointing set found
     */
    private isPointingSet(box: number):TupleEnum {
        // Check if each note is the basis for a pointing set
        let placedValues = this.cellBoard.getValuesPlaced(GroupEnum.BOX, box);
        for (let note:number = 0; note < SudokuEnum.ROW_LENGTH; note++) {
            if (placedValues.contains(note)) {
                continue;
            }
            // Get indexes of cells with given note in the box being checked
            let indexesWithNote:Group = this.cellBoard.getIndexesWithNote(GroupEnum.BOX, box, note);
            // Proceed to check next note if there isn't the right number of occurences of the note
            let tuple:TupleEnum = indexesWithNote.getSize();
            if (tuple !== TupleEnum.PAIR && tuple !== TupleEnum.TRIPLET) {
                continue;
            }
            // Get cells that contain the notes
            let cells:Cell[] = new Array();
            for (let i:number = 0; i < SudokuEnum.ROW_LENGTH; i++) {
                if (indexesWithNote.contains(i)) {
                    cells.push(this.board[Cell.calculateRow(box, i)][Cell.calculateColumn(box, i)]);
                }
            }
            // Check if they are on the same row or column
            let rowSet:boolean = true, columnSet:boolean = true;
            for (let i:number = 0; i < (cells.length - 1); i++) {
                if (cells[i].getRow() !== cells[i + 1].getRow()) {
                    rowSet = false;
                }
                if (cells[i].getColumn() !== cells[i + 1].getColumn()) {
                    columnSet = false;
                }
            }
            // Proceed to check next note if the cells aren't all on the same row or column
            if (!rowSet && !columnSet) {
                continue;
            }
            // Check if note is in the rest of the row or column, if so add to cause/groups and notes to remove arrays and return true
            let found:boolean = false;
            let distanceRatio:number;
            let notes:Group[] = new Array();
            if (rowSet) {
                let row:number = cells[0].getRow();
                let columnStart:number = Cell.getBoxColumnStart(box);
                for (let column:number = 0; column < SudokuEnum.ROW_LENGTH; column++) {
                    if (column < columnStart || column > (columnStart + SudokuEnum.BOX_LENGTH - 1)) {
                        if (this.board[row][column].isEmpty() && (this.board[row][column].getNotes()).contains(note)) {
                            let toRemove:Group = new Group(false, row, column);
                            toRemove.insert(note);
                            notes.push(toRemove);
                            found = true;
                        }
                    }
                }
                if (found) {
                    this.groups.push([GroupEnum.ROW, row]);
                    distanceRatio = this.getDistanceRatio(cells, GroupEnum.ROW);
                }
            }
            else {
                let column:number = cells[0].getColumn();
                let rowStart:number = Cell.getBoxRowStart(box);
                for (let row:number = 0; row < SudokuEnum.ROW_LENGTH; row++) {
                    if (row < rowStart || row > (rowStart + SudokuEnum.BOX_LENGTH - 1)) {
                        if (this.board[row][column].isEmpty() && (this.board[row][column].getNotes()).contains(note)) {
                            let toRemove:Group = new Group(false, row, column);
                            toRemove.insert(note);
                            notes.push(toRemove);
                            found = true;
                        }
                    }
                }
                if (found) {
                    this.groups.push([GroupEnum.COLUMN, column]);
                    distanceRatio = this.getDistanceRatio(cells, GroupEnum.COLUMN);
                }
            }
            if (found) {
                this.identified = true;
                this.groups.push([GroupEnum.BOX, box]);
                this.cause = cells;
                this.notes = notes;
                if (tuple === TupleEnum.PAIR) {
                    this.difficulty = DifficultyLowerBounds.POINTING_PAIR;
                    this.difficulty += Math.ceil(distanceRatio * (DifficultyUpperBounds.POINTING_PAIR - DifficultyLowerBounds.POINTING_PAIR));
                }
                return tuple;
            }
        }
        return null;
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
            for (let rr:number = boxRowStart; rr < (boxRowStart + SudokuEnum.BOX_LENGTH); rr++) {
                for (let cc:number = boxColumnStart; cc < (boxColumnStart + SudokuEnum.BOX_LENGTH); cc++) {
                    if (!this.board[rr][cc].isEmpty()) {
                        if (!notesToRemove.contains(this.board[rr][cc].getValue())) {
                            notesToRemove.insert(this.board[rr][cc].getValue());
                            this.cause.push(this.board[rr][cc]);
                            if (!usedGroup) {
                                this.groups.push([GroupEnum.BOX, this.board[rr][cc].getBox()]);
                                usedGroup = true;
                            }
                        }
                    }
                }
            }
            // If there are notes to remove then return them
            if (notesToRemove.getSize() < SudokuEnum.ROW_LENGTH) {
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
            if (strategy !== StrategyEnum.NAKED_QUINTUPLET && strategy !== StrategyEnum.NAKED_SEXTUPLET &&
                strategy !== StrategyEnum.NAKED_SEPTUPLET && strategy !== StrategyEnum.NAKED_OCTUPLET &&
                strategy !== StrategyEnum.HIDDEN_QUINTUPLET && strategy !== StrategyEnum.HIDDEN_SEXTUPLET &&
                strategy !== StrategyEnum.HIDDEN_SEPTUPLET && strategy !== StrategyEnum.HIDDEN_OCTUPLET &&
                strategy !== StrategyEnum.POINTING_TRIPLET) {
                algorithm.push(strategy);
            }
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