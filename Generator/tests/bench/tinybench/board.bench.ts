import { Bench } from 'tinybench';

const bench = new Bench({ time: 100 });
import { Board } from '../../../Board';
import { StrategyEnum } from '../../../Sudoku';
import { TestBoards } from '../../testResources';

bench
    .add('should solve single naked single', () => {
        new Board(TestBoards.SINGLE_NAKED_SINGLE);
    })
    .add('should solve naked singles only board', () => {
        let nakedSingleAlgo:StrategyEnum[] = new Array();
        nakedSingleAlgo.push(StrategyEnum.AMEND_NOTES);
        nakedSingleAlgo.push(StrategyEnum.SIMPLIFY_NOTES);
        nakedSingleAlgo.push(StrategyEnum.NAKED_SINGLE);
        new Board(TestBoards.ONLY_NAKED_SINGLES, nakedSingleAlgo);
    })
    .add('should solve row hidden single', () => {
        new Board(TestBoards.ROW_HIDDEN_SINGLES);
    })
    .add('should solve row column box hidden singles', () => {
        new Board(TestBoards.ROW_COLUMN_BOX_HIDDEN_SINGLES);
    })
    .add('should solve row naked pair', () => {
        let algorithm:StrategyEnum[] = new Array();
        algorithm.push(StrategyEnum.AMEND_NOTES);
        algorithm.push(StrategyEnum.NAKED_PAIR);
        for (let strategy: number = 0; strategy < StrategyEnum.COUNT; strategy++) {
            if (strategy !== StrategyEnum.NAKED_PAIR && strategy !== StrategyEnum.AMEND_NOTES) {
                algorithm.push(strategy);
            }
        }
        new Board(TestBoards.ROW_NAKED_PAIR, algorithm);
    })
    .add('should solve column naked pair', () => {
        new Board(TestBoards.COLUMN_NAKED_PAIR);
    })
    .add('should solve box naked pair', () => {
        new Board(TestBoards.BOX_NAKED_PAIR);
    })
    .add('should solve naked triplet', () => {
        new Board(TestBoards.NAKED_TRIPLET);
    })
    .add('should solve naked quadruplet', () => {
        let algorithm:StrategyEnum[] = new Array();
        algorithm.push(StrategyEnum.AMEND_NOTES);
        algorithm.push(StrategyEnum.SIMPLIFY_NOTES);
        algorithm.push(StrategyEnum.NAKED_QUADRUPLET);
        algorithm.push(StrategyEnum.NAKED_SINGLE);
        new Board(TestBoards.ONLY_NAKED_SINGLES, algorithm);
    })
    .add('should solve naked quintuplet', () => {
        let algorithm:StrategyEnum[] = new Array();
        algorithm.push(StrategyEnum.AMEND_NOTES);
        algorithm.push(StrategyEnum.NAKED_QUINTUPLET);
        for (let strategy: number = 0; strategy < StrategyEnum.COUNT; strategy++) {
            if (strategy !== StrategyEnum.NAKED_QUINTUPLET && strategy !== StrategyEnum.AMEND_NOTES) {
                algorithm.push(strategy);
            }
        }
        new Board(TestBoards.ONLY_NAKED_SINGLES, algorithm);
    })
    .add('should solve naked sextuplet', () => {
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
    })
    .add('should solve naked septuplet', () => {
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
    })
    .add('should solve naked octuplet', () => {
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
    })
    .add('should solve pointing pair', () => {
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

await bench.warmup();
await bench.run();

console.table(bench.table());