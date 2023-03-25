import { Group } from "./Group";
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
    private notes: Group;

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
        if (value !== undefined) {
            validateValue(value);
            this.value = value;
        }
        else {
            this.value = SudokuEnum.EMPTY_CELL;
        }
        this.notes = new Group(false);
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
     * Get given box column start
     * @returns first column in given box
     */
    public static getBoxColumnStart(box: number) {
        return (box % SudokuEnum.BOX_LENGTH) * 3;
    }

    /**
     * Get box column start
     * @returns first column in box
     */
    public getBoxColumnStart():number {
        return Cell.getBoxColumnStart(this.box);
    }

    /**
     * Get given box row start
     * @returns first row in given box
     */
    public static getBoxRowStart(box: number) {
        return Math.floor(box / SudokuEnum.BOX_LENGTH) * 3;
    }

    /**
     * Get box row start
     * @returns first row in box
     */
    public getBoxRowStart():number {
        return Cell.getBoxRowStart(this.box);
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
     * Get notes group
     * @returns notes group
     */
    public getNotes():Group {
        return this.notes;
    }

    /**
     * Checks if cell has given note
     * @param note - note
     * @returns true if note is in notes
     */
    public hasNote(note: string):boolean {
        return this.notes.contains(note);
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
        this.notes.remove(note);
        return;
    }

    /**
     * Removes notes
     * @param notes - notes
     */
    public removeNotes(notes: Group):void {
        for (let note:number = 0; note < SudokuEnum.ROW_LENGTH; note++) {
            if (notes.contains(note)) {
                this.notes.remove(note);
            }
        }
        return;
    }

    /**
     * Resets notes to contain all possible notes
     */
    public resetNotes():void {
        for (let note:number = 0; note < SudokuEnum.ROW_LENGTH; note++) {
            this.notes.insert(note);
        }
        return;
    }

    /**
     * Calculates box cell is in and sets it
     */
    private initializeBox():void {
        this.box = Cell.calculateBox(this.row, this.column);
        return;
    }

    /**
     * Given a cells row and column calculate what box it is in
     * @param row - row cell is in
     * @param column - column cell is in
     * @returns index of box given cell is in
     */
    public static calculateBox(row: number, column: number):number {
        let box:number = Math.floor(column / SudokuEnum.BOX_LENGTH);
        box += Math.floor(row / SudokuEnum.BOX_LENGTH) * SudokuEnum.BOX_LENGTH;
        return box;
    }

    /**
     * Given a cells box and box index returns what row it is in
     * @param box - box cell is in
     * @param index - box index of cell (first row is 0-2, 2nd 3-5, last 6-8)
     * @returns row cell is in
     */
    public static calculateRow(box: number, index: number):number {
        let row:number = Cell.getBoxRowStart(box);
        row += Math.floor(index / SudokuEnum.BOX_LENGTH);
        return row;
    }

    /**
     * Given a cells box and box index returns what column it is in
     * @param box - box cell is in
     * @param index - box index of cell (first row is 0-2, 2nd 3-5, last 6-8)
     * @returns column cell is in
     */
    public static calculateColumn(box: number, index: number):number {
        let column:number = Cell.getBoxColumnStart(box);
        column += index % SudokuEnum.BOX_LENGTH;
        return column;
    }
}