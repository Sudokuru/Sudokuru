import { Cell } from "./Cell";
import { Group } from "./Group";
import { SudokuEnum } from "./Sudoku";

/**
 * Contains function to return how, if possible, to use the obvious or hidden single strategies at a specific cell.
 */
export class SingleStrategies{
    /**
     * Returns the number to place at the cell if the obvious or hidden single strategy can be used.
     * @param board - 2d Cell array representing the board.
     * @param row - Row of the cell.
     * @param column - Column of the cell.
     * @returns The number to place at the cell if the obvious or hidden single strategy can be used, otherwise -1.
     */
    public static getSingle(board: Cell[][], row: number, column: number): number{
        // Check if the cell is a obvious single
        if (board[row][column].getNotes().getSize() === 1){
            return board[row][column].getNotes().lower_bound(0);
        }
        // Check if the cell is a hidden single
        let hiddenSingle:Group = board[row][column].getNotes().clone(); // hidden single candidates
        // Check row
        for (let c:number = 0; c < SudokuEnum.ROW_LENGTH; c++){
            if (c !== column){
                // Remove candidates from hiddenSingle that are in the cell at (row, c)
                hiddenSingle.remove(board[row][c].getNotes());
            }
        }
        if (hiddenSingle.getSize() === 1){
            return hiddenSingle.lower_bound(0);
        }
        // Check column
        hiddenSingle = board[row][column].getNotes().clone();
        for (let r:number = 0; r < SudokuEnum.COLUMN_LENGTH; r++){
            if (r !== row){
                // Remove candidates from hiddenSingle that are in the cell at (r, column)
                hiddenSingle.remove(board[r][column].getNotes());
            }
        }
        if (hiddenSingle.getSize() === 1){
            return hiddenSingle.lower_bound(0);
        }
        // Check box
        hiddenSingle = board[row][column].getNotes().clone();
        let boxRowStart:number = board[row][column].getBoxRowStart();
        let boxColumnStart:number = board[row][column].getBoxColumnStart();
        for (let r:number = boxRowStart; r < boxRowStart + SudokuEnum.BOX_LENGTH; r++){
            for (let c:number = boxColumnStart; c < boxColumnStart + SudokuEnum.BOX_LENGTH; c++){
                if (r !== row || c !== column){
                    // Remove candidates from hiddenSingle that are in the cell at (r, c)
                    hiddenSingle.remove(board[r][c].getNotes());
                }
            }
        }
        if (hiddenSingle.getSize() === 1){
            return hiddenSingle.lower_bound(0);
        }
        return -1;
    }
}