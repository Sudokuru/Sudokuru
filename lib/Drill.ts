import { Solver } from "../Generator/Solver";
import { getBoardArray } from "../Generator/Sudoku";

/**
 * Given a puzzle string and move number, returns the puzzle state after that moves
 * @param puzzleString - 81 character string representing the initial puzzle state
 * @param moveNumber - number of cells filled in (so index 30 has 30 cells filled in including givens)
 * @returns puzzle string after specified number of moves
 */
export function getDrillPuzzleString(puzzleString: string, moveNumber: number): string {
    // Create solver with the initial puzzle
    let solver: Solver = new Solver(getBoardArray(puzzleString));

    // Get initial placed count (givens)
    let initialPlacedCount: number = solver.getPlacedCount();
    let targetPlacedCount: number = initialPlacedCount + moveNumber;

    // Validate moveNumber
    if (moveNumber < 0 || targetPlacedCount > 81) {
        throw new Error("Invalid move number: " + moveNumber);
    }

    // If no moves requested, return original puzzle
    if (moveNumber === 0) {
        return puzzleString;
    }

    // Execute solver steps until target placed count is reached
    while (solver.getPlacedCount() < targetPlacedCount) {
        let hint = solver.nextStep();
        if (hint === null) {
            break;
        }
    }

    // Build result string from current board
    let result: string = "";
    let board: string[][] = solver.getBoard();
    for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[row].length; col++) {
            result += board[row][col];
        }
    }

    return result;
}