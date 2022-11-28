import { SudokuEnum, validateRow, validateColumn, validateValue } from "./Sudoku";
/**
 * Constructed using row and column and optionally placed value
 * Can remove notes
 * Can place value
 * Returns:
 * Row
 * Column
 * Value
 * Notes
 * Has note
 */
export class Cell{
    private row: number;
    private column: number;
    private value: string;
    private notes: Map<string, undefined>;

    /**
     * Creates cell object using given row/column, empty cell, all notes
     * @constructor
     * @param {number} row - Row index (0 indexed)
     * @param {number} column - Column index (0 indexed)
     * @param {string} [value] - Optional placed value
     * @throws {ROW_INDEX_OUT_OF_RANGE}
     * @throws {COLUMN_INDEX_OUT_OF_RANGE}
     * @throws {INVALID_VALUE}
     */
    constructor(row: number, column: number, value?:string) {
        validateRow(row);
        validateColumn(column);
        this.row = row;
        this.column = column;
        if (value != undefined) {
            validateValue(value);
            this.value = value;
        }
        else {
            this.value = SudokuEnum.EMPTY_CELL;
        }
        this.initializeNotes();
    }

    public getRow():number {
        return this.row;
    }

    public getColumn():number {
        return this.column;
    }

    public getValue():string {
        return this.value;
    }

    public isEmpty():boolean {
        if (this.value === SudokuEnum.EMPTY_CELL) {
            return true;
        }
        return false;
    }

    public getNotes():Map<string, undefined> {
        return this.notes;
    }

    public hasNote(note: string):boolean {
        return this.notes.has(note);
    }

    public setValue(value: string):void {
        this.value = value;
        return;
    }

    public removeNote(note: string):void {
        this.notes.delete(note);
        return;
    }

    public removeNotes(notes: Map<string, undefined>):void {
        for (const note of notes.keys()) {
            this.notes.delete(note);
        }
        return;
    }

    private initializeNotes():void {
        this.notes = new Map();
        for (let i:number = 0; i < SudokuEnum.CANDIDATES.length; i++) {
            this.notes.set(SudokuEnum.CANDIDATES[i], undefined);
        }
        return;
    }
}