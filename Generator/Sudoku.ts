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
    NAKED_TRIPLET,
    NAKED_QUADRUPLET,
    NAKED_QUINTUPLET,
    NAKED_SEXTUPLET,
    NAKED_SEPTUPLET,
    NAKED_OCTUPLET,
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
 * Given a 2d board cell array and a number n returns a 2d array containing only cells in the nth row
 * @param cells - 2d board cell array
 * @param n - row getting cells from
 * @return array of cells in nth row
 */
export function getCellsInRow(cells: Cell[][], n: number):Cell[][] {
    let row: Cell[][] = getEmptyCellBoard();
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
    let column: Cell[][] = getEmptyCellBoard();
    for (let i:number = 0; i < cells.length; i++) {
        for (let j:number = 0; j < cells[i].length; j++) {
            if (cells[i][j].getColumn() === n) {
                column[cells[i][j].getRow()].push(cells[i][j]);
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
    let box: Cell[][] = getEmptyCellBoard();
    for (let i:number = 0; i < cells.length; i++) {
         for (let j:number = 0; j < cells[i].length; j++) {
            if (cells[i][j].getBox() === n) {
                box[cells[i][j].getRow()].push(cells[i][j]);
            }
        }
    }
    return box;
}

/**
 * Given cell array and cell returns next cell in same row iterating left to right, if there is none returns null
 * If given cell is null then returns first cell in row
 * @param cells - 2d cell array
 * @param cell - current cell or null if getting first cell
 * @param index - optional param used when cell is null to specify what row/column/box to get first cell from
 * @returns next cell in cells in same row if there is one, otherwise null
 */
export function getNextCellInRow(cells: Cell[][], cell: Cell, index?: number):Cell {
    // Set index if cell is provided
    if (cell !== null) {
        index = cell.getRow();
    }
    let row: Cell[][] = getCellsInRow(cells, index);
    for (let i:number = 0; i < row[index].length; i++) {
        // Return first cell if cell is null otherwise returns next cell in column after cell
        if (cell === null || row[cell.getRow()][i].getColumn() > cell.getColumn()) {
            return row[index][i];
        }
    }
    return null;
}

/**
 * Given cell array and cell returns next cell in same column iterating top to bottom, if there is none returns null
 * If given cell is null then returns first cell in column
 * @param cells - 2d cell array
 * @param cell - current cell or null if getting first cell
 * @param index - optional param used when cell is null to specify what column to get first cell from
 * @returns next cell in cells in same column if there is one, otherwise null
 */
export function getNextCellInColumn(cells: Cell[][], cell: Cell, index?: number):Cell {
    // Set index if cell is provided
    if (cell !== null) {
        index = cell.getColumn();
    }
    let column: Cell[][] = getCellsInColumn(cells, index);
    for (let i:number = 0; i < column.length; i++) {
        for (let j:number = 0; j < column[i].length; j++) {
            // Return first cell if cell is null otherwise returns next cell in row after cell
            if (cell === null || column[i][j].getRow() > cell.getRow()) {
                return column[i][j];
            }
        }
    }
    return null;
}

/**
 * Given cell array and cell returns next cell in same box iterating left to right, top to bottom, if there is none returns null
 * If given cell is null then returns first cell in box
 * @param cells - 2d cell array
 * @param cell - current cell or null if getting first cell
 * @param index - optional param used when cell is null to specify what box to get first cell from
 * @returns next cell in cells in same box if there is one, otherwise null
 */
export function getNextCellInBox(cells: Cell[][], cell: Cell, index?: number):Cell {
    // Set index if cell is proivded
    if (cell !== null) {
        index = cell.getBox();
    }
    let box: Cell[][] = getCellsInBox(cells, index);
    for (let i:number = 0; i < box.length; i++) {
        for (let j:number = 0; j < box[i].length; j++) {
            // Return first cell if cell is null otherwise returns next cell in box after cell
            if (cell === null || (i > cell.getRow()) || ((i === cell.getRow()) && (box[i][j].getColumn() > cell.getColumn()))) {
                return box[i][j];
            }
        }
    }
    return null;
}

/**
 * Given cell array, cell, and group type returns next cell in group if there is one, otherwise null (left to right, top down)
 * If null passed for cell will return first cell in group
 * @param cells - 2d cell array
 * @param cell - current cell or null if getting first cell in group
 * @param group - group type
 * @param index - optional param used when cell is null to specify what row/column/box to get first cell from
 * @returns next cell in cells same group if there is one, otherwise null
 */
export function getNextCellInGroup(cells: Cell[][], cell: Cell, group: GroupEnum, index?: number):Cell {
    if (group === GroupEnum.ROW) {
        return getNextCellInRow(cells, cell, index);
    }
    else if (group === GroupEnum.COLUMN) {
        return getNextCellInColumn(cells, cell, index);
    }
    else {
        return getNextCellInBox(cells, cell, index);
    }
}

/**
 * Given a cell board array and a group and index returns all cells in the indexth group in the board
 * @param cells - 2d cell board array
 * @param group - row, column, or box
 * @param index - index of row, column, or box
 * @returns all cells in the indexth group e.g. all cells in 5th row
 */
export function getCellsInGroup(cells: Cell[][], group: GroupEnum, index: number):Cell[] {
    // Contains cells in the same row, column, or box
    let groupCells: Cell[] = new Array();
    // Gets first cell in group
    let nextCell:Cell = getNextCellInGroup(cells, null, group, index);
    // Adds every cell in same row, column, or box to cells
    while (nextCell !== null) {
        groupCells.push(nextCell);
        nextCell = getNextCellInGroup(cells, groupCells[groupCells.length - 1], group);
    }
    return groupCells;
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