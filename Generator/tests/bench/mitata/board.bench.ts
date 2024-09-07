import { run, bench, group, baseline } from 'mitata';
import { Board } from '../../../Board';
import { StrategyEnum } from '../../../Sudoku';
import { TestBoards } from '../../testResources';

group({name: "solve Boards"}, () => {

    bench('should solve single naked single', () => {
        new Board(TestBoards.SINGLE_NAKED_SINGLE);
    });

    bench('should solve naked singles only board', () => {
        let nakedSingleAlgo:StrategyEnum[] = new Array();
        nakedSingleAlgo.push(StrategyEnum.AMEND_NOTES);
        nakedSingleAlgo.push(StrategyEnum.SIMPLIFY_NOTES);
        nakedSingleAlgo.push(StrategyEnum.NAKED_SINGLE);
        new Board(TestBoards.ONLY_NAKED_SINGLES, nakedSingleAlgo);
    });

    bench('should solve row hidden single', () => {
        new Board(TestBoards.ROW_HIDDEN_SINGLES);
    });

    bench('should solve row column box hidden singles', () => {
        new Board(TestBoards.ROW_COLUMN_BOX_HIDDEN_SINGLES);
    });

    bench('should solve row naked pair', () => {
        let algorithm:StrategyEnum[] = new Array();
        algorithm.push(StrategyEnum.AMEND_NOTES);
        algorithm.push(StrategyEnum.NAKED_PAIR);
        for (let strategy: number = 0; strategy < StrategyEnum.COUNT; strategy++) {
            if (strategy !== StrategyEnum.NAKED_PAIR && strategy !== StrategyEnum.AMEND_NOTES) {
                algorithm.push(strategy);
            }
        }
        new Board(TestBoards.ROW_NAKED_PAIR, algorithm);
    });

    bench('should solve column naked pair', () => {
        new Board(TestBoards.COLUMN_NAKED_PAIR);
    });

    bench('should solve box naked pair', () => {
        new Board(TestBoards.BOX_NAKED_PAIR);
    });

    bench('should solve naked triplet', () => {
        new Board(TestBoards.NAKED_TRIPLET);
    });

    bench('should solve naked quadruplet', () => {
        let algorithm:StrategyEnum[] = new Array();
        algorithm.push(StrategyEnum.AMEND_NOTES);
        algorithm.push(StrategyEnum.SIMPLIFY_NOTES);
        algorithm.push(StrategyEnum.NAKED_QUADRUPLET);
        algorithm.push(StrategyEnum.NAKED_SINGLE);
        new Board(TestBoards.ONLY_NAKED_SINGLES, algorithm);
    });

    bench('should solve naked quintuplet', () => {
        let algorithm:StrategyEnum[] = new Array();
        algorithm.push(StrategyEnum.AMEND_NOTES);
        algorithm.push(StrategyEnum.NAKED_QUINTUPLET);
        for (let strategy: number = 0; strategy < StrategyEnum.COUNT; strategy++) {
            if (strategy !== StrategyEnum.NAKED_QUINTUPLET && strategy !== StrategyEnum.AMEND_NOTES) {
                algorithm.push(strategy);
            }
        }
        new Board(TestBoards.ONLY_NAKED_SINGLES, algorithm);
    });

    bench('should solve naked sextuplet', () => {
        let algorithm:StrategyEnum[] = new Array();
        algorithm.push(StrategyEnum.AMEND_NOTES);
        algorithm.push(StrategyEnum.SIMPLIFY_NOTES);
        algorithm.push(StrategyEnum.NAKED_SEXTUPLET);
        for (let strategy: number = 0; strategy < StrategyEnum.COUNT; strategy++) {
            if (strategy !== StrategyEnum.NAKED_SEXTUPLET && strategy !== StrategyEnum.SIMPLIFY_NOTES && strategy !== StrategyEnum.AMEND_NOTES) {
                algorithm.push(strategy);
            }
        }
        new Board(TestBoards.ONLY_NAKED_SINGLES, algorithm);
    });

    bench('should solve naked septuplet', () => {
        let algorithm:StrategyEnum[] = new Array();
        algorithm.push(StrategyEnum.AMEND_NOTES);
        algorithm.push(StrategyEnum.SIMPLIFY_NOTES);
        algorithm.push(StrategyEnum.NAKED_SEPTUPLET);
        for (let strategy: number = 0; strategy < StrategyEnum.COUNT; strategy++) {
            if (strategy !== StrategyEnum.NAKED_SEPTUPLET && strategy !== StrategyEnum.SIMPLIFY_NOTES && strategy !== StrategyEnum.AMEND_NOTES) {
                algorithm.push(strategy);
            }
        }
        new Board(TestBoards.COLUMN_NAKED_PAIR, algorithm);
    });

    bench('should solve naked octuplet', () => {
        let algorithm:StrategyEnum[] = new Array();
        algorithm.push(StrategyEnum.AMEND_NOTES);
        algorithm.push(StrategyEnum.SIMPLIFY_NOTES);
        algorithm.push(StrategyEnum.NAKED_OCTUPLET);
        for (let strategy: number = 0; strategy < StrategyEnum.COUNT; strategy++) {
            if (strategy !== StrategyEnum.NAKED_OCTUPLET && strategy !== StrategyEnum.SIMPLIFY_NOTES && strategy !== StrategyEnum.AMEND_NOTES) {
                algorithm.push(strategy);
            }
        }
        new Board(TestBoards.NAKED_OCTUPLET, algorithm);
    });

    bench('should solve pointing pair', () => {
        let algorithm:StrategyEnum[] = new Array();
        algorithm.push(StrategyEnum.AMEND_NOTES);
        algorithm.push(StrategyEnum.POINTING_PAIR);
        for (let strategy:number = 0; strategy < StrategyEnum.COUNT; strategy++) {
            if (strategy !== StrategyEnum.AMEND_NOTES && strategy !== StrategyEnum.POINTING_PAIR) {
                algorithm.push(strategy);
            }
        }
        new Board(TestBoards.POINTING_PAIR, algorithm);
    });
});

await run();