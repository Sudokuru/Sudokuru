import { Cell } from "./Cell";
import { CustomError, CustomErrorEnum } from "./CustomError";
import { Group } from "./Group";

/**
 * Includes standard Sudoku constants
 * @enum
 */
export enum SudokuEnum {
    ROW_LENGTH = 9,
    COLUMN_LENGTH = 9,
    BOX_LENGTH = 3,
    BOX_COUNT = 9,
    BOARD_LENGTH = 81,
    EMPTY_CELL = "0",
    CANDIDATES = "123456789"
}

/**
 * Includes constants representing the various Sudoku strategies
 * @enum
 */
export enum StrategyEnum {
    INVALID = -1,
    AMEND_NOTES,
    SIMPLIFY_NOTES,
    NAKED_SINGLE,
    HIDDEN_SINGLE,
    NAKED_PAIR,
    HIDDEN_PAIR,
    POINTING_PAIR,
    NAKED_TRIPLET,
    HIDDEN_TRIPLET,
    POINTING_TRIPLET,
    NAKED_QUADRUPLET,
    HIDDEN_QUADRUPLET,
    NAKED_QUINTUPLET,
    HIDDEN_QUINTUPLET,
    NAKED_SEXTUPLET,
    HIDDEN_SEXTUPLET,
    NAKED_SEPTUPLET,
    HIDDEN_SEPTUPLET,
    NAKED_OCTUPLET,
    HIDDEN_OCTUPLET,
    COUNT
}

/**
 * Includes constants representing the various groups of cells
 * @enum
 */
export enum GroupEnum {
    ROW = 0,
    COLUMN,
    BOX,
    COUNT
}

/**
 * Includes constants representing the various tuples e.g. naked single, pair, ...
 */
export enum TupleEnum {
    SINGLE = 1,
    PAIR,
    TRIPLET,
    QUADRUPLET,
    QUINTUPLET,
    SEXTUPLET,
    SEPTUPLET,
    OCTUPLET
}

/**
 * Checks that row is in range
 * @param row - row
 * @throws {@link CustomError}
 * Thrown if row is out of range
 */
export function validateRow(row: number):void {
    if (row < 0 || row >= SudokuEnum.ROW_LENGTH) {
        throw new CustomError(CustomErrorEnum.ROW_INDEX_OUT_OF_RANGE);
    }
}

/**
 * Checks that column is in range
 * @param column - column
 * @throws {@link CustomError}
 * Thrown if column is out of range
 */
export function validateColumn(column: number):void {
    if (column < 0 || column >= SudokuEnum.COLUMN_LENGTH) {
        throw new CustomError(CustomErrorEnum.COLUMN_INDEX_OUT_OF_RANGE);
    }
}

/**
 * Checks that value is one of the possible candidates or empty
 * @param value - value
 * @throws {@link CustomError}
 * Thrown if value is not one of the possible candidates or empty
 */
export function validateValue(value: string):void {
    for (let i:number = 0; i < SudokuEnum.CANDIDATES.length; i++) {
        if (value === SudokuEnum.CANDIDATES[i]) {
            return;
        }
    }
    if (value === SudokuEnum.EMPTY_CELL) {
        return;
    }
    throw new CustomError(CustomErrorEnum.INVALID_VALUE);
}

/**
 * Given a board string returns the equivalent board array
 * @param board - board string
 * @returns board array
 */
export function getBoardArray(board: string):string[][] {
    let boardArray: string[][] = new Array();
    for (let i:number = 0; i < SudokuEnum.COLUMN_LENGTH; i++) {
        boardArray.push([]);
        for (let j:number = 0; j < SudokuEnum.ROW_LENGTH; j++) {
            boardArray[i].push(board[(i*SudokuEnum.ROW_LENGTH)+j]);
        }
    }
    return boardArray;
}

/**
 * Creates an empty 2d Cell array with a subarray for each row in a Sudoku board
 * @returns empty cell board array
 */
export function getEmptyCellBoard():Cell[][] {
    let board: Cell[][] = new Array();
    for (let row:number = 0; row < SudokuEnum.COLUMN_LENGTH; row++) {
        board.push([]);
    }
    return board;
}

/**
 * Given a candidate (string) or candidate index (number), calculates candidate index
 * @param candidate - number candidate index or candidate string
 * @returns candidate index
 * @throws {@link CustomError}
 * Thrown if candidate isn't a string candidate or a number candidate index or is out of valid range
 */
export function getCandidateIndex(candidate: unknown):number {
    if (typeof candidate === 'string') {
        validateValue((Number(candidate) - 1).toString());
        return Number(candidate) - 1;
    }
    else if (typeof candidate === 'number') {
        validateValue((Number(candidate) + 1).toString());
        return candidate as number;
    }
    throw new CustomError(CustomErrorEnum.INVALID_CANDIDATE_TYPE);
}

/**
 * Given a set of cells returns a group containing the union of the notes of all the cells in the set (if a cell has no notes its considered to have all notes)
 * @param set - set of cells containing notes being unioned
 * @returns union of all notes in the set
 */
export function getUnionOfSetNotes(set: Cell[]):Group {
    // Stores notes contained by cells in naked set
    let setNotes:Group[] = new Array();
    for (let k:number = 0; k < set.length; k++) {
        if ((set[k].getNotes()).getSize() > 0) {
            setNotes.push(set[k].getNotes());
        }
        else {
            return new Group(true);
        }
    }
    return Group.union(setNotes);
}

/**
 * Returns a subset of given cells based on given subset G
 * @param cells - cells array
 * @param subset - Group obj representing subset
 * @returns subset of cells reflective of subset Group
 */
export function getSubsetOfCells(cells: Cell[], subset: Group):Cell[] {
    let cellSubset:Cell[] = new Array();
    for (let i:number = 0; i < cells.length; i++) {
        if (subset.contains(i)) {
            cellSubset.push(cells[i]);
        }
    }
    return cellSubset;
}

/**
 * Returns true if cells contains cell
 * @param cells - cells array
 * @param cell - cell object
 * @returns true if cells contains cell
 */
export function cellsContainCell(cells: Cell[], cell: Cell) {
    for (let i:number = 0; i < cells.length; i++) {
        if (cells[i].getRow() === cell.getRow() &&
            cells[i].getColumn() === cell.getColumn()) {
            return true;
        }
    }
    return false;
}

/**
 * Returns true if a has same cells as b
 * @param a - cells array a
 * @param b - cells array b
 * @returns true if a has the same cells as b
 */
export function cellsEqual(a: Cell[], b: Cell[]):boolean {
    if (a.length !== b.length) {
        return false;
    }
    for (let i:number = 0; i < a.length; i++) {
        if (!cellsContainCell(b, a[i])) {
            return false;
        }
    }
    return true;
}

/**
 * Returns true if a has any of the same cells as b
 * @param a - cells array a
 * @param b - cells array b
 * @returns true if a has any of the same cells as b
 */
export function anyCellsEqual(a: Cell[], b: Cell[]):boolean {
    for (let i:number = 0; i < a.length; i++) {
        if (cellsContainCell(b, a[i])) {
            return true;
        }
    }
    return false;
}

/**
 * Removes value at given row and column from every row/column/box that it is in
 * @param board - 2d Cell array representing the board
 * @param row - row of value
 * @param column - column of value
 */
export function simplifyNotes(board: Cell[][], row: number, column: number):void {
    if (board[row][column].isEmpty()) {
        return;
    }
    let value:Group = new Group(false);
    value.insert(board[row][column].getValue());
    // Remove value from row
    for (let c:number = 0; c < SudokuEnum.ROW_LENGTH; c++) {
        if (c !== column) {
            board[row][c].getNotes().remove(value);
        }
    }
    // Remove value from column
    for (let r:number = 0; r < SudokuEnum.COLUMN_LENGTH; r++) {
        if (r !== row) {
            board[r][column].getNotes().remove(value);
        }
    }
    // Remove value from box
    let boxRowStart:number = board[row][column].getBoxRowStart();
    let boxColumnStart:number = board[row][column].getBoxColumnStart();
    for (let r:number = boxRowStart; r < boxRowStart + SudokuEnum.BOX_LENGTH; r++) {
        for (let c:number = boxColumnStart; c < boxColumnStart + SudokuEnum.BOX_LENGTH; c++) {
            if (r !== row || c !== column) {
                board[r][c].getNotes().remove(value);
            }
        }
    }
    return;
}

/**
 * Given a 2d string board array throws duplicate value error if board is invalid
 * @param board - 2d string board array
 * @throws {@link CustomError}
 */
export function checkBoardForDuplicates(board: string[][]):void;

export function checkBoardForDuplicates(board: Cell[][]):void;

export function checkBoardForDuplicates(board: unknown):void {
    let boardArray:string[][];
    if (typeof(board[0][0]) === 'object') {
        // Convert board to string array
        boardArray = new Array();
        for (let row:number = 0; row < SudokuEnum.COLUMN_LENGTH; row++) {
            boardArray.push([]);
            for (let column:number = 0; column < SudokuEnum.ROW_LENGTH; column++) {
                if (board[row][column].isEmpty()) {
                    boardArray[row].push(SudokuEnum.EMPTY_CELL);
                }
                else {
                    boardArray[row].push(board[row][column].getValue());
                }
            }
        }
    }
    else {
        boardArray = board as string[][];
    }
    // checks every row for duplicate values
    for (let row:number = 0; row < SudokuEnum.COLUMN_LENGTH; row++) {
        // stores values found in the row
        let rowGroup:Group = new Group(false);
        for (let column:number = 0; column < SudokuEnum.ROW_LENGTH; column++) {
            // If there is a value in the cell and it's already been added to the group throw a duplicate value error, otherwise just insert it
            if ((boardArray[row][column] !== SudokuEnum.EMPTY_CELL) && !rowGroup.insert(boardArray[row][column])) {
                throw new CustomError(CustomErrorEnum.DUPLICATE_VALUE_IN_ROW);
            }
        }
    }
    // checks every column for duplicate values
    for (let column:number = 0; column < SudokuEnum.ROW_LENGTH; column++) {
        // stores values found in the column
        let columnGroup:Group = new Group(false);
        for (let row:number = 0; row < SudokuEnum.COLUMN_LENGTH; row++) {
            // If there is a value in the cell and it's already been added to the group throw a duplicate value error, otherwise just insert it
            if ((boardArray[row][column] !== SudokuEnum.EMPTY_CELL) && !columnGroup.insert(boardArray[row][column])) {
                throw new CustomError(CustomErrorEnum.DUPLICATE_VALUE_IN_COLUMN);
            }
        }
    }
    // checks every box for duplicate values
    for (let box:number = 0; box < SudokuEnum.BOX_COUNT; box++) {
        // stores values found in the box
        let boxGroup:Group = new Group(false);
        let rowStart:number = Cell.getBoxRowStart(box);
        for (let row:number = rowStart; row < (rowStart + SudokuEnum.BOX_LENGTH); row++) {
            let columnStart:number = Cell.getBoxColumnStart(box);
            for (let column:number = columnStart; column < (columnStart + SudokuEnum.BOX_LENGTH); column++) {
                // If there is a value in the cell and it's already been added to the group throw a duplicate value error, otherwise just insert it
                if ((boardArray[row][column] !== SudokuEnum.EMPTY_CELL) && !boxGroup.insert(boardArray[row][column])) {
                    throw new CustomError(CustomErrorEnum.DUPLICATE_VALUE_IN_BOX);
                }
            }
        }
    }
    return;
}

/**
 * Given a 2d Cell board checks for values that don't appear in row/column/boxes as placed values or notes
 * @param board - 2d Cell board
 * @throws {@link CustomError}
 */
export function checkBoardForMissingValues(board: Cell[][]):void {
    // checks every row for missing values
    for (let row:number = 0; row < SudokuEnum.COLUMN_LENGTH; row++) {
        // stores values found in the row
        let rowGroup:Group = new Group(false);
        for (let column:number = 0; column < SudokuEnum.ROW_LENGTH; column++) {
            // If there is a value in the cell insert it, otherwise insert all notes
            if (!board[row][column].isEmpty()) {
                rowGroup.insert(board[row][column].getValue());
            }
            else {
                rowGroup.insert(board[row][column].getNotes());
            }
        }
        // If there are any missing values throw an error
        if (rowGroup.getSize() !== SudokuEnum.ROW_LENGTH) {
            throw new CustomError(CustomErrorEnum.MISSING_VALUE);
        }
    }
    // checks every column for missing values
    for (let column:number = 0; column < SudokuEnum.ROW_LENGTH; column++) {
        // stores values found in the column
        let columnGroup:Group = new Group(false);
        for (let row:number = 0; row < SudokuEnum.COLUMN_LENGTH; row++) {
            // If there is a value in the cell insert it, otherwise insert all notes
            if (!board[row][column].isEmpty()) {
                columnGroup.insert(board[row][column].getValue());
            }
            else {
                columnGroup.insert(board[row][column].getNotes());
            }
        }
        // If there are any missing values throw an error
        if (columnGroup.getSize() !== SudokuEnum.COLUMN_LENGTH) {
            throw new CustomError(CustomErrorEnum.MISSING_VALUE);
        }
    }
    // checks every box for missing values
    for (let box:number = 0; box < SudokuEnum.BOX_COUNT; box++) {
        // stores values found in the box
        let boxGroup:Group = new Group(false);
        let rowStart:number = Cell.getBoxRowStart(box);
        for (let row:number = rowStart; row < (rowStart + SudokuEnum.BOX_LENGTH); row++) {
            let columnStart:number = Cell.getBoxColumnStart(box);
            for (let column:number = columnStart; column < (columnStart + SudokuEnum.BOX_LENGTH); column++) {
                // If there is a value in the cell insert it, otherwise insert all notes
                if (!board[row][column].isEmpty()) {
                    boxGroup.insert(board[row][column].getValue());
                }
                else {
                    boxGroup.insert(board[row][column].getNotes());
                }
            }
        }
        // If there are any missing values throw an error
        if (boxGroup.getSize() !== SudokuEnum.ROW_LENGTH) {
            throw new CustomError(CustomErrorEnum.MISSING_VALUE);
        }
    }
    return;
}

/**
 * Given a 2d Cell board creates and returns a copy of it
 * @param board - 2d Cell board
 * @returns copy of board
 */
export function copy2dCellArray(board: Cell[][]):Cell[][] {
    let boardCopy:Cell[][] = [];
    for (let r:number = 0; r < SudokuEnum.COLUMN_LENGTH; r++) {
        boardCopy.push([]);
        for (let c:number = 0; c < SudokuEnum.ROW_LENGTH; c++) {
            boardCopy[r].push(new Cell(r, c, board[r][c].getValue()));
            boardCopy[r][c].resetNotes();
            let notes:Group = new Group(false);
            for (let n:number = 0; n < SudokuEnum.ROW_LENGTH; n++) {
                if (!board[r][c].getNotes().contains(n)) {
                    notes.insert(n);
                }
            }
            boardCopy[r][c].getNotes().remove(notes);
        }
    }
    return boardCopy;
}

/**
 * Checks if board has been solved
 * @param board - 2d Cell board
 * @returns true if board has been solved
 */
export function isSolved(board: Cell[][]):boolean {
    for (let r:number = 0; r < SudokuEnum.COLUMN_LENGTH; r++) {
        for (let c:number = 0; c < SudokuEnum.ROW_LENGTH; c++) {
            if (board[r][c].isEmpty()) {
                return false;
            }
        }
    }
    return true;
}