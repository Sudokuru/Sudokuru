import { Cell } from "./Cell";
import { SimpleSolver } from "./SimpleSolver";
import { SingleStrategies } from "./SingleStrategies";
import { copy2dCellArray } from "./Sudoku";

/**
 * Contains function to return dependency score of a Sudoku board to be used to calculate difficulty.
 * Inspired by https://www.fi.muni.cz/~xpelanek/publications/flairs-sudoku.pdf
 * Calculates difficulty based on the dependencies of the steps used to solve the board.
 * Calculates dependency score by counting how many applications of simple strategies are available at each step.
 * So if a puzzle has an average of 6 naked/hidden singles are each step it is easier than one where you have to search for only a couple available at each step.
 */
export class Dependency {
    /**
     * Returns the dependency score of the board.
     * @param board - 2d Cell array representing the board.
     * @returns The dependency score of the board.
     */
    public static getDependencyScore(board: Cell[][]): number {
        let dependencyScore: number = 0;
        // Sums dependency score from 30 runs to account for randomness (e.g. random cell selection when solving with naked and hidden singles)
        for (let i: number = 0; i < 30; i++) {
            // Create copy of board
            let boardCopy: Cell[][] = copy2dCellArray(board);
            // Increment dependency score for 20 steps (late game every board tends to have a lot of naked/hidden singles)
            for (let j: number = 0; j < 20; j++) {
                // Count the number of naked/hidden singles available
                let nakedHiddenSingles: number = 0;
                for (let r: number = 0; r < 9; r++) {
                    for (let c: number = 0; c < 9; c++) {
                        if (boardCopy[r][c].isEmpty() && SingleStrategies.getSingle(boardCopy, r, c) !== -1) {
                            nakedHiddenSingles++;
                        }
                    }
                }
                // Increment dependency score by the number of naked/hidden singles available
                dependencyScore += nakedHiddenSingles;
                // End run if no naked/hidden singles are available\
                if (nakedHiddenSingles === 0) {
                    break;
                }
                // Sovle a random naked or hidden single step
                SimpleSolver.solveStep(boardCopy);
            }
        }
        // Return average dependency score
        return Math.floor((dependencyScore / 30) / 20);
    }
}