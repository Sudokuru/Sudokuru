import { CustomError, CustomErrorEnum } from "./CustomError";

export enum SudokuEnum {
    ROW_LENGTH = 9,
    COLUMN_LENGTH = 9,
    BOARD_LENGTH = ROW_LENGTH * COLUMN_LENGTH,
    EMPTY_CELL = "0",
    CANDIDATES = "123456789"
}

export function validateRow(row: number):void {
    if (row < 0 || row >= SudokuEnum.ROW_LENGTH) {
        throw new CustomError(CustomErrorEnum.ROW_INDEX_OUT_OF_RANGE);
    }
}

export function validateColumn(column: number):void {
    if (column < 0 || column >= SudokuEnum.COLUMN_LENGTH) {
        throw new CustomError(CustomErrorEnum.COLUMN_INDEX_OUT_OF_RANGE);
    }
}

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