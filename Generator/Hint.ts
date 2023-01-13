import { Cell } from "./Cell";
import { Group } from "./Group";
import { Strategy } from "./Strategy";

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
    constructor(strategy: Strategy, info: string, action: string) {
        this.strategy = strategy;
        this.info = info;
        this.action = action;
    }

    /**
     * Gets strategy type
     * @returns strategy type
     */
    public getStrategyType():number {
        return this.strategy.getStrategyType();
    }

    /**
     * Gets cells that "cause" strategy to be applicable
     * @returns cells "causing" strategy
     */
     public getCause():Cell[][] {
        return this.strategy.getCause();
    }

    /**
     * Gets cells that have had values placed in them as result of strategy
     * @returns cells with values placed
     */
    public getEffectPlacements():Cell[] {
        return this.strategy.getValuesToPlace();
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

/**
 * Naked single strategy hint class
 */
export class NakedSingleHint extends Hint {
    constructor(strategy: Strategy) {
        super(strategy, NAKED_SINGLE.HINT_INFO, NAKED_SINGLE.HINT_ACTION);
    }
}

/**
 * Hidden single strategy hint class
 */
export class HiddenSingleHint extends Hint {
    constructor(strategy: Strategy) {
        super(strategy, HIDDEN_SINGLE.HINT_INFO, HIDDEN_SINGLE.HINT_ACTION);
    }
}

/**
 * Naked pair strategy hint class
 */
export class NakedPairHint extends Hint {
    constructor(strategy: Strategy) {
        super(strategy, NAKED_PAIR.HINT_INFO, NAKED_PAIR.HINT_ACTION);
    }
}

/**
 * Naked triplet strategy hint class
 */
export class NakedTripletHint extends Hint {
    constructor(strategy: Strategy) {
        super(strategy, NAKED_TRIPLET.HINT_INFO, NAKED_TRIPLET.HINT_ACTION);
    }
}

/**
 * Naked quadruplet strategy hint class
 */
export class NakedQuadrupletHint extends Hint {
    constructor(strategy: Strategy) {
        super(strategy, NAKED_QUADRUPLET.HINT_INFO, NAKED_QUADRUPLET.HINT_ACTION);
    }
}

/**
 * Naked quintuplet strategy hint class
 */
export class NakedQuintupletHint extends Hint {
    constructor(strategy: Strategy) {
        super(strategy, NAKED_QUINTUPLET.HINT_INFO, NAKED_QUINTUPLET.HINT_ACTION);
    }
}

/**
 * Naked sextuplet strategy hint class
 */
export class NakedSextupletHint extends Hint {
    constructor(strategy: Strategy) {
        super(strategy, NAKED_SEXTUPLET.HINT_INFO, NAKED_SEXTUPLET.HINT_ACTION);
    }
}

/**
 * Naked septuplet strategy hint class
 */
export class NakedSeptupletHint extends Hint {
    constructor(strategy: Strategy) {
        super(strategy, NAKED_SEPTUPLET.HINT_INFO, NAKED_SEPTUPLET.HINT_ACTION);
    }
}

/**
 * Naked octuplet strategy hint class
 */
export class NakedOctupletHint extends Hint {
    constructor(strategy: Strategy) {
        super(strategy, NAKED_OCTUPLET.HINT_INFO, NAKED_OCTUPLET.HINT_ACTION);
    }
}