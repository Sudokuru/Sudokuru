import { Solver } from "../Generator/Solver";
import { StrategyEnum, getBoardArray } from "../Generator/Sudoku";

// Given a board string returns board notes
export function calculateNotes(boardString: string): string{
    let solver:Solver = new Solver(getBoardArray(boardString));
    let notes:string = solver.getNotesString();
    // Simplifies notes
    while ((solver.nextStep()).getStrategyType() <= StrategyEnum.SIMPLIFY_NOTES) {
        notes = solver.getNotesString();
    }
    return notes;
}