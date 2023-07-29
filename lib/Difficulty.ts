import { Strategy } from "../Generator/Strategy";
import { sudokuStrategyArray } from "./Api";

// Old difficulty conversion algorithm, will be replaced.
export function difficultyConversion(difficulty: number, strategies: sudokuStrategyArray): number {
    // If difficulty was put on the standard 1-1000 scale the top portion of the scale would contain strategies user doesn't know
        // Therefore the following code sets difficulty on 1-HardestPossiblePuzzleWithOnlyGivenStrategies scale
        let hardestStrategyDifficulty:number = Strategy.getHighestStrategyDifficultyBound(strategies);
        //let hardestGameWithStrategies:number = Math.min(getMaxGameDifficulty(MAX_DIFFICULTY), getMaxGameDifficulty(hardestStrategyDifficulty) * 2);
        let hardestStrategyRatio:number;
        if (strategies.indexOf("POINTING_PAIR") !== -1 || strategies.indexOf("POINTING_TRIPLET") !== -1){
            hardestStrategyRatio = 1;
        }
        else if (strategies.indexOf("HIDDEN_PAIR") !== -1 || strategies.indexOf("HIDDEN_TRIPLET") !== -1 || strategies.indexOf("HIDDEN_QUADRUPLET") !== -1){
            hardestStrategyRatio = 1;
        }
        else if (strategies.indexOf("HIDDEN_SINGLE") !== -1 ){
            hardestStrategyRatio = 1;
        }
        else if (strategies.indexOf("NAKED_PAIR") !== -1 || strategies.indexOf("NAKED_TRIPLET") !== -1 || strategies.indexOf("NAKED_QUADRUPLET") !== -1){
            hardestStrategyRatio = 0.2;
        }
        else if (strategies.indexOf("NAKED_SINGLE") !== -1){
            hardestStrategyRatio = 0.2;
        }
        return Math.ceil(1000 * (difficulty * (hardestStrategyRatio)));
}