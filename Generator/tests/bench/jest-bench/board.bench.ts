import { benchmarkSuite } from "jest-bench";
import { Board } from "../../../Board";
import { StrategyEnum } from "../../../Sudoku";
import { TestBoards } from "../../testResources";

const setup = () => {
    let singleNakedSingle:Board, onlyNakedSingles:Board, onlyNakedSinglesQuadruplets:Board;
    singleNakedSingle = new Board(TestBoards.SINGLE_NAKED_SINGLE);
    let nakedSingleAlgo:StrategyEnum[] = new Array();
    nakedSingleAlgo.push(StrategyEnum.AMEND_NOTES);
    nakedSingleAlgo.push(StrategyEnum.SIMPLIFY_NOTES);
    nakedSingleAlgo.push(StrategyEnum.NAKED_SINGLE);
    onlyNakedSingles = new Board(TestBoards.ONLY_NAKED_SINGLES, nakedSingleAlgo);
    let algorithm:StrategyEnum[] = new Array();
    algorithm.push(StrategyEnum.AMEND_NOTES);
    algorithm.push(StrategyEnum.SIMPLIFY_NOTES);
    algorithm.push(StrategyEnum.NAKED_QUADRUPLET);
    algorithm.push(StrategyEnum.NAKED_SINGLE);
    onlyNakedSinglesQuadruplets = new Board(TestBoards.ONLY_NAKED_SINGLES, algorithm);
    return { singleNakedSingle: singleNakedSingle, onlyNakedSingles: onlyNakedSingles, onlyNakedSinglesQuadruplets: onlyNakedSinglesQuadruplets };
}

benchmarkSuite("solve Boards", {

    ['should solve single naked single']: () => {
        const { singleNakedSingle } = setup();
        expect(singleNakedSingle.getSolutionString()).toBe(TestBoards.SINGLE_NAKED_SINGLE_SOLUTION);
        for (let i:number = 0; i < StrategyEnum.COUNT; i++) {
            if (i === StrategyEnum.NAKED_SINGLE || i === StrategyEnum.AMEND_NOTES) {
                expect(singleNakedSingle.getStrategies()[i]).toBeTruthy();
            }
            else {
                expect(singleNakedSingle.getStrategies()[i]).toBeFalsy();
            }
        }
    },

    ['should solve naked singles only board']: () => {
        const { onlyNakedSingles } = setup();
        expect(onlyNakedSingles.getSolutionString()).toBe(TestBoards.ONLY_NAKED_SINGLES_SOLUTION);
        let strategies:boolean[] = onlyNakedSingles.getStrategies();
        for (let i:number = 0; i < strategies.length; i++) {
            if (i === StrategyEnum.NAKED_SINGLE || i === StrategyEnum.SIMPLIFY_NOTES || i === StrategyEnum.AMEND_NOTES) {
                expect(strategies[i]).toBeTruthy();
            }
            else {
                expect(strategies[i]).toBeFalsy();
            }
        }
    },

    ['should solve row hidden single']: () => {
        let board:Board = new Board(TestBoards.ROW_HIDDEN_SINGLES);
        let strategies:boolean[] = board.getStrategies();
        expect(board.getSolutionString()).toBe(TestBoards.ROW_HIDDEN_SINGLES_SOLUTION);
        expect(strategies[StrategyEnum.HIDDEN_SINGLE]).toBeTruthy();
    },

    ['should solve row column box hidden singles']: () => {
        let board:Board = new Board(TestBoards.ROW_COLUMN_BOX_HIDDEN_SINGLES);
        let strategies:boolean[] = board.getStrategies();
        expect(board.getSolutionString()).toBe(TestBoards.ROW_COLUMN_BOX_HIDDEN_SINGLES_SOLUTION);
        expect(strategies[StrategyEnum.HIDDEN_SINGLE]).toBeTruthy();
    },

    ['should solve row naked pair']: () => {
        let algorithm:StrategyEnum[] = new Array();
        algorithm.push(StrategyEnum.AMEND_NOTES);
        algorithm.push(StrategyEnum.NAKED_PAIR);
        for (let strategy: number = 0; strategy < StrategyEnum.COUNT; strategy++) {
            if (strategy !== StrategyEnum.NAKED_PAIR && strategy !== StrategyEnum.AMEND_NOTES) {
                algorithm.push(strategy);
            }
        }
        let board:Board = new Board(TestBoards.ROW_NAKED_PAIR, algorithm);
        let strategies:boolean[] = board.getStrategies();
        expect(board.getSolutionString()).toBe(TestBoards.ROW_NAKED_PAIR_SOLUTION);
        expect(strategies[StrategyEnum.NAKED_PAIR]).toBeTruthy();
    },

    ['should solve column naked pair']: () => {
        let board:Board = new Board(TestBoards.COLUMN_NAKED_PAIR);
        let strategies:boolean[] = board.getStrategies();
        expect(board.getSolutionString()).toBe(TestBoards.COLUMN_NAKED_PAIR_SOLUTION);
        expect(strategies[StrategyEnum.NAKED_PAIR]).toBeTruthy();
    },

    ['should solve box naked pair']: () => {
        let board:Board = new Board(TestBoards.BOX_NAKED_PAIR);
        let strategies:boolean[] = board.getStrategies();
        expect(board.getSolutionString()).toBe(TestBoards.BOX_NAKED_PAIR_SOLUTION);
        expect(strategies[StrategyEnum.NAKED_PAIR]).toBeTruthy();
    },

    ['should solve naked triplet']: () => {
        let board:Board = new Board(TestBoards.NAKED_TRIPLET);
        let strategies:boolean[] = board.getStrategies();
        expect(board.getSolutionString()).toBe(TestBoards.NAKED_TRIPLET_SOLUTION);
        expect(strategies[StrategyEnum.NAKED_TRIPLET]).toBeTruthy();
    },

    ['should solve naked quadruplet']: () => {
        const { onlyNakedSinglesQuadruplets } = setup();
        let strategies:boolean[] = onlyNakedSinglesQuadruplets.getStrategies();
        expect(onlyNakedSinglesQuadruplets.getSolutionString()).toBe(TestBoards.ONLY_NAKED_SINGLES_SOLUTION);
        expect(strategies[StrategyEnum.NAKED_QUADRUPLET]).toBeTruthy();
    },

    ['should solve naked quintuplet']: () => {
        let algorithm:StrategyEnum[] = new Array();
        algorithm.push(StrategyEnum.AMEND_NOTES);
        algorithm.push(StrategyEnum.NAKED_QUINTUPLET);
        for (let strategy: number = 0; strategy < StrategyEnum.COUNT; strategy++) {
            if (strategy !== StrategyEnum.NAKED_QUINTUPLET && strategy !== StrategyEnum.AMEND_NOTES) {
                algorithm.push(strategy);
            }
        }
        let board:Board = new Board(TestBoards.ONLY_NAKED_SINGLES, algorithm);
        let strategies:boolean[] = board.getStrategies();
        expect(board.getSolutionString()).toBe(TestBoards.ONLY_NAKED_SINGLES_SOLUTION);
        expect(strategies[StrategyEnum.NAKED_QUINTUPLET]).toBeTruthy();
    },

    ['should solve naked sextuplet']: () => {
        let algorithm:StrategyEnum[] = new Array();
        algorithm.push(StrategyEnum.AMEND_NOTES);
        algorithm.push(StrategyEnum.SIMPLIFY_NOTES);
        algorithm.push(StrategyEnum.NAKED_SEXTUPLET);
        for (let strategy: number = 0; strategy < StrategyEnum.COUNT; strategy++) {
            if (strategy !== StrategyEnum.NAKED_SEXTUPLET && strategy !== StrategyEnum.SIMPLIFY_NOTES && strategy !== StrategyEnum.AMEND_NOTES) {
                algorithm.push(strategy);
            }
        }
        let board:Board = new Board(TestBoards.ONLY_NAKED_SINGLES, algorithm);
        let strategies:boolean[] = board.getStrategies();
        expect(board.getSolutionString()).toBe(TestBoards.ONLY_NAKED_SINGLES_SOLUTION);
        expect(strategies[StrategyEnum.NAKED_SEXTUPLET]).toBeTruthy();
    },

    ['should solve naked septuplet']: () => {
        let algorithm:StrategyEnum[] = new Array();
        algorithm.push(StrategyEnum.AMEND_NOTES);
        algorithm.push(StrategyEnum.SIMPLIFY_NOTES);
        algorithm.push(StrategyEnum.NAKED_SEPTUPLET);
        for (let strategy: number = 0; strategy < StrategyEnum.COUNT; strategy++) {
            if (strategy !== StrategyEnum.NAKED_SEPTUPLET && strategy !== StrategyEnum.SIMPLIFY_NOTES && strategy !== StrategyEnum.AMEND_NOTES) {
                algorithm.push(strategy);
            }
        }
        let board:Board = new Board(TestBoards.COLUMN_NAKED_PAIR, algorithm);
        let strategies:boolean[] = board.getStrategies();
        expect(board.getSolutionString()).toBe(TestBoards.COLUMN_NAKED_PAIR_SOLUTION);
        expect(strategies[StrategyEnum.NAKED_SEPTUPLET]).toBeTruthy();
    },

    ['should solve naked octuplet']: () => {
        let algorithm:StrategyEnum[] = new Array();
        algorithm.push(StrategyEnum.AMEND_NOTES);
        algorithm.push(StrategyEnum.SIMPLIFY_NOTES);
        algorithm.push(StrategyEnum.NAKED_OCTUPLET);
        for (let strategy: number = 0; strategy < StrategyEnum.COUNT; strategy++) {
            if (strategy !== StrategyEnum.NAKED_OCTUPLET && strategy !== StrategyEnum.SIMPLIFY_NOTES && strategy !== StrategyEnum.AMEND_NOTES) {
                algorithm.push(strategy);
            }
        }
        let board:Board = new Board(TestBoards.NAKED_OCTUPLET, algorithm);
        let strategies:boolean[] = board.getStrategies();
        expect(board.getSolutionString()).toBe(TestBoards.NAKED_OCTUPLET_SOLUTION);
        expect(strategies[StrategyEnum.NAKED_OCTUPLET]).toBeTruthy();
    },

    ['should solve pointing pair']: () => {
        let algorithm:StrategyEnum[] = new Array();
        algorithm.push(StrategyEnum.AMEND_NOTES);
        algorithm.push(StrategyEnum.POINTING_PAIR);
        for (let strategy:number = 0; strategy < StrategyEnum.COUNT; strategy++) {
            if (strategy !== StrategyEnum.AMEND_NOTES && strategy !== StrategyEnum.POINTING_PAIR) {
                algorithm.push(strategy);
            }
        }
        let board:Board = new Board(TestBoards.POINTING_PAIR, algorithm);
        let stategies:boolean[] = board.getStrategies();
        expect(stategies[StrategyEnum.POINTING_PAIR]).toBeTruthy();
    },
}, 200000);