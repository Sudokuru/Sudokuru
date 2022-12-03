import {Board} from '../../Board';
import { CustomError, CustomErrorEnum } from '../../CustomError';

enum TestBoards {
    SINGLE_NAKED_SINGLE = "439275618051896437876143592342687951185329746697451283928734165563912874714568329",
    SINGLE_NAKED_SINGLE_SOLUTION = "439275618251896437876143592342687951185329746697451283928734165563912874714568329",
    ONLY_NAKED_SINGLES = "310084002200150006570003010423708095760030000009562030050006070007000900000001500",
    ONLY_NAKED_SINGLES_SOLUTION = "316984752298157346574623819423718695765439128189562437851396274637245981942871563"
}

describe("create Board objects", () => {
    it('should throw invalid board length error', () => {
        try {
            let obj:Board = new Board(TestBoards.SINGLE_NAKED_SINGLE + "0");
        } catch (err) {
            expect(err).toBeInstanceOf(CustomError);
            expect(err).toHaveProperty('Error_Message', CustomErrorEnum.INVALID_BOARD_LENGTH);
        }
    });

    it('should throw invalid board character error', () => {
        try {
            let obj:Board = new Board("a" + TestBoards.SINGLE_NAKED_SINGLE.substring(1));
        } catch (err) {
            expect(err).toBeInstanceOf(CustomError);
            expect(err).toHaveProperty('Error_Message', CustomErrorEnum.INVALID_BOARD_CHARACTERS);
        }
    });

    it('should throw board already solved error', () => {
        try {
            let obj:Board = new Board(TestBoards.SINGLE_NAKED_SINGLE_SOLUTION);
        } catch (err) {
            expect(err).toBeInstanceOf(CustomError);
            expect(err).toHaveProperty('Error_Message', CustomErrorEnum.BOARD_ALREADY_SOLVED);
        }
    });
});

describe("solve Boards", () => {
    it('should solve single naked single', () => {
        let board:Board = new Board(TestBoards.SINGLE_NAKED_SINGLE);
        expect(board.getSolutionString()).toBe(TestBoards.SINGLE_NAKED_SINGLE_SOLUTION);
        expect(board.getStrategyScore()).toBe(0);
    });

    it('should solve naked singles only board', () => {
        let board:Board = new Board(TestBoards.ONLY_NAKED_SINGLES);
        expect(board.getSolutionString()).toBe(TestBoards.ONLY_NAKED_SINGLES_SOLUTION);
        expect(board.getStrategyScore()).toBe(0);
    });
});