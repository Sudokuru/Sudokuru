import { Cell } from "./Cell";
import { Group } from "./Group";
import { SudokuEnum, copy2dCellArray, isSolved } from "./Sudoku";

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
            let boardCopy:Cell[][] = copy2dCellArray(board);
            // Increment refutation score until board is solved
            while (!isSolved(boardCopy)) {
            }
        }
        return Math.floor(refutationScore / 30);
    }
}