import { Cell } from "./Cell";
import { SingleStrategies } from "./SingleStrategies";
import { SudokuEnum, simplifyNotes } from "./Sudoku";

/**
 * Contains function to solve a Sudoku board step by step using just naked and hidden single strategies.
 */
export class SimpleSolver{
    /**
     * If possible solves a single random cell using the naked or hidden single strategies and simplifies the notes of the board.
     * @param board - 2d Cell array representing the board.
     * @returns true if a cell was solved, false otherwise.
     */
    public static solveStep(board: Cell[][]): boolean{
        // Create array of all cells
        let cells:Cell[] = [];
        for (let r:number = 0; r < SudokuEnum.COLUMN_LENGTH; r++){
            for (let c:number = 0; c < SudokuEnum.ROW_LENGTH; c++){
                cells.push(board[r][c]);
            }
        }
        // Shuffle array
        for (let i:number = cells.length - 1; i > 0; i--){
            let j:number = Math.floor(Math.random() * (i + 1));
            let temp:Cell = cells[i];
            cells[i] = cells[j];
            cells[j] = temp;
        }
        // Check each cell for a naked or hidden single
        for (let i:number = 0; i < cells.length; i++){
            // Skip over cells that are already solved
            if (!cells[i].isEmpty()){
                continue;
            }
            let row:number = cells[i].getRow();
            let column:number = cells[i].getColumn();
            let single:number = SingleStrategies.getSingle(board, row, column);
            if (single !== -1){
                board[row][column].setValue((single + 1).toString());
                simplifyNotes(board, row, column);
                return true;
            }
        }
        return false;
    }
}