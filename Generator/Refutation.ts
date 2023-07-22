import { Cell } from "./Cell";
import { Group } from "./Group";
import { SudokuEnum } from "./Sudoku";

/**
 * Contains function to return refutation score of a Sudoku board to be used to calculate difficulty.
 * Inspired by https://www.fi.muni.cz/~xpelanek/publications/flairs-sudoku.pdf
 * Calculates difficulty based on the complexity of the what-if reasoning needed to solve the board.
 * The what-if reasoning complexity is calculated by how many calculations are needed to determine if a candidate is valid.
 * In addition to the what-if reasoning (which is refuting the possibility of other candidates) naked and hidden singles are used along with related notes.
 */
export class Refutation{
    /**
     * Returns the refutation score of the board.
     * @param board - 2d Cell array representing the board.
     * @param solution - 2d string array representing the solution.
     * @returns The refutation score of the board.
     */
    public static getRefutationScore(board: Cell[][], solution: string[][]): number{
        let refutationScore:number = 0;
        // Sums refutation score from 30 runs to account for randomness (e.g. random cell selection when solving with naked and hidden singles)
        for (let i:number = 0; i < 30; i++) {
            // Create copy of board
            let boardCopy:Cell[][] = [];
            for (let r:number = 0; r < SudokuEnum.COLUMN_LENGTH; r++) {
                boardCopy.push([]);
                for (let c:number = 0; c < SudokuEnum.ROW_LENGTH; c++) {
                    boardCopy[r].push(new Cell(r, c, board[r][c].getValue()));
                    boardCopy[r][c].resetNotes();
                    let notes:Group = new Group(false);
                    for (let n:number = 0; n < SudokuEnum.ROW_LENGTH; n++) {
                        if (!board[r][c].getNotes().contains(n)) {
                            notes.insert(n);
                        }
                    }
                    boardCopy[r][c].getNotes().remove(notes);
                }
            }
        }
        return Math.floor(refutationScore / 30);
    }
}