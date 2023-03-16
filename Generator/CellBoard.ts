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
}