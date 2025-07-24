import { Hint } from "../Generator/Hint";
import { Solver } from "../Generator/Solver";
import { Strategy } from "../Generator/Strategy";
import { getBoardArray, StrategyEnum } from "../Generator/Sudoku";
import { SudokuStrategy } from "./Api";
import { _getHint } from "./Hint";

/**
 * Given a puzzle string and move number, returns the puzzle state after that moves
 * @param puzzleString - 81 character string representing the initial puzzle state
 * @param moveNumber - number of cells filled in (so index 30 has 30 cells filled in including givens)
 * @returns puzzle string after specified number of moves
 */
export function getDrillPuzzleString(puzzleString: string, moveNumber: number): string {
    // Create solver with the initial puzzle
    let solver: Solver = new Solver(getBoardArray(puzzleString));

    // Validate moveNumber
    if (moveNumber < 0 || moveNumber > 80) {
        throw new Error("Invalid move number: " + moveNumber);
    }

    // If no moves requested, return original puzzle
    if (moveNumber === 0) {
        return puzzleString;
    }

    // Execute solver steps until target placed count is reached
    while (solver.getPlacedCount() < moveNumber) {
        let hint = solver.nextStep();
        if (hint === null) {
            break;
        }
    }

    // Build result string from current board
    let board: string[][] = solver.getBoard();
    let result: string = board.flat().join("");

    return result;
}

function containsHintOfStrategy(hints: Hint[], strategy: string): boolean {
    for (const hint of hints) {
        if (hint.getStrategy() === strategy) {
            return true;
        }
    }
    return false;
}

/**
 * Given a board string right before a strategy can be used and the strategy in question returns a hint for it (after simplifying notes with other strategies)
 * @param drillPuzzleString - 1d representation of board right before hint that can be retrieved from getDrillPuzzleString
 * @param drillStrategy - strategy to create a hint for
 * @returns JSON object containing hint data
 */
export function getDrillHint(drillPuzzleString: string, drillStrategy: SudokuStrategy):JSON {
    let algorithm:StrategyEnum[] = [];
    algorithm.push(StrategyEnum[drillStrategy]);
    let defaultAlgorithm:StrategyEnum[] = Strategy.getDefaultAlgorithm();
    for (const strategy of defaultAlgorithm) {
        if (strategy !== StrategyEnum[drillStrategy]) {
            algorithm.push(strategy);
        }
    }
    let boardArray:string[][] = getBoardArray(drillPuzzleString);
    let solver:Solver = new Solver(boardArray);
    while (!containsHintOfStrategy(solver.getAllHints(), drillStrategy)) {
        if (solver.nextStep() == null) {
            return <JSON><unknown>{
                "error": "Drill strategy not found for that puzzle string."
            };
        }
    }
    return _getHint(boardArray, algorithm, solver.getNotes());
}