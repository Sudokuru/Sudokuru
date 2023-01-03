import { Cell } from "./Cell";
import { CustomError, CustomErrorEnum } from "./CustomError";

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
    NAKED_SINGLE,
    HIDDEN_SINGLE,
    NAKED_PAIR,
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
 * Given a 2d board cell array and a number n returns a 2d array containing only cells in the nth row
 * @param cells - 2d board cell array
 * @param n - row getting cells from
 * @return array of cells in nth row
 */
export function getCellsInRow(cells: Cell[][], n: number):Cell[][] {
    let row: Cell[][] = new Array();
    for (let r = 0; r < cells.length; r++) {
        row.push([]);
    }
    if (cells[n] === undefined) {
        console.log(cells.length);
        console.log(cells);
    }
    for (let column: number = 0; column < cells[n].length; column++) {
        row[n].push(cells[n][column]);
    }
    return row;
}

/**
 * Given a 2d board cell array and a number n returns a 2d array containing only cells in the nth column
 * @param cells - 2d board cell array
 * @param n - column getting cells from
 * @return array of cells in nth column
 */
export function getCellsInColumn(cells: Cell[][], n: number):Cell[][] {
    let column: Cell[][] = new Array();
    for (let r = 0; r < cells.length; r++) {
        column.push([]);
    }
    for (let i:number = 0; i < cells.length; i++) {
        for (let j:number = 0; j < cells[i].length; j++) {
            if (cells[i][j].getColumn() === n) {
                column[i].push(cells[i][j]);
                j = cells[i].length;
            }
        }
    }
    return column;
}

/**
 * Given a 2d board cell array and a number n returns a 2d array containing only cells in the nth box
 * @param cells - 2d board cell array
 * @param n - box getting cells from
 * @return array of cells in nth box
 */
export function getCellsInBox(cells: Cell[][], n: number):Cell[][] {
    let box: Cell[][] = new Array();
    for (let r = 0; r < cells.length; r++) {
        box.push([]);
    }
    for (let i:number = 0; i < cells.length; i++) {
         for (let j:number = 0; j < cells[i].length; j++) {
            if (cells[i][j].getBox() === n) {
                box[i].push(cells[i][j]);
            }
        }
    }
    return box;
}

/**
 * Given cell array and cell returns next cell in same row iterating left to right, if there is none returns null
 * @param cells - 2d cell array
 * @param cell - current cell
 * @returns next cell in cells in same row if there is one, otherwise null
 */
export function getNextCellInRow(cells: Cell[][], cell: Cell):Cell {
    let row: Cell[][] = getCellsInRow(cells, cell.getRow());
    for (let i:number = 0; i < row[cell.getRow()].length; i++) {
        if (row[cell.getRow()][i].getColumn() > cell.getColumn()) {
            return row[cell.getRow()][i];
        }
    }
    return null;
}

/**
 * Given cell array and cell returns next cell in same column iterating top to bottom, if there is none returns null
 * @param cells - 2d cell array
 * @param cell - current cell
 * @returns next cell in cells in same column if there is one, otherwise null
 */
export function getNextCellInColumn(cells: Cell[][], cell: Cell):Cell {
    let column: Cell[][] = getCellsInColumn(cells, cell.getColumn());
    for (let i:number = 0; i < column.length; i++) {
        for (let j:number = 0; j < column[i].length; j++) {
            if (column[i][j].getRow() > cell.getRow()) {
                return column[i][j];
            }
        }
    }
    return null;
}

/**
 * Given cell array and cell returns next cell in same box iterating left to right, top to bottom, if there is none returns null
 * @param cells - 2d cell array
 * @param cell - current cell
 * @returns next cell in cells in same box if there is one, otherwise null
 */
export function getNextCellInBox(cells: Cell[][], cell: Cell):Cell {
    let box: Cell[][] = getCellsInBox(cells, cell.getBox());
    for (let i:number = 0; i < box.length; i++) {
        for (let j:number = 0; j < box[i].length; j++) {
            if ((i > cell.getRow()) || ((i === cell.getRow()) && (j > cell.getColumn()))) {
                return box[i][j];
            }
        }
    }
    return null;
}

/**
 * Given cell array, cell, and group type returns next cell in group if there is one, otherwise null (left to right, top down)
 * @param cells - 2d cell array
 * @param cell - current cell
 * @param group - group type
 * @returns next cell in cells same group if there is one, otherwise null
 */
export function getNextCellInGroup(cells: Cell[][], cell: Cell, group: GroupEnum):Cell {
    if (group === GroupEnum.ROW) {
        return getNextCellInRow(cells, cell);
    }
    else if (group === GroupEnum.COLUMN) {
        return getNextCellInColumn(cells, cell);
    }
    else {
        return getNextCellInBox(cells, cell);
    }
}

/**
* Given a 2d cell array and a cell, returns the next cell iterating left to right, top to bottom, if there is none returns null
 * @param cells - 2d cell array
 * @param cell - current cell
 * @returns next cell in cells if there is one, otherwise null
 */
export function getNextCell(cells: Cell[][], cell: Cell):Cell {
    for (let i:number = 0; i < cells.length; i++) {
        for (let j:number = 0; j < cells[i].length; j++) {
            if (cells[i][j].getRow() > cell.getRow() || 
                (cells[i][j].getRow() === cell.getRow() && cells[i][j].getColumn() > cell.getColumn())) {
                return cells[i][j];
            }
        }
    }
    return null;
}