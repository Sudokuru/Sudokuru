import { SudokuEnum } from "./Sudoku";

export enum CustomErrorEnum {
    INVALID_BOARD_LENGTH = "The board is not length " + SudokuEnum.BOARD_LENGTH,
    INVALID_BOARD_CHARACTERS = "The board contains characters other than the empty value: " + SudokuEnum.EMPTY_CELL + " and the following candidates: " + SudokuEnum.CANDIDATES,
    DEFAULT_ERROR = "Default Error"
}

export class CustomError {

    Error_Message!: CustomErrorEnum;

    constructor(message: CustomErrorEnum){
        this.Error_Message = message;
    }
}
