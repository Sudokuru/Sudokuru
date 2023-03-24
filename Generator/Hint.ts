import { Cell } from "./Cell";
import { Group } from "./Group";
import { Strategy } from "./Strategy";
import { StrategyEnum, SudokuEnum } from "./Sudoku";

/**
 * Constructed using strategy object and info/action strings
 * Inherited by hint classes for specific strategies like NakedSingle
 * Returns:
 * Cause (cells that "cause" the strategy to be applicable)
 * Effects (values you can place and/or notes you can remove due to strategy)
 * Info (string that explains what strategy is being used)
 * Action (string that explains how strategy is being used)
 */
export class Hint{
    private strategy: Strategy;
    private info: string;
    private action: string;

    /**
     * Creates Hint object
     * 
     * @param strategy - Strategy object
     * @param info - Hint info
     * @param action - Hint action
     */
    constructor(strategy: Strategy) {
        this.strategy = strategy;
        if (this.getStrategyType() === StrategyEnum.AMEND_NOTES) {
            this.info = "Amend notes are when you reset a cell's notes to contain every nonconflicting number";
            this.action = "When you see an amend notes you can remove all notes then add all nonconflicting numbers to its notes";
        }
        else if (this.getStrategyType() === StrategyEnum.NAKED_SINGLE) {
            this.info = "Naked singles are when you only have one number left as a possibility in a cell";
            this.action = "When you see a naked single you can fill it in with its last remaining possibility";
        }
        else if (this.getStrategyType() === StrategyEnum.NAKED_PAIR) {
            this.info = "Naked pairs are when you only have the same two numbers left as a possibility in two cells in the same row, column, or box";
            this.action = "When you see a naked pair you can remove them from the notes of every other cell in the row, column, or box that they share";
        }
        else if (this.getStrategyType() === StrategyEnum.NAKED_TRIPLET) {
            this.info = "Naked triplets are when you only have the same three numbers left as a possibility in three cells in the same row, column, or box";
            this.action = "When you see a naked triplet you can remove them from the notes of every other cell in the row, column, or box that they share";
        }
        else if (this.getStrategyType() === StrategyEnum.NAKED_QUADRUPLET) {
            this.info = "Naked quadruplets are when you only have the same four numbers left as a possibility in four cells in the same row, column, or box";
            this.action = "When you see a naked quadruplet you can remove them from the notes of every other cell in the row, column, or box that they share";
        }
        else if (this.getStrategyType() === StrategyEnum.NAKED_QUINTUPLET) {
            this.info = "Naked quintuplets are when you only have the same five numbers left as a possibility in five cells in the same row, column, or box";
            this.action = "When you see a naked quintuplet you can remove them from the notes of every other cell in the row, column, or box that they share";
        }
        else if (this.getStrategyType() === StrategyEnum.NAKED_SEXTUPLET) {
            this.info = "Naked sextuplets are when you only have the same six numbers left as a possibility in six cells in the same row, column, or box";
            this.action = "When you see a naked sextuplet you can remove them from the notes of every other cell in the row, column, or box that they share";
        }
        else if (this.getStrategyType() === StrategyEnum.NAKED_SEPTUPLET) {
            this.info = "Naked septuplets are when you only have the same seven numbers left as a possibility in seven cells in the same row, column, or box";
            this.action = "When you see a naked septuplet you can remove them from the notes of every other cell in the row, column, or box that they share";
        }
        else if (this.getStrategyType() === StrategyEnum.NAKED_OCTUPLET) {
            this.info = "Naked octuplets are when you only have the same eight numbers left as a possibility in eight cells in the same row, column, or box";
            this.action = "When you see a naked octuplet you can remove them from the notes of every other cell in the row, column, or box that they share";
        }
        else if (this.getStrategyType() === StrategyEnum.HIDDEN_SINGLE) {
            this.info = "Hidden singles are when you only have one cell left still containing a specific value in a row, column, or box";
            this.action = "When you see a hidden single you can remove all notes other than the single from the cell";
        }
        else if (this.getStrategyType() === StrategyEnum.HIDDEN_PAIR) {
            this.info = "Hidden pairs are when you only have two cells left still containing two specific values in a shared row, column, or box";
            this.action = "When you see a hidden pair you can remove all notes other than the pair from the cells";
        }
        else if (this.getStrategyType() === StrategyEnum.HIDDEN_TRIPLET) {
            this.info = "Hidden triplets are when you only have three cells left still containing three specific values in a shared row, column, or box";
            this.action = "When you see a hidden triplet you can remove all notes other than the triplet from the cells";
        }
        else if (this.getStrategyType() === StrategyEnum.HIDDEN_QUADRUPLET) {
        this.info = "Hidden quadruplets are when you only have four cells left still containing four specific values in a shared row, column, or box";
            this.action = "When you see a hidden quadruplet you can remove all notes other than the quadruplet from the cells";
        }
        else if (this.getStrategyType() === StrategyEnum.HIDDEN_QUINTUPLET) {
            this.info = "Hidden quintuplets are when you only have five cells left still containing five specific values in a shared row, column, or box";
            this.action = "When you see a hidden quintuplet you can remove all notes other than the quintuplet from the cells";
        }
        else if (this.getStrategyType() === StrategyEnum.HIDDEN_SEXTUPLET) {
            this.info = "Hidden sextuplets are when you only have six cells left still containing six specific values in a shared row, column, or box";
            this.action = "When you see a hidden sextuplet you can remove all notes other than the sextuplet from the cells";
        }
        else if (this.getStrategyType() === StrategyEnum.HIDDEN_SEPTUPLET) {
            this.info = "Hidden septuplets are when you only have seven cells left still containing seven specific values in a shared row, column, or box";
            this.action = "When you see a hidden septuplet you can remove all notes other than the septuplet from the cells";
        }
        else if (this.getStrategyType() === StrategyEnum.HIDDEN_OCTUPLET) {
            this.info = "Hidden octuplets are when you only have eight cells left still containing eight specific values in a shared row, column, or box";
            this.action = "When you see a hidden octuplet you can remove all notes other than the octuplet from the cells";
        }
        else if (this.getStrategyType() === StrategyEnum.SIMPLIFY_NOTES) {
            this.info = "You can simplify notes using values already placed in cells at the start of the game";
            this.action = "When there is a value already placed in a cell than it can be removed from all other cells notes in its row, column, and box";
        }
        else {
            throw new Error();
        }
    }

    /**
     * Gets strategy type
     * @returns strategy type
     */
    public getStrategyType():number {
        return this.strategy.getStrategyType();
    }

    /**
     * Gets strategy string
     * @returns strategy string
     */
    public getStrategy():string {
        return StrategyEnum[this.strategy.getStrategyType()];
    }

    /**
     * Gets strategy difficulty
     * @returns strategy difficulty
     */
    public getDifficulty():number {
        return this.strategy.getDifficulty();
    }

    /**
     * Gets coordinates of cells that "cause" strategy to be applicable
     * @returns cells "causing" strategy
     */
     public getCause():number[][] {
        let cause:number[][] = new Array();
        let cells:Cell[] = this.strategy.getCause();
        let addedCells:boolean[][] = new Array();
        for (let i:number = 0; i < SudokuEnum.ROW_LENGTH; i++) {
            addedCells.push(new Array(SudokuEnum.ROW_LENGTH));
        }
        for (let i:number = 0; i < cells.length; i++) {
            let cell:number[] = new Array(2);
            cell[0] = cells[i].getRow();
            cell[1] = cells[i].getColumn();
            if (!addedCells[cell[0]][cell[1]]) {
                cause.push(cell);
                addedCells[cell[0]][cell[1]] = true;
            }
        }
        return cause;
    }

    /**
     * Gets cells that "cause" strategy to be applicable
     * @returns cells "causing" strategy
     */
    public getCellsCause():Cell[] {
        return this.strategy.getCause();
    }

    /**
     * Gets groups that cause strategy
     * @returns strategy groups
     */
    public getGroups():number[][] {
        return this.strategy.getGroups();
    }

    /**
     * Gets cells that have had values placed in them as result of strategy
     * @returns cells with values placed
     */
    public getEffectPlacements():Cell[] {
        return this.strategy.getValuesToPlace();
    }

    /**
     * Gets row, column, and values for cells that have had values placed in them as result of strategy
     * @returns 2d number array containing arrays of form [row, column, value] for placed values (1-indexed)
     */
    public getPlacements():number[][] {
        let cells:Cell[] = this.strategy.getValuesToPlace();
        let placements:number[][] = new Array();
        for (let i:number = 0; i < cells.length; i++){
            placements.push(new Array(3));
            placements[i][0] = cells[i].getRow();
            placements[i][1] = cells[i].getColumn();
            placements[i][2] = Number(cells[i].getValue());
        }
        return placements;
    }

    /**
     * Gets notes that can be removed as result of strategy
     * @returns Groups containing notes to removed
     */
    public getEffectRemovals():Group[] {
        return this.strategy.getNotesToRemove();
    }

    /**
     * Gets notes that can be removed from cells along with their row and columns
     * @returns 2d number array containing arrays of form [row, column, noteA, noteB, ...] for removed notes (1-indexed)
     */
    public getRemovals():number[][] {
        let groups:Group[] = this.strategy.getNotesToRemove();
        let removals:number[][] = new Array();
        for (let i:number = 0; i < groups.length; i++) {
            removals.push(new Array(2));
            removals[i][0] = groups[i].getRow();
            removals[i][1] = groups[i].getColumn();
            for (let j:number = 0; j < 9; j++) {
                if (groups[i].contains(j)) {
                    removals[i].push(j + 1);
                }
            }
        }
        return removals;
    }

    /**
     * Gets info
     * @returns info
     */
    public getInfo():string {
        return this.info;
    }

    /**
     * Gets action
     * @returns action
     */
    public getAction():string {
        return this.action;
    }
}