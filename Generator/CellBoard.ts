import { Cell } from "./Cell";

/**
 * Constructed using 2d array of Cells
 * Maintains metadata about arary of Cells
 */
export class CellBoard{
    // 2d Cell "board" array
    private cells: Cell[][];

    constructor(cells: Cell[][]) {
        this.cells = cells;
    }

    /**
     * Sets given value for given cell
     * @param row - row Cell is in
     * @param column - column Cell is in
     * @param value - value being placed in Cell
     */
    public setValue(row: number, column: number, value: string):void {
        this.cells[row][column].setValue(value);
        return;
    }
}