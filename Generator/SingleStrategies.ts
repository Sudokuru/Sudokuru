import { Cell } from "./Cell";
import { SudokuEnum } from "./Sudoku";

/**
 * Contains function to return how, if possible, to use the naked or hidden single strategies at a specific cell.
 */
export class SingleStrategies{
    /**
     * Returns the number to place at the cell if the naked or hidden single strategy can be used.
     * @param board - 2d Cell array representing the board.
     * @param row - Row of the cell.
     * @param column - Column of the cell.
     * @returns The number to place at the cell if the naked or hidden single strategy can be used, otherwise -1.
     */
    public static getSingle(board: Cell[][], row: number, column: number): number{
        // Check if the cell is a naked single
        if (board[row][column].getNotes().getSize() === 1){
            for (let i:number = 0; i < SudokuEnum.ROW_LENGTH; i++){
                if (board[row][column].getNotes().contains(i)){
                    return i;
                }
            }
        }
        return -1;
    }
}