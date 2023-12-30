import { Board } from "../Generator/Board";
import { StrategyEnum } from "../Generator/Sudoku";

/**
 * Given a puzzle board string returns data about it
 * @param board - puzzle board string ( 81 characters representing values or "0" if empty, read left to right, top to bottom)
 * @returns JSON object containing board data
 */
export function getPuzzleData(board: string): JSON {
    let boardObj: Board = new Board(board);
    return <JSON><unknown>{
        "solution": boardObj.getSolutionString(),
        "difficulty": boardObj.getDifficulty(),
        "puzzleStrategies": boardObj.getStrategies().slice(2, StrategyEnum.HIDDEN_QUADRUPLET + 1) // excludes amend/simplify notes strategies and everything past hidden quadruplet
    };
}