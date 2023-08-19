import { Hint } from "../Generator/Hint";
import { Solver } from "../Generator/Solver";
import { StrategyEnum } from "../Generator/Sudoku";

/**
 * Given the state of the board and notes return a hint
 * @param board - 2d board array (9 arrays, one for each row, each with 9 strings representing values or "0" if empty)
 * @param notes - 2d notes array (81 arrays, one for each cell containing each note that is left in it)
 * @param strategies - optional parameter specifying which strategies to use
 * @param solution - optional parameter specifying solution to the given board, used in amend notes strategy to correct user mistakes
 * @returns JSON object containing hint data
 */
export function getHint(board: string[][], notes: string[][], strategies?: string[], solution?: string[][]):JSON {
    let algorithm:number[] = new Array();
    if (strategies !== undefined) {
        for (let i:number = (StrategyEnum.INVALID + 1); i < StrategyEnum.COUNT; i++) {
            for (let j:number = 0; j < strategies.length; j++) {
                if (StrategyEnum[i] === strategies[j]) {
                    algorithm.push(i);
                    j = strategies.length;
                }
            }
        }
    }
    let solver:Solver = new Solver(board, algorithm, notes, solution);
    let hint:Hint = solver.nextStep();
    return <JSON><unknown>{
        "strategy": hint.getStrategy(),
        "cause": hint.getCause(),
        "groups": hint.getGroups(),
        "placements": hint.getPlacements(),
        "removals": hint.getRemovals(),
        "info": hint.getInfo(),
        "action": hint.getAction()
    };
}