import { Cell } from "./Cell";
import { CustomError, CustomErrorEnum } from "./CustomError";
/**
 * Constructed using 2d array of cells
 * Returns:
 * Whether or object constitutes specific strategies
 * What candidates can be placed as result of strategy
 * What candidates can be removed from cells notes as result of strategy
 */
export class Strategy{
    private cells: Cell[][];
    // Contains values that can be placed because of this Strategy
    private values: Cell[];
    // Whether or not strategy has been identified and ready to use
    private identified: boolean;

    /**
     * Cell object using cells the strategy acts on
     * @constructor
     * @param {Cell[][]} cells -
     */
    constructor(cells: Cell[][]) {
        this.cells = cells;
        this.identified = false;
        this.values = new Array();
    }

    public getValuesToPlace():Cell[] {
        if (!this.identified) {
            throw new CustomError(CustomErrorEnum.STRATEGY_NOT_IDENTIFIED);
        }
        return this.values;
    }

    public isNakedSingle():boolean {
        let notes:Map<string, undefined> = this.cells[0][0].getNotes();
        if (notes.size == 1) {
            for (const note of notes.keys()) {
                let row:number = this.cells[0][0].getRow();
                let column:number = this.cells[0][0].getColumn();
                this.values.push(new Cell(row, column, note));
            }
            this.identified = true;
            return true;
        }
        return false;
    }
}