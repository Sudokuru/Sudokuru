import {Board} from '../../Board';
import { CustomError, CustomErrorEnum } from '../../CustomError';
import { getError } from '../testResources';

enum TestBoards {
    SINGLE_NAKED_SINGLE = "439275618051896437876143592342687951185329746697451283928734165563912874714568329",
    SINGLE_NAKED_SINGLE_SOLUTION = "439275618251896437876143592342687951185329746697451283928734165563912874714568329",
    ONLY_NAKED_SINGLES = "310084002200150006570003010423708095760030000009562030050006070007000900000001500",
    ONLY_NAKED_SINGLES_SOLUTION = "316984752298157346574623819423718695765439128189562437851396274637245981942871563",
    ROW_HIDDEN_SINGLES = "603002001500000020901730006810400090060000000000690040350000004002070005000500108",
    ROW_HIDDEN_SINGLES_SOLUTION = "683942751574816329921735486817453692469287513235691847358169274142378965796524138"
}

enum InvalidTestBoards {
    DUPLICATE_VALUE_IN_COLUMN = "310084002300150006570003010423708095760030000009562030050006070007000900000001500",
    DUPLICATE_VALUE_IN_ROW = "330084002200150006570003010423708095760030000009562030050006070007000900000001500",
    DUPLICATE_VALUE_IN_BOX = "310084002200150006570803010423708095760030000009562030050006070007000900000001500",
}

describe("create Board objects", () => {
    it('should throw invalid board length error', async () => {
        const error = await getError(async () => new Board(TestBoards.SINGLE_NAKED_SINGLE + "0"));
        expect(error).toBeInstanceOf(CustomError);
        expect(error).toHaveProperty('Error_Message', CustomErrorEnum.INVALID_BOARD_LENGTH);
    });

    it('should throw invalid board character error', async () => {
        const error = await getError(async () => new Board("a" + TestBoards.SINGLE_NAKED_SINGLE.substring(1)));
        expect(error).toBeInstanceOf(CustomError);
        expect(error).toHaveProperty('Error_Message', CustomErrorEnum.INVALID_BOARD_CHARACTERS);
    });

    it('should throw board already solved error', async () => {
        const error = await getError(async () => new Board(TestBoards.SINGLE_NAKED_SINGLE_SOLUTION));
        expect(error).toBeInstanceOf(CustomError);
        expect(error).toHaveProperty('Error_Message', CustomErrorEnum.BOARD_ALREADY_SOLVED);
    });

    it('should throw duplicate value in row error', async () => {
        const error = await getError(async () => new Board(InvalidTestBoards.DUPLICATE_VALUE_IN_COLUMN));
        expect(error).toBeInstanceOf(CustomError);
        expect(error).toHaveProperty('Error_Message', CustomErrorEnum.DUPLICATE_VALUE_IN_COLUMN);
    });

    it('should throw duplicate value in row error', async () => {
        const error = await getError(async () => new Board(InvalidTestBoards.DUPLICATE_VALUE_IN_ROW));
        expect(error).toBeInstanceOf(CustomError);
        expect(error).toHaveProperty('Error_Message', CustomErrorEnum.DUPLICATE_VALUE_IN_ROW);
    });

    it('should throw duplicate value in box error', async () => {
        const error = await getError(async () => new Board(InvalidTestBoards.DUPLICATE_VALUE_IN_BOX));
        expect(error).toBeInstanceOf(CustomError);
        expect(error).toHaveProperty('Error_Message', CustomErrorEnum.DUPLICATE_VALUE_IN_BOX);
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

    it ('should solve row hidden single', () => {
        let board:Board = new Board(TestBoards.ROW_HIDDEN_SINGLES);
        expect(board.getSolutionString()).toBe(TestBoards.ROW_HIDDEN_SINGLES_SOLUTION);
        expect(board.getStrategyScore()).toBe(1);
    });
});