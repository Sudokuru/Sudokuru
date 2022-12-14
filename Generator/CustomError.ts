import { SudokuEnum } from "./Sudoku";

/**
 * Includes custom error messages
 * @enum
 */
export enum CustomErrorEnum {
    INVALID_BOARD_LENGTH = "The board is not length 9",
    INVALID_BOARD_CHARACTERS = "The board contains characters other than the empty value: 0 and the following candidates: 123456789",
    BOARD_ALREADY_SOLVED = "The board is already solved",
    ROW_INDEX_OUT_OF_RANGE = "The row index used isn't in the range 0-8",
    COLUMN_INDEX_OUT_OF_RANGE = "The column index used isn't in the range 0-8",
    DUPLICATE_VALUE_IN_ROW = "There is a duplicate value in one of the rows",
    DUPLICATE_VALUE_IN_COLUMN = "There is a duplicate value in one of the columns",
    DUPLICATE_VALUE_IN_BOX = "There is a duplicate value in one of the boxes",
    INVALID_VALUE = "The value provided isn't one of the following options allowed: 123456789",
    STRATEGY_NOT_IDENTIFIED = "A strategy hasn't been identified yet",
    UNSOLVABLE = "This board isn't solvable",
    NOT_SOLVED = "This board isn't solved",
    INVALID_CANDIDATE_TYPE = "Candidate isn't a string candidate or a number candidate index",
    DEFAULT_ERROR = "Default Error"
}

export class CustomError {

    Error_Message!: CustomErrorEnum;

    Status = 400;

    constructor(message: CustomErrorEnum){
        this.Error_Message = message;
    }
}
