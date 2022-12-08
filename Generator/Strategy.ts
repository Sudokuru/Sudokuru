import { Cell } from "./Cell";
import { CustomError, CustomErrorEnum } from "./CustomError";

/**
 * Includes constants representing the various Sudoku strategies
 * @enum
 */
export enum StrategyEnum {
    NAKED_SINGLE = 0
}

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
    // Contains cells that "cause" strategy to be applicable
    private cells: Cell[][];
    // Contains values that can be placed because of this Strategy
    private values: Cell[];
    // Contains notes that can be removed because of this Strategy
    private notes: Cell[];
    // What specific strategy is used (correlated to StrategyEnum)
    private strategyType: number;
    // Whether or not strategy has been identified and ready to use
    private identified: boolean;

    /**
     * Cell object using cells the strategy acts on
     * @constructor
     * @param cells - cells
     */
    constructor(cells: Cell[][]) {
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
    public getNotesToRemove():Cell[] {
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
        let notes:Map<string, undefined> = this.cells[0][0].getNotes();
        if (notes.size == 1) {
            for (const note of notes.keys()) {
                let row:number = this.cells[0][0].getRow();
                let column:number = this.cells[0][0].getColumn();
                this.values.push(new Cell(row, column, note));
            }
            this.strategyType = StrategyEnum.NAKED_SINGLE;
            this.identified = true;
            return true;
        }
        return false;
    }
}