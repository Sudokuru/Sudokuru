import { CustomError, CustomErrorEnum } from "./CustomError";

/**
 * Includes standard Sudoku constants
 * @enum
 */
export enum SudokuEnum {
    ROW_LENGTH = 9,
    COLUMN_LENGTH = 9,
    BOX_LENGTH = 3,
    BOARD_LENGTH = ROW_LENGTH * COLUMN_LENGTH,
    EMPTY_CELL = "0",
    CANDIDATES = "123456789"
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