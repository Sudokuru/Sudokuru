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

enum DuplicateColumnValues {
    DUPLICATE_THREE_IN_FIRST_COLUMN = "310084002200150006570003010423708095760030000009562030350006070007000900000001500",
    DUPLICATE_ONE_IN_SECOND_COLUMN = "310084002200150006570003010423708095760030000019562030050006070007000900000001500",
    DUPLICATE_NINE_IN_THIRD_COLUMN = "310084002200150006570003010423708095760030000009562030050006070007000900009001500",
    DUPLICATE_SEVEN_IN_FORTH_COLUMN = "310784002200150006570003010423708095760030000009562030050006070007000900000001500",
    DUPLICATE_SIX_IN_FIFTH_COLUMN = "310084002200150006570063010423708095760030000009562030050006070007000900000001500",
    DUPLICATE_ONE_IN_SIXTH_COLUMN = "310084002200150006570003010423708095760030000009562030050006070007001900000001500",
    DUPLICATE_NINE_IN_SEVENTH_COLUMN = "310084002200150906570003010423708095760030000009562030050006070007000900000001500",
    DUPLICATE_SEVEN_IN_EIGHTH_COLUMN = "310084002200150006570003010423708095060030070009562030050006070007000900000001500",
    DUPLICATE_VALUE_IN_NINTH_COLUMN = "310084002200150006570003010423708095760030000009562030050006070007000902000001500"
}

enum DuplicateRowValues {
    DUPLICATE_THREE_IN_FIRST_ROW = "310384002200150006570003010423708095760030000009562030050006070007000900000001500",
    DUPLICATE_TWO_IN_SECOND_ROW = "310084002202150006570003010423708095760030000009562030050006070007000900000001500",
    DUPLICATE_SEVEN_IN_THIRD_ROW = "310084002200150006570073010423708095760030000009562030050006070007000900000001500",
    DUPLICATE_SIX_IN_FORTH_ROW = "310084002200150006570003010423768095760030000009502330050006070007000900000001500",
    DUPLICATE_THREE_IN_FIFTH_ROW = "310084002200150006570003010423708095760030300009562030050006070007000900000001500",
    DUPLICATE_TWO_IN_SIXTH_ROW = "310084002000150006570003010423708095760030000009562230050006070007000900000001500",
    DUPLICATE_SIX_IN_SEVENTH_ROW = "310084002200150006570003010423708095760030000009562030050606070007000900000001500",
    DUPLICATE_VALUE_IN_EIGHTH_ROW = "310084002200150006570003010423708095760030000009562030050006070007000909000001500",
    DUPLICATE_VALUE_IN_NINTH_ROW = "310084002200150006570003010423708095760030000009562030050006070007000900000001550"
}

enum DuplicateBoxValues {
    DUPLICATE_VALUE_IN_FIRST_BOX = "",
    DUPLICATE_VALUE_IN_SECOND_BOX = "",
    DUPLICATE_VALUE_IN_THIRD_BOX = "",
    DUPLICATE_VALUE_IN_FORTH_BOX = "",
    DUPLICATE_VALUE_IN_FIFTH_BOX = "",
    DUPLICATE_VALUE_IN_SIXTH_BOX = "",
    DUPLICATE_VALUE_IN_SEVENTH_BOX = "",
    DUPLICATE_VALUE_IN_EIGHTH_BOX = "",
    DUPLICATE_VALUE_IN_NINTH_BOX = ""
}

// How to iterate over enums:
// https://bobbyhadz.com/blog/typescript-iterate-enum#:~:text=To%20iterate%20over%20enums%3A%201%20Use%20the%20Object.keys,forEach%20%28%29%20method%20to%20iterate%20over%20the%20array.

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

    it('should throw duplicate value in column error', async () => {
        const values:string[] = Object.values(DuplicateColumnValues);
        for (let i = 0; i < values.length; i ++){
            const error = await getError(async () => new Board(values[i]));
            expect(error).toBeInstanceOf(CustomError);
            expect(error).toHaveProperty('Error_Message', CustomErrorEnum.DUPLICATE_VALUE_IN_COLUMN);
        }
    });

    it('should throw duplicate value in row error', async () => {
        const values:string[] = Object.values(DuplicateRowValues);
        for (let i = 0; i < values.length; i ++){
            const error = await getError(async () => new Board(values[i]));
            expect(error).toBeInstanceOf(CustomError);
            expect(error).toHaveProperty('Error_Message', CustomErrorEnum.DUPLICATE_VALUE_IN_ROW);
        }
    });

    // it('should throw duplicate value in box error', async () => {
    //     const values:string[] = Object.keys(DuplicateBoxValues).filter((v) => !isNaN(Number(v)));
    //     for (let i = 0; i < values.length; i ++){
    //         const error = await getError(async () => new Board(values[i]));
    //         expect(error).toBeInstanceOf(CustomError);
    //         expect(error).toHaveProperty('Error_Message', CustomErrorEnum.DUPLICATE_VALUE_IN_BOX);
    //     }
    // });
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