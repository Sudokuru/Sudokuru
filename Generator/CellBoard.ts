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
    // 2d array of Groups storing which indexes in each group have had values placed in them
    private indexesPlaced: Group[][];

    constructor(cells: Cell[][]) {
        this.cells = cells;
        this.valuesPlaced = new Array();
        this.indexesPlaced = new Array();
        for (let i:number = 0; i < GroupEnum.COUNT; i++) {
            this.valuesPlaced.push(new Array());
            this.indexesPlaced.push(new Array());
            for (let j:number = 0; j < SudokuEnum.ROW_LENGTH; j++) {
                this.valuesPlaced[i].push(new Group(false));
                this.indexesPlaced[i].push(new Group(false));
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
        let box:number = Cell.calculateBox(row, column);
        this.valuesPlaced[GroupEnum.ROW][row].insert(value);
        this.valuesPlaced[GroupEnum.COLUMN][column].insert(value);
        this.valuesPlaced[GroupEnum.BOX][box].insert(value);
        this.indexesPlaced[GroupEnum.ROW][row].insert(column);
        this.indexesPlaced[GroupEnum.COLUMN][column].insert(row);
        let index:number = 0;
        let boxRowStart:number = Cell.getBoxRowStart(box);
        let boxColumnStart:number = Cell.getBoxColumnStart(box);
        for (let r:number = boxRowStart; r < (boxRowStart + SudokuEnum.BOX_LENGTH); r++) {
            for (let c:number = boxColumnStart; c < (boxColumnStart + SudokuEnum.BOX_LENGTH); c++) {
                if (r === row && c === column) {
                    this.indexesPlaced[GroupEnum.BOX][box].insert(index);
                }
                index++;
            }
        }
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

    /**
     * Gets indexes in which values have been placed in given group
     * @param group - Group type e.g. row
     * @param index - index e.g. 2 = 3rd
     * @returns Group object containing indexes with values placed in them in given group
     */
    public getIndexesPlaced(group: GroupEnum, index: number):Group {
        return this.indexesPlaced[group][index];
    }
}