import { Cell } from "./Cell";
import { Group } from "./Group";
import { GroupEnum, SudokuEnum } from "./Sudoku";

/**
 * Constructed using 2d array of Cells
 * Maintains metadata about arary of Cells
 */
export class CellBoard{
    // 2d Cell "board" array
    private cells: Cell[][];
    // 2d array of Groups storing which values have been placed in each group
    // e.g. valuesPlaced[0][2] is third row
    private valuesPlaced: Group[][];

    constructor(cells: Cell[][]) {
        this.cells = cells;
        this.valuesPlaced = new Array();
        for (let i:number = 0; i < GroupEnum.COUNT; i++) {
            this.valuesPlaced.push(new Array());
            for (let j:number = 0; j < SudokuEnum.ROW_LENGTH; j++) {
                this.valuesPlaced[i].push(new Group(false));
            }
        }
    }

    /**
     * Sets given value for given cell and updates metadata
     * @param row - row Cell is in
     * @param column - column Cell is in
     * @param value - value being placed in Cell
     */
    public setValue(row: number, column: number, value: string):void {
        this.cells[row][column].setValue(value);
        this.valuesPlaced[GroupEnum.ROW][row].insert(value);
        this.valuesPlaced[GroupEnum.COLUMN][column].insert(value);
        this.valuesPlaced[GroupEnum.BOX][Cell.calculateBox(row, column)].insert(value);
        return;
    }

    /**
     * Gets values placed in given group e.g. Group representing 3rd row
     * @param group - Group type e.g. row
     * @param index - index e.g. 2 = 3rd
     * @returns Group object containing values placed in given row
     */
    public getValuesPlaced(group: GroupEnum, index: number):Group {
        return this.valuesPlaced[group][index];
    }
}