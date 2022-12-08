import { Cell } from "./Cell";
import { Strategy } from "./Strategy";

/**
 * Contains hint information for each strategy
 * @enum
 */
export enum HintInfo {
    NAKED_SINGLE = "Naked singles are when you only have one number left as a possibility in a cell"
}

/**
 * Contains what action hint is trying to get you to do
 * @enum
 */
export enum HintAction {
    NAKED_SINGLE = "When you see a naked single you can fill it in with its last remaining possibility"
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
     * Gets cells that have notes in them that can be removed as result of strategy
     * @returns cells containing notes to removed
     */
    public getEffectRemovals():Cell[] {
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
        super(strategy, HintInfo.NAKED_SINGLE, HintAction.NAKED_SINGLE);
    }
}