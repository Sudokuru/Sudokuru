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