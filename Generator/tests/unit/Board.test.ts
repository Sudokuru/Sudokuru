import {Board} from '../../Board';
import { CustomError, CustomErrorEnum } from '../../CustomError';
import { StrategyEnum } from '../../Sudoku';
import { getError } from '../testResources';

enum TestBoards {
    SINGLE_NAKED_SINGLE = "439275618051896437876143592342687951185329746697451283928734165563912874714568329",
    SINGLE_NAKED_SINGLE_SOLUTION = "439275618251896437876143592342687951185329746697451283928734165563912874714568329",
    ONLY_NAKED_SINGLES = "310084002200150006570003010423708095760030000009562030050006070007000900000001500",
    ONLY_NAKED_SINGLES_SOLUTION = "316984752298157346574623819423718695765439128189562437851396274637245981942871563",
    ROW_HIDDEN_SINGLES = "603002001500000020901730006810400090060000000000690040350000004002070005000500108",
    ROW_HIDDEN_SINGLES_SOLUTION = "683942751574816329921735486817453692469287513235691847358169274142378965796524138",
    ROW_COLUMN_BOX_HIDDEN_SINGLES = "902100860075000001001080000600300048054809600108060900500401000000050002089000050",
    ROW_COLUMN_BOX_HIDDEN_SINGLES_SOLUTION = "942137865875946231361285479697312548254879613138564927523491786416758392789623154",
    ROW_NAKED_PAIR = "249871000387625419165493827936584271718362900452917386870206190520109008691748502",
    ROW_NAKED_PAIR_SOLUTION = "249871653387625419165493827936584271718362945452917386873256194524139768691748532",
    COLUMN_NAKED_PAIR = "030000506000098071000000490009800000002010000380400609800030960100000004560982030",
    COLUMN_NAKED_PAIR_SOLUTION = "938741526456298371271365498619853742742619853385427619827134965193576284564982137",
    BOX_NAKED_PAIR = "700000006000320900000000054205060070197400560060000000010000000000095401630100020",
    BOX_NAKED_PAIR_SOLUTION = "783549216451326987926817354245961873197438562368752149514273698872695431639184725",
    NAKED_TRIPLET = "070408029002000004854020007008374200020000000003261700000093612200000403130642070",
    NAKED_TRIPLET_SOLUTION = "671438529392715864854926137518374296726859341943261785487593612269187453135642978",
    NAKED_OCTUPLET = "390000500000050832008316970080030000639702010007000009070045098000690040000000000",
    NAKED_OCTUPLET_SOLUTION = "394827561761459832528316974485931726639782415217564389173245698852693147946178253"
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
    DUPLICATE_THREE_IN_FIRST_BOX = "310084002230150006570003010423708095760030000009562030050006070007000900000001500",
    DUPLICATE_FIVE_IN_SECOND_BOX = "310584002200150006570003010423708095760030000009062030050006070007000900000001500",
    DUPLICATE_TWO_IN_THIRD_BOX = "310084002200150006570003210423708095760030000009562030050006070007000900000001500",
    DUPLICATE_FOUR_IN_FORTH_BOX = "310084002200150006570003010423708095764030000009562030050006070007000900000001500",
    DUPLICATE_FIVE_IN_FIFTH_BOX = "310084002200150006570003010423708095760035000009562030050006070007000900000001500",
    DUPLICATE_NINE_IN_SIXTH_BOX = "310084002200150006570003010423708095760030009009562030050006070007000900000001500",
    DUPLICATE_ONE_IN_SEVENTH_BOX = "310084002200150006570003010423708095760030000009562030051006070107000900000001500",
    DUPLICATE_SIX_IN_EIGHTH_BOX = "310084002200150006570003010423708095760030000009562030050006070007600900000001500",
    DUPLICATE_NINE_IN_NINTH_BOX = "310084002200150006570003010423708095760030000009562030050006079007000900000001500"
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

    it('should throw duplicate value in box error', async () => {
        const values:string[] = Object.values(DuplicateBoxValues);
        for (let i = 0; i < values.length; i ++){
            const error = await getError(async () => new Board(values[i]));
            expect(error).toBeInstanceOf(CustomError);
            expect(error).toHaveProperty('Error_Message', CustomErrorEnum.DUPLICATE_VALUE_IN_BOX);
        }
    });
});

let singleNakedSingle:Board, onlyNakedSingles:Board, onlyNakedSinglesQuadruplets:Board;

describe("solve Boards", () => {
    beforeAll(() => {
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
    });

    it('should solve single naked single', () => {
        expect(singleNakedSingle.getSolutionString()).toBe(TestBoards.SINGLE_NAKED_SINGLE_SOLUTION);
        let drills:boolean[] = singleNakedSingle.getDrills();
        for (let i:StrategyEnum = (StrategyEnum.INVALID + 1); i < StrategyEnum.COUNT; i++) {
            if (i === StrategyEnum.NAKED_SINGLE || i === StrategyEnum.SIMPLIFY_NOTES) {
                expect(drills[i]).toBeTruthy();
            }
            else {
                expect(drills[i]).toBeFalsy();
            }
        }
        for (let i:number = 0; i < StrategyEnum.COUNT; i++) {
            if (i === StrategyEnum.NAKED_SINGLE || i === StrategyEnum.AMEND_NOTES) {
                expect(singleNakedSingle.getStrategies()[i]).toBeTruthy();
            }
            else {
                expect(singleNakedSingle.getStrategies()[i]).toBeFalsy();
            }
        }
    });

    it('should solve naked singles only board', () => {
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
        let drills:boolean[] = onlyNakedSingles.getDrills();
        for (let i:StrategyEnum = (StrategyEnum.INVALID + 1); i < StrategyEnum.COUNT; i++) {
            if (i === StrategyEnum.HIDDEN_SINGLE || i === StrategyEnum.NAKED_SEXTUPLET || i === StrategyEnum.SIMPLIFY_NOTES) {
                expect(drills[i]).toBeTruthy();
            }
            else {
                expect(drills[i]).toBeFalsy();
            }
        }
    });

    it('should give higher difficulty rating to board with multiple naked singles than one with only one', () => {
        expect(onlyNakedSingles.getDifficulty()).toBeGreaterThan(singleNakedSingle.getDifficulty());
    });

    it ('should solve row hidden single', () => {
        let board:Board = new Board(TestBoards.ROW_HIDDEN_SINGLES);
        let strategies:boolean[] = board.getStrategies();
        expect(board.getSolutionString()).toBe(TestBoards.ROW_HIDDEN_SINGLES_SOLUTION);
        expect(strategies[StrategyEnum.HIDDEN_SINGLE]).toBeTruthy();
    });

    it ('should solve row column box hidden singles', () => {
        let board:Board = new Board(TestBoards.ROW_COLUMN_BOX_HIDDEN_SINGLES);
        let strategies:boolean[] = board.getStrategies();
        expect(board.getSolutionString()).toBe(TestBoards.ROW_COLUMN_BOX_HIDDEN_SINGLES_SOLUTION);
        expect(strategies[StrategyEnum.HIDDEN_SINGLE]).toBeTruthy();
    });

    it('should solve row naked pair', () => {
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
    });

    it('should solve column naked pair', () => {
        let board:Board = new Board(TestBoards.COLUMN_NAKED_PAIR);
        let strategies:boolean[] = board.getStrategies();
        expect(board.getSolutionString()).toBe(TestBoards.COLUMN_NAKED_PAIR_SOLUTION);
        expect(strategies[StrategyEnum.NAKED_PAIR]).toBeTruthy();
    });

    it('should solve box naked pair', () => {
        let board:Board = new Board(TestBoards.BOX_NAKED_PAIR);
        let strategies:boolean[] = board.getStrategies();
        expect(board.getSolutionString()).toBe(TestBoards.BOX_NAKED_PAIR_SOLUTION);
        expect(strategies[StrategyEnum.NAKED_PAIR]).toBeTruthy();
    });

    it('should solve naked triplet', () => {
        let board:Board = new Board(TestBoards.NAKED_TRIPLET);
        let strategies:boolean[] = board.getStrategies();
        expect(board.getSolutionString()).toBe(TestBoards.NAKED_TRIPLET_SOLUTION);
        expect(strategies[StrategyEnum.NAKED_TRIPLET]).toBeTruthy();
    });

    it('should solve naked quadruplet', () => {
        let strategies:boolean[] = onlyNakedSinglesQuadruplets.getStrategies();
        expect(onlyNakedSinglesQuadruplets.getSolutionString()).toBe(TestBoards.ONLY_NAKED_SINGLES_SOLUTION);
        expect(strategies[StrategyEnum.NAKED_QUADRUPLET]).toBeTruthy();
    });

    it('should give a higher difficulty score to solving same board with naked quadruplets than singles', () => {
        expect(onlyNakedSinglesQuadruplets.getDifficulty()).toBeGreaterThan(onlyNakedSingles.getDifficulty());
    });

    it('should solve naked quintuplet', () => {
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
    });

    it('should solve naked sextuplet', () => {
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
    });

    it('should solve naked septuplet', () => {
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
    });

    it('should solve naked octuplet', () => {
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
    });
});