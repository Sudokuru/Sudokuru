import { SudokuEnum } from "./Sudoku";

export enum CustomErrorEnum {
    INVALID_BOARD_LENGTH = "The board is not length " + SudokuEnum.BOARD_LENGTH,
    DEFAULT_ERROR = "Default Error"
}

export class CustomError {

    Error_Message!: CustomErrorEnum;

    constructor(message: CustomErrorEnum){
        this.Error_Message = message;
    }
}
