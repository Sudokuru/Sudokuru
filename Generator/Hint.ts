import { Cell } from "./Cell";
import { Group } from "./Group";
import { Strategy } from "./Strategy";
import { StrategyEnum } from "./Sudoku";

/**
 * Contains hint information for naked single strategy
 * Contains what action hint is trying to get you to do
 * @enum
 */
export enum NAKED_SINGLE {
    HINT_INFO = "Naked singles are when you only have one number left as a possibility in a cell",
    HINT_ACTION = "When you see a naked single you can fill it in with its last remaining possibility"
}

/**
 * Contains hint information for hidden single strategy
 * Contains what action hint is trying to get you to do
 * @enum
 */
export enum HIDDEN_SINGLE {
    HINT_INFO = "Hidden singles are when you only have one cell left still containing a specific value in a row, column, or box",
    HINT_ACTION = "When you see a hidden single you can fill it in with its unique possibility"
}

/**
 * Contains hint information for naked pair strategy
 * Contains what action hint is trying to get you to do
 * @enum
 */
export enum NAKED_PAIR {
    HINT_INFO = "Naked pairs are when you only have the same two numbers left as a possibility in two cells in the same row, column, or box",
    HINT_ACTION = "When you see a naked pair you can remove them from the notes of every other cell in the row, column, or box that they share"
}

/**
 * Contains hint information for naked triplet strategy
 * Contains what action hint is trying to get you to do
 * @enum
 */
export enum NAKED_TRIPLET {
    HINT_INFO = "Naked triplets are when you only have the same three numbers left as a possibility in three cells in the same row, column, or box",
    HINT_ACTION = "When you see a naked triplet you can remove them from the notes of every other cell in the row, column, or box that they share"
}

/**
 * Contains hint information for naked quadruplet strategy
 * Contains what action hint is trying to get you to do
 * @enum
 */
export enum NAKED_QUADRUPLET {
    HINT_INFO = "Naked quadruplets are when you only have the same four numbers left as a possibility in four cells in the same row, column, or box",
    HINT_ACTION = "When you see a naked quadruplet you can remove them from the notes of every other cell in the row, column, or box that they share"
}

/**
 * Contains hint information for naked quintuplet strategy
 * Contains what action hint is trying to get you to do
 * @enum
 */
export enum NAKED_QUINTUPLET {
    HINT_INFO = "Naked quintuplets are when you only have the same five numbers left as a possibility in five cells in the same row, column, or box",
    HINT_ACTION = "When you see a naked quintuplet you can remove them from the notes of every other cell in the row, column, or box that they share"
}

/**
 * Contains hint information for naked sextuplet strategy
 * Contains what action hint is trying to get you to do
 * @enum
 */
export enum NAKED_SEXTUPLET {
    HINT_INFO = "Naked sextuplets are when you only have the same six numbers left as a possibility in six cells in the same row, column, or box",
    HINT_ACTION = "When you see a naked sextuplet you can remove them from the notes of every other cell in the row, column, or box that they share"
}

/**
 * Contains hint information for naked septuplet strategy
 * Contains what action hint is trying to get you to do
 * @enum
 */
export enum NAKED_SEPTUPLET {
    HINT_INFO = "Naked septuplets are when you only have the same seven numbers left as a possibility in seven cells in the same row, column, or box",
    HINT_ACTION = "When you see a naked septuplet you can remove them from the notes of every other cell in the row, column, or box that they share"
}

/**
 * Contains hint information for naked octuplet strategy
 * Contains what action hint is trying to get you to do
 * @enum
 */
export enum NAKED_OCTUPLET {
    HINT_INFO = "Naked octuplets are when you only have the same eight numbers left as a possibility in eight cells in the same row, column, or box",
    HINT_ACTION = "When you see a naked octuplet you can remove them from the notes of every other cell in the row, column, or box that they share"
}

/**
 * Contains hint information for simplify notes
 * Contains what action hint is trying to get you to do
 * @enum
 */
export enum SIMPLIFY_NOTES {
    HINT_INFO = "You can simplify notes using values already placed in cells at the start of the game",
    HINT_ACTION = "When there is a value already placed in a cell than it can be removed from all other cells notes in its row, column, and box"
}

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
        if (this.getStrategyType() === StrategyEnum.NAKED_SINGLE) {
            this.info = NAKED_SINGLE.HINT_INFO;
            this.action = NAKED_SINGLE.HINT_ACTION;
        }
        else if (this.getStrategyType() === StrategyEnum.NAKED_PAIR) {
            this.info = NAKED_PAIR.HINT_INFO;
            this.action = NAKED_PAIR.HINT_ACTION;
        }
        else if (this.getStrategyType() === StrategyEnum.NAKED_TRIPLET) {
            this.info = NAKED_TRIPLET.HINT_INFO;
            this.action = NAKED_TRIPLET.HINT_ACTION;
        }
        else if (this.getStrategyType() === StrategyEnum.NAKED_QUADRUPLET) {
            this.info = NAKED_QUADRUPLET.HINT_INFO;
            this.action = NAKED_QUADRUPLET.HINT_ACTION;
        }
        else if (this.getStrategyType() === StrategyEnum.NAKED_QUINTUPLET) {
            this.info = NAKED_QUINTUPLET.HINT_INFO;
            this.action = NAKED_QUINTUPLET.HINT_ACTION;
        }
        else if (this.getStrategyType() === StrategyEnum.NAKED_SEXTUPLET) {
            this.info = NAKED_SEXTUPLET.HINT_INFO;
            this.action = NAKED_SEXTUPLET.HINT_ACTION;
        }
        else if (this.getStrategyType() === StrategyEnum.NAKED_SEPTUPLET) {
            this.info = NAKED_SEPTUPLET.HINT_INFO;
            this.action = NAKED_SEPTUPLET.HINT_ACTION;
        }
        else if (this.getStrategyType() === StrategyEnum.NAKED_OCTUPLET) {
            this.info = NAKED_OCTUPLET.HINT_INFO;
            this.action = NAKED_OCTUPLET.HINT_ACTION;
        }
        else if (this.getStrategyType() === StrategyEnum.HIDDEN_SINGLE) {
            this.info = HIDDEN_SINGLE.HINT_INFO;
            this.action = HIDDEN_SINGLE.HINT_ACTION;
        }
        else if (this.getStrategyType() === StrategyEnum.SIMPLIFY_NOTES) {
            this.info = SIMPLIFY_NOTES.HINT_INFO;
            this.action = SIMPLIFY_NOTES.HINT_ACTION;
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
        for (let i:number = 0; i < cells.length; i++) {
            let cell:number[] = new Array(2);
            cell[0] = cells[i].getRow();
            cell[1] = cells[i].getColumn();
            cause.push(cell);
        }
        return cause;
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
     * @returns cells with values placed
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