import { SudokuEnum, validateRow, validateColumn, validateValue } from "./Sudoku";
/**
 * Constructed using row and column and optionally placed value
 * Can remove notes
 * Can place value
 * Returns:
 * Row
 * Column
 * Box
 * Value
 * Notes
 * Has note
 */
export class Cell{
    private row: number;
    private column: number;
    private box: number;
    private value: string;
    private notes: Map<string, undefined>;

    /**
     * Creates cell object using given row/column, throws error if invalid
     * @constructor
     * @param row - Row index (0 indexed)
     * @param column - Column index (0 indexed)
     * @param value - Optional placed value
     * @throws {@link CustomError}
     * Thrown if row or column out of range or if value is invalid
     */
    constructor(row: number, column: number, value?:string) {
        validateRow(row);
        validateColumn(column);
        this.row = row;
        this.column = column;
        this.initializeBox();
        if (value != undefined) {
            validateValue(value);
            this.value = value;
        }
        else {
            this.value = SudokuEnum.EMPTY_CELL;
        }
        this.initializeNotes();
    }

    /**
     * Get row
     * @returns row
     */
    public getRow():number {
        return this.row;
    }

    /**
     * Get column
     * @returns column
     */
    public getColumn():number {
        return this.column;
    }

    /**
     * Get value
     * @returns value
     */
    public getValue():string {
        return this.value;
    }

    /**
     * Get box
     * @returns box
     */
    public getBox():number {
        return this.box;
    }

    /**
     * Get box column start
     * @returns first column in box
     */
    public getBoxColumnStart():number {
        return (this.box % SudokuEnum.BOX_LENGTH) * 3;
    }

    /**
     * Get box row start
     * @returns first row in box
     */
    public getBoxRowStart():number {
        return Math.floor(this.box / SudokuEnum.BOX_LENGTH) * 3;
    }

    /**
     * Checks if cell is empty
     * @returns true if cell is empty
     */
    public isEmpty():boolean {
        if (this.value === SudokuEnum.EMPTY_CELL) {
            return true;
        }
        return false;
    }

    /**
     * Get notes map
     * @returns notes map
     */
    public getNotes():Map<string, undefined> {
        return this.notes;
    }

    /**
     * Checks if cell has given note
     * @param note - note
     * @returns true if note is in notes
     */
    public hasNote(note: string):boolean {
        return this.notes.has(note);
    }

    /**
     * Sets value
     * @param value - value
     */
    public setValue(value: string):void {
        this.value = value;
        return;
    }

    /**
     * Remotes note
     * @param note - note
     */
    public removeNote(note: string):void {
        this.notes.delete(note);
        return;
    }

    /**
     * Removes notes
     * @param notes - notes
     */
    public removeNotes(notes: Map<string, undefined>):void {
        for (const note of notes.keys()) {
            this.notes.delete(note);
        }
        return;
    }

    /**
     * Initializes notes to contain every possibility
     */
    private initializeNotes():void {
        this.notes = new Map();
        for (let i:number = 0; i < SudokuEnum.CANDIDATES.length; i++) {
            this.notes.set(SudokuEnum.CANDIDATES[i], undefined);
        }
        return;
    }

    /**
     * Calculates box cell is in and sets it
     */
    private initializeBox():void {
        this.box = Math.floor(this.column / SudokuEnum.BOX_LENGTH);
        this.box += Math.floor(this.row / SudokuEnum.BOX_LENGTH) * SudokuEnum.BOX_LENGTH;
        return;
    }
}