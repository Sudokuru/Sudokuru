import { Cell } from "./Cell";
import { Group } from "./Group";
import { GroupEnum, StrategyEnum, SudokuEnum } from "./Sudoku";

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
    // 2d array of Groups storing which indexes in each group have a given note left (cells with values placed in them are excluded)
    // e.g. indexesWithNote[2][0][3] = [GroupType][GroupIndex][Note] = [box][1st box]["4"] = indexes of cells in 1st box with "4" as note
    private indexesWithNote: Group[][][];
    // 3d array containg cells from each group
    // e.g. cellGroups[0][3][4] = [row][4th row][5th cell] = 5th cell in 4th row
    private cellGroups: Cell[][][];
    // 3d array containing cache of which groups have been searched for every strategy
    // e.g. searchedGroups[0][3][4] = [Amend notes strategy][box][5th box]
    private searchedGroups: boolean[][][];

    constructor(cells: Cell[][]) {
        this.cells = cells;

        // Initialize values and indexes placed metadata
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

        // Initialize indexesWithNote metadata
        this.indexesWithNote = new Array();
        for (let i:number = 0; i < GroupEnum.COUNT; i++) {
            this.indexesWithNote.push(new Array());
            for (let j:number = 0; j < SudokuEnum.ROW_LENGTH; j++) {
                this.indexesWithNote[i].push(new Array());
                for (let k:number = 0; k < SudokuEnum.ROW_LENGTH; k++) {
                    // Initialize group to be empty
                    this.indexesWithNote[i][j].push(new Group(false));
                }
            }
        }
        // For each note in each cell add it to the indexesWithNote groups
        for (let row:number = 0; row < SudokuEnum.COLUMN_LENGTH; row++) {
            for (let column:number = 0; column < SudokuEnum.ROW_LENGTH; column++) {
                let notes:Group = this.cells[row][column].getNotes();
                for (let note:number = 0; note < SudokuEnum.ROW_LENGTH; note++) {
                    if (notes.contains(note)) {
                        this.indexesWithNote[GroupEnum.ROW][row][note].insert(column);
                        this.indexesWithNote[GroupEnum.COLUMN][column][note].insert(row);
                        this.indexesWithNote[GroupEnum.BOX][Cell.calculateBox(row, column)][note].insert(Cell.calculateBoxIndex(row, column));
                    }
                }
            }
        }

        // Initialize cellGroups metadata
        this.cellGroups = new Array();
        for (let i:number = 0; i < GroupEnum.COUNT; i++) {
            this.cellGroups.push(new Array());
            for (let j:number = 0; j < SudokuEnum.ROW_LENGTH; j++) {
                this.cellGroups[i].push(new Array());
                for (let k:number = 0; k < SudokuEnum.ROW_LENGTH; k++) {
                    this.cellGroups[i][j].push(this.getCell(i, j, k));
                }
            }
        }

        // Initialize searchedGroups metadata
        this.searchedGroups = new Array();
        for (let i:number = 0; i < StrategyEnum.COUNT; i++) {
            this.searchedGroups.push(new Array());
            for (let j:number = 0; j < GroupEnum.COUNT; j++) {
                this.searchedGroups[i].push(new Array());
                for (let k:number = 0; k < SudokuEnum.ROW_LENGTH; k++) {
                    this.searchedGroups[i][j].push(false);
                }
            }
        }
    }

    /**
     * Reset searchedGroups to false for all groups that given cell (which is being updated) is a part of
     * @param row - row where updated cell is
     * @param column - column where updated cell is
     */
    public resetSearchedGroups(row: number, column: number):void {
        let box:number = Cell.calculateBox(row, column);
        for (let i:number = 0; i < StrategyEnum.COUNT; i++) {
            this.searchedGroups[i][GroupEnum.ROW][row] = false;
            this.searchedGroups[i][GroupEnum.COLUMN][column] = false;
            this.searchedGroups[i][GroupEnum.BOX][box] = false;
        }
        return;
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
        this.resetSearchedGroups(row, column);
        return;
    }

    /**
     * Removes given notes from given cell
     * @param row - row Cell is in
     * @param column - column Cell is in
     * @param notes - notes being removed from Cell
     */
    public removeNotes(row: number, column: number, notes: Group):void {
        this.cells[row][column].removeNotes(notes);
        // Update searched group metadata
        this.resetSearchedGroups(row, column);
        // Update indexesWithNote metadata
        for (let note:number = 0; note < SudokuEnum.ROW_LENGTH; note++) {
            if (notes.contains(note)) {
                this.indexesWithNote[GroupEnum.ROW][row][note].remove(column);
                this.indexesWithNote[GroupEnum.COLUMN][column][note].remove(row);
                this.indexesWithNote[GroupEnum.BOX][Cell.calculateBox(row, column)][note].remove(Cell.calculateBoxIndex(row, column));
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

    /**
     * Given a group and indexes returns the corresponding cell
     * @param group - group e.g. row
     * @param groupIndex - group index e.g. 5th row
     * @param index - index e.g. 7th cell in 5th row
     * @returns Cell with given group and indexes
     */
    public getCell(group: GroupEnum, groupIndex: number, index: number):Cell {
        if (group === GroupEnum.ROW) {
            return this.cells[groupIndex][index];
        }
        else if (group === GroupEnum.COLUMN) {
            return this.cells[index][groupIndex];
        }
        else if (group === GroupEnum.BOX) {
            let row:number = Cell.calculateRow(groupIndex, index);
            let column:number = Cell.calculateColumn(groupIndex, index);
            return this.cells[row][column];
        }
    }

    /**
     * Given group and its index returns all of the empty cells in it
     * @param group - group e.g. row
     * @param index - index e.g. 7th row
     * @returns array containing all empty cells in given group
     */
    public getEmptyCellsInGroup(group: GroupEnum, index: number):Cell[] {
        let cells:Cell[] = new Array();
        for (let i:number = 0; i < SudokuEnum.ROW_LENGTH; i++) {
            if (this.cellGroups[group][index][i].isEmpty()) {
                cells.push(this.cellGroups[group][index][i]);
            }
        }
        return cells;
    }

    /**
     * Given group and its index returns all of the cells in it
     * @param group - group e.g. row
     * @param index - index e.g. 7th row
     * @returns array containing all cells in given group
     */
    public getCellsInGroup(group: GroupEnum, index: number):Cell[] {
        return this.cellGroups[group][index];
    }

    /**
     * Checks whether or not a given group has been searched for a given strategy already
     * @param strategyType - strategy type e.g. amend notes
     * @param groupType - group type e.g. row
     * @param groupIndex - group index e.g. 3 (4th cell in group)
     * @returns whether or not given group has been searched for given strategy
     */
    public getSearchedGroups(strategyType: StrategyEnum, groupType: GroupEnum, groupIndex: number):boolean {
        return this.searchedGroups[strategyType][groupType][groupIndex];
    }

    /**
     * Sets whether or not a given group has been searched for a given strategy already
     * @param strategyType - strategy type e.g. amend notes
     * @param groupType - group type e.g. row
     * @param groupIndex - group index e.g. 3 (4th cell in group)
     */
    public setSearchedGroups(strategyType: StrategyEnum, groupType: GroupEnum, groupIndex: number, searched: boolean):void {
        this.searchedGroups[strategyType][groupType][groupIndex] = searched;
    }

    /**
     * Given a group and a note returns Group object containing indexes of cells containing the note in the group
     * @param groupType - group type e.g. row
     * @param index - index e.g. 3 (4th row)
     * @param note - note e.g. 4 (refers to "4")
     * @returns group containing indexes of cells in given group containing given note
     */
    public getIndexesWithNote(groupType: GroupEnum, index: number, note: number):Group {
        return this.indexesWithNote[groupType][index][note];
    }
}