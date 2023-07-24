import { Cell } from "./Cell";
import { Group } from "./Group";
import { SimpleSolver } from "./SimpleSolver";
import { SudokuEnum, checkBoardForDuplicates, checkBoardForMissingValues, copy2dCellArray, isSolved } from "./Sudoku";

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
                // Solve board step by step until naked and hidden singles can no longer be used
                while (SimpleSolver.solveStep(boardCopy)){}
                // Loop over every empty cell
                let lowestRefutationScore:number = 1000000, lowestScoreRow:number = -1, lowestScoreColumn:number = -1;
                for (let r:number = 0; r < SudokuEnum.COLUMN_LENGTH; r++) {
                    for (let c:number = 0; c < SudokuEnum.ROW_LENGTH; c++) {
                        if (!boardCopy[r][c].isEmpty()) {
                            continue;
                        }
                        // Loop over every incorrect candidate
                        for (let candidate:number = 0; candidate < SudokuEnum.ROW_LENGTH; candidate++) {
                            if ((candidate + 1).toString() === solution[r][c]) {
                                continue;
                            }
                            // Create temp copy of board
                            let tempBoard:Cell[][] = copy2dCellArray(boardCopy);
                            // Place incorrect candidate in cell
                            tempBoard[r][c].setValue((candidate + 1).toString());
                            // Calculate refutation score
                            let refutationScoreTemp:number = 0;
                            // Loop until this candidate is proven to be invalid i.e. refuted i.e. rule violation is found or cannot solve board
                            while (true) {
                                // Increment refutation score
                                refutationScoreTemp++;
                                // Exit loop if duplicates are found in row, column, or box
                                try {
                                    checkBoardForDuplicates(tempBoard);
                                } catch (CustomError) {
                                    break;
                                }
                                // Exit loop if values are missing from row, column, or box
                                try {
                                    checkBoardForMissingValues(tempBoard);
                                } catch (CustomError) {
                                    break;
                                }
                                // Exit loop if cannot solve board
                                if (!SimpleSolver.solveStep(tempBoard)) {
                                    break;
                                }
                            }
                            // Update lowest refutation score
                            if (refutationScoreTemp < lowestRefutationScore) {
                                lowestRefutationScore = refutationScoreTemp;
                                lowestScoreRow = r;
                                lowestScoreColumn = c;
                            }
                        }
                    }
                }
                // Add lowest refutation score to total refutation score
                refutationScore += lowestRefutationScore;
                // Fill in cell with lowest refutation score
                boardCopy[lowestScoreRow][lowestScoreColumn].setValue(solution[lowestScoreRow][lowestScoreColumn]);
            }
        }
        return Math.floor(refutationScore / 30);
    }
}