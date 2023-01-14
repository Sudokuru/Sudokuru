import { Cell } from "../Cell";
import { SudokuEnum, TupleEnum, getEmptyCellBoard } from "../Sudoku";
import { Group } from "../Group";

// code taken from here: //https://stackoverflow.com/questions/46042613/how-to-test-the-type-of-a-thrown-exception-in-jest#:~:text=In%20Jest%20you%20have%20to%20pass%20a%20function,you%20also%20want%20to%20check%20for%20error%20message%3A
class NoErrorThrownError extends Error {};
export const getError = async <TError>(call: () => unknown): Promise<TError> => {
    try {
        await call();
        throw new NoErrorThrownError();
    } catch (error: unknown) {
        return error as TError;
    }
};

/**
 * Creates a 2d Cell array with a subarray for each row in Sudoku and an empty Cell for each column in each row
 * @returns blank cell board
 */
export function getBlankCellBoard():Cell[][] {
    let board: Cell[][] = getEmptyCellBoard();
    for (let row:number = 0; row < SudokuEnum.COLUMN_LENGTH; row++) {
        for (let column:number = 0; column < SudokuEnum.ROW_LENGTH; column++) {
            board[row].push(new Cell(row, column));
        }
    }
    return board;
}

/**
 * Given a tuple and a board returns the a 2d cell array containing the first tuple cells from the first row of the board
 * @param tuple - number of cells being returned
 * @param board - 2d cell array board
 * @returns 2d cell array containing the first tuple cells from the first row
 */
export function getRowTuplet(tuple: TupleEnum, board: Cell[][]):Cell[][] {
    let cells:Cell[][] = new Array();
    cells.push(new Array());
    for (let i:number = 0; i < tuple; i++) {
        cells[0].push(board[0][i]);
    }
    return cells;
}

/**
 * Returns the first tuple notes from the given notes Group
 * @param tuple - number of notes being removed
 * @param notes - Group containing notes
 */
export function removeTupleNotes(tuple: TupleEnum, notes: Group):void {
    for (let note:number = 0; note < tuple; note++) {
        notes.remove(note);
    }
    return;
}

/**
 * Removes notes from each of the cells in cells first row
 * @param notes - notes to remove from each cell in cells first row
 * @param cells - cells to remove notes from
 */
export function removeNotesFromEach(notes: Group, cells: Cell[][]):void {
    for (let i:number = 0; i < cells[0].length; i++) {
        cells[0][i].removeNotes(notes);
    }
    return;
}