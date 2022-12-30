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
 * Given a 2d board cell array and a number n returns an array containing cells in the nth row
 * @param cells - 2d board cell array
 * @param n - row getting cells from
 * @return array of cells in nth row
 */
export function getCellsInRow(cells: Cell[][], n: number):Cell[] {
    let row: Cell[] = new Array();
    for (let column: number = 0; column < cells[n].length; column++) {
        row.push(cells[n][column]);
    }
    return row;
}

/**
 * Given a 2d board cell array and a number n returns an array containing cells in the nth column
 * @param cells - 2d board cell array
 * @param n - column getting cells from
 * @return array of cells in nth column
 */
export function getCellsInColumn(cells: Cell[][], n: number):Cell[] {
    let column: Cell[] = new Array();
    for (let i:number = 0; i < cells.length; i++) {
        for (let j:number = 0; j < cells[i].length; j++) {
            if (cells[i][j].getColumn() === n) {
                column.push(cells[i][j]);
                j = cells[i].length;
            }
        }
    }
    return column;
}

/**
 * Given a 2d board cell array and a number n returns an array containing cells in the nth box
 * @param cells - 2d board cell array
 * @param n - box getting cells from
 * @return array of cells in nth box
 */
export function getCellsInBox(cells: Cell[][], n: number):Cell[] {
    let box: Cell[] = new Array();
    for (let i:number = 0; i < cells.length; i++) {
        for (let j:number = 0; j < cells[i].length; j++) {
            if (cells[i][j].getBox() === n) {
                box.push(cells[i][j]);
            }
        }
    }
    return box;
}