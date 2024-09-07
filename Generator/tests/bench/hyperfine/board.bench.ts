import { Board } from '../../../Board';
import { StrategyEnum } from '../../../Sudoku';
import { TestBoards } from '../../testResources';

type benchmarks = 
"shouldSolveSingleNakedSingle" | 
"shouldSolveNakedSinglesOnlyBoard" |
"shouldSolveRowHiddenSingle" |
"shouldSolveRowColumnBoxHiddenSingles" |
"shouldSolveRowNakedPair" |
"shouldSolveColumnNakedPair" |
"shouldSolveBoxNakedPair" |
"shouldSolveNakedTriplet" |
"shouldSolveNakedQuadruplet" |
"shouldSolveNakedQuintuplet" |
"shouldSolveNakedSextuplet" |
"shouldSolveNakedSeptuplet" |
"shouldSolveNakedOctuplet" |
"shouldSolvePointingPair";

const benchmarks = (benchmark: benchmarks) => {
    let algorithm:StrategyEnum[] = new Array();
    switch(benchmark) {
        case "shouldSolveSingleNakedSingle":
            new Board(TestBoards.SINGLE_NAKED_SINGLE);
            break;
        case "shouldSolveNakedSinglesOnlyBoard":
            let nakedSingleAlgo:StrategyEnum[] = new Array();
            nakedSingleAlgo.push(StrategyEnum.AMEND_NOTES);
            nakedSingleAlgo.push(StrategyEnum.SIMPLIFY_NOTES);
            nakedSingleAlgo.push(StrategyEnum.NAKED_SINGLE);
            new Board(TestBoards.ONLY_NAKED_SINGLES, nakedSingleAlgo);
            break;
        case "shouldSolveRowHiddenSingle":
            new Board(TestBoards.ROW_HIDDEN_SINGLES);
            break;
        case "shouldSolveRowColumnBoxHiddenSingles":
            new Board(TestBoards.ROW_COLUMN_BOX_HIDDEN_SINGLES);
            break;
        case "shouldSolveRowNakedPair":
            algorithm.push(StrategyEnum.AMEND_NOTES);
            algorithm.push(StrategyEnum.NAKED_PAIR);
            for (let strategy: number = 0; strategy < StrategyEnum.COUNT; strategy++) {
                if (strategy !== StrategyEnum.NAKED_PAIR && strategy !== StrategyEnum.AMEND_NOTES) {
                    algorithm.push(strategy);
                }
            }
            new Board(TestBoards.ROW_NAKED_PAIR, algorithm);
            break;
        case "shouldSolveColumnNakedPair":
            new Board(TestBoards.COLUMN_NAKED_PAIR);
            break;
        case "shouldSolveBoxNakedPair":
            new Board(TestBoards.BOX_NAKED_PAIR);
            break;
        case "shouldSolveNakedTriplet":
            new Board(TestBoards.NAKED_TRIPLET);
            break;
        case "shouldSolveNakedQuadruplet":
            algorithm.push(StrategyEnum.AMEND_NOTES);
            algorithm.push(StrategyEnum.SIMPLIFY_NOTES);
            algorithm.push(StrategyEnum.NAKED_QUADRUPLET);
            algorithm.push(StrategyEnum.NAKED_SINGLE);
            new Board(TestBoards.ONLY_NAKED_SINGLES, algorithm);
            break;
        case "shouldSolveNakedQuintuplet":
            algorithm.push(StrategyEnum.AMEND_NOTES);
            algorithm.push(StrategyEnum.NAKED_QUINTUPLET);
            for (let strategy: number = 0; strategy < StrategyEnum.COUNT; strategy++) {
                if (strategy !== StrategyEnum.NAKED_QUINTUPLET && strategy !== StrategyEnum.AMEND_NOTES) {
                    algorithm.push(strategy);
                }
            }
            new Board(TestBoards.ONLY_NAKED_SINGLES, algorithm);
            break;
        case "shouldSolveNakedSextuplet":
            algorithm.push(StrategyEnum.AMEND_NOTES);
            algorithm.push(StrategyEnum.SIMPLIFY_NOTES);
            algorithm.push(StrategyEnum.NAKED_SEXTUPLET);
            for (let strategy: number = 0; strategy < StrategyEnum.COUNT; strategy++) {
                if (strategy !== StrategyEnum.NAKED_SEXTUPLET && strategy !== StrategyEnum.SIMPLIFY_NOTES && strategy !== StrategyEnum.AMEND_NOTES) {
                    algorithm.push(strategy);
                }
            }
            new Board(TestBoards.ONLY_NAKED_SINGLES, algorithm);
            break;
        case "shouldSolveNakedSeptuplet":
            algorithm.push(StrategyEnum.AMEND_NOTES);
            algorithm.push(StrategyEnum.SIMPLIFY_NOTES);
            algorithm.push(StrategyEnum.NAKED_SEPTUPLET);
            for (let strategy: number = 0; strategy < StrategyEnum.COUNT; strategy++) {
                if (strategy !== StrategyEnum.NAKED_SEPTUPLET && strategy !== StrategyEnum.SIMPLIFY_NOTES && strategy !== StrategyEnum.AMEND_NOTES) {
                    algorithm.push(strategy);
                }
            }
            new Board(TestBoards.COLUMN_NAKED_PAIR, algorithm);
            break;
        case "shouldSolveNakedOctuplet":
            algorithm.push(StrategyEnum.AMEND_NOTES);
            algorithm.push(StrategyEnum.SIMPLIFY_NOTES);
            algorithm.push(StrategyEnum.NAKED_OCTUPLET);
            for (let strategy: number = 0; strategy < StrategyEnum.COUNT; strategy++) {
                if (strategy !== StrategyEnum.NAKED_OCTUPLET && strategy !== StrategyEnum.SIMPLIFY_NOTES && strategy !== StrategyEnum.AMEND_NOTES) {
                    algorithm.push(strategy);
                }
            }
            new Board(TestBoards.NAKED_OCTUPLET, algorithm);
        case "shouldSolvePointingPair":
            algorithm.push(StrategyEnum.AMEND_NOTES);
            algorithm.push(StrategyEnum.POINTING_PAIR);
            for (let strategy:number = 0; strategy < StrategyEnum.COUNT; strategy++) {
                if (strategy !== StrategyEnum.AMEND_NOTES && strategy !== StrategyEnum.POINTING_PAIR) {
                    algorithm.push(strategy);
                }
            }
            new Board(TestBoards.POINTING_PAIR, algorithm);
            break;
    }
}

benchmarks(process.argv[2] as benchmarks)