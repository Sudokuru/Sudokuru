import { SudokuEnum } from "./Sudoku";

export enum CustomErrorEnum {
    INVALID_BOARD_LENGTH = "The board is not length " + SudokuEnum.BOARD_LENGTH,
    INVALID_BOARD_CHARACTERS = "The board contains characters other than the empty value: " + SudokuEnum.EMPTY_CELL + " and the following candidates: " + SudokuEnum.CANDIDATES,
    BOARD_ALREADY_SOLVED = "The board is already solved",
    ROW_INDEX_OUT_OF_RANGE = "The row index used isn't in the range 0-" + (SudokuEnum.ROW_LENGTH-1) + ".",
    COLUMN_INDEX_OUT_OF_RANGE = "The column index used isn't in the range 0-" + (SudokuEnum.COLUMN_LENGTH-1) + ".",
    INVALID_VALUE = "The value provided isn't one of the following options allowed: " + SudokuEnum.CANDIDATES,
    STRATEGY_NOT_IDENTIFIED = "A strategy hasn't been identified yet",
    UNSOLVABLE = "This board isn't solvable",
    DEFAULT_ERROR = "Default Error"
}

export class CustomError {

    Error_Message!: CustomErrorEnum;

    constructor(message: CustomErrorEnum){
        this.Error_Message = message;
    }
}
