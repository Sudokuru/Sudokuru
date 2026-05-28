import {Board} from '../../Board';
import { CustomError, CustomErrorEnum } from '../../CustomError';
import { StrategyEnum } from '../../Sudoku';
import { getError } from '../testResources';
import { TestBoards } from '../testResources';
import { DIFFICULTY_TEST_BOARD_STRINGS } from '../../../V4/tests/utils/difficultyBoards';

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

let difficultyBoards:string[] = DIFFICULTY_TEST_BOARD_STRINGS;

// How to iterate over enums:
// https://bobbyhadz.com/blog/typescript-iterate-enum#:~:text=To%20iterate%20over%20enums%3A%201%20Use%20the%20Object.keys,forEach%20%28%29%20method%20to%20iterate%20over%20the%20array.

describe("create Board objects", () => {
    it('should throw invalid board length error', async () => {
        const error = await getError(async () => new Board(TestBoards.SINGLE_OBVIOUS_SINGLE + "0"));
        expect(error).toBeInstanceOf(CustomError);
        expect(error).toHaveProperty('Error_Message', CustomErrorEnum.INVALID_BOARD_LENGTH);
    });

    it('should throw invalid board character error', async () => {
        const error = await getError(async () => new Board("a" + TestBoards.SINGLE_OBVIOUS_SINGLE.substring(1)));
        expect(error).toBeInstanceOf(CustomError);
        expect(error).toHaveProperty('Error_Message', CustomErrorEnum.INVALID_BOARD_CHARACTERS);
    });

    it('should throw board already solved error', async () => {
        const error = await getError(async () => new Board(TestBoards.SINGLE_OBVIOUS_SINGLE_SOLUTION));
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

    it('should throw multiple solutions error', async () => {
        const error = await getError(async () => new Board(TestBoards.MULTIPLE_SOLUTIONS));
        expect(error).toBeInstanceOf(CustomError);
        expect(error).toHaveProperty('Error_Message', CustomErrorEnum.MULTIPLE_SOLUTIONS);
    });
});

let singleObviousSingle:Board, onlyObviousSingles:Board, onlyObviousSinglesQuadruplets:Board;

describe("solve Boards", () => {
    beforeAll(() => {
        singleObviousSingle = new Board(TestBoards.SINGLE_OBVIOUS_SINGLE);
        let obviousSingleAlgo:StrategyEnum[] = new Array();
        obviousSingleAlgo.push(StrategyEnum.AMEND_NOTES);
        obviousSingleAlgo.push(StrategyEnum.SIMPLIFY_NOTES);
        obviousSingleAlgo.push(StrategyEnum.OBVIOUS_SINGLE);
        onlyObviousSingles = new Board(TestBoards.ONLY_OBVIOUS_SINGLES, obviousSingleAlgo);
        let algorithm:StrategyEnum[] = new Array();
        algorithm.push(StrategyEnum.AMEND_NOTES);
        algorithm.push(StrategyEnum.SIMPLIFY_NOTES);
        algorithm.push(StrategyEnum.OBVIOUS_QUADRUPLET);
        algorithm.push(StrategyEnum.OBVIOUS_SINGLE);
        onlyObviousSinglesQuadruplets = new Board(TestBoards.ONLY_OBVIOUS_SINGLES, algorithm);
    });

    it('should solve single obvious single', () => {
        expect(singleObviousSingle.getSolutionString()).toBe(TestBoards.SINGLE_OBVIOUS_SINGLE_SOLUTION);
        for (let i:number = 0; i < StrategyEnum.COUNT; i++) {
            if (i === StrategyEnum.OBVIOUS_SINGLE || i === StrategyEnum.AMEND_NOTES) {
                expect(singleObviousSingle.getStrategies()[i]).toBeTruthy();
            }
            else {
                expect(singleObviousSingle.getStrategies()[i]).toBeFalsy();
            }
        }
    });

    it('should solve obvious singles only board', () => {
        expect(onlyObviousSingles.getSolutionString()).toBe(TestBoards.ONLY_OBVIOUS_SINGLES_SOLUTION);
        let strategies:boolean[] = onlyObviousSingles.getStrategies();
        for (let i:number = 0; i < strategies.length; i++) {
            if (i === StrategyEnum.OBVIOUS_SINGLE || i === StrategyEnum.SIMPLIFY_NOTES || i === StrategyEnum.AMEND_NOTES) {
                expect(strategies[i]).toBeTruthy();
            }
            else {
                expect(strategies[i]).toBeFalsy();
            }
        }
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

    it('should solve row obvious pair', () => {
        let algorithm:StrategyEnum[] = new Array();
        algorithm.push(StrategyEnum.AMEND_NOTES);
        algorithm.push(StrategyEnum.OBVIOUS_PAIR);
        for (let strategy: number = 0; strategy < StrategyEnum.COUNT; strategy++) {
            if (strategy !== StrategyEnum.OBVIOUS_PAIR && strategy !== StrategyEnum.AMEND_NOTES) {
                algorithm.push(strategy);
            }
        }
        let board:Board = new Board(TestBoards.ROW_OBVIOUS_SOLUTION, algorithm);
        let strategies:boolean[] = board.getStrategies();
        expect(board.getSolutionString()).toBe(TestBoards.ROW_OBVIOUS_PAIR_SOLUTION);
        expect(strategies[StrategyEnum.OBVIOUS_PAIR]).toBeTruthy();
    });

    it('should solve column obvious pair', () => {
        let board:Board = new Board(TestBoards.COLUMN_OBVIOUS_PAIR);
        let strategies:boolean[] = board.getStrategies();
        expect(board.getSolutionString()).toBe(TestBoards.COLUMN_OBVIOUS_PAIR_SOLUTION);
        expect(strategies[StrategyEnum.OBVIOUS_PAIR]).toBeTruthy();
    });

    it('should solve box obvious pair', () => {
        let board:Board = new Board(TestBoards.BOX_OBVIOUS_PAIR);
        let strategies:boolean[] = board.getStrategies();
        expect(board.getSolutionString()).toBe(TestBoards.BOX_OBVIOUS_PAIR_SOLUTION);
        expect(strategies[StrategyEnum.OBVIOUS_PAIR]).toBeTruthy();
    });

    it('should solve obvious triplet', () => {
        let board:Board = new Board(TestBoards.OBVIOUS_TRIPLET);
        let strategies:boolean[] = board.getStrategies();
        expect(board.getSolutionString()).toBe(TestBoards.OBVIOUS_TRIPLET_SOLUTION);
        expect(strategies[StrategyEnum.OBVIOUS_TRIPLET]).toBeTruthy();
    });

    it('should solve obvious quadruplet', () => {
        let strategies:boolean[] = onlyObviousSinglesQuadruplets.getStrategies();
        expect(onlyObviousSinglesQuadruplets.getSolutionString()).toBe(TestBoards.ONLY_OBVIOUS_SINGLES_SOLUTION);
        expect(strategies[StrategyEnum.OBVIOUS_QUADRUPLET]).toBeTruthy();
    });

    it('should solve obvious quintuplet', () => {
        let algorithm:StrategyEnum[] = new Array();
        algorithm.push(StrategyEnum.AMEND_NOTES);
        algorithm.push(StrategyEnum.OBVIOUS_QUINTUPLET);
        for (let strategy: number = 0; strategy < StrategyEnum.COUNT; strategy++) {
            if (strategy !== StrategyEnum.OBVIOUS_QUINTUPLET && strategy !== StrategyEnum.AMEND_NOTES) {
                algorithm.push(strategy);
            }
        }
        let board:Board = new Board(TestBoards.ONLY_OBVIOUS_SINGLES, algorithm);
        let strategies:boolean[] = board.getStrategies();
        expect(board.getSolutionString()).toBe(TestBoards.ONLY_OBVIOUS_SINGLES_SOLUTION);
        expect(strategies[StrategyEnum.OBVIOUS_QUINTUPLET]).toBeTruthy();
    });

    it('should solve obvious sextuplet', () => {
        let algorithm:StrategyEnum[] = new Array();
        algorithm.push(StrategyEnum.AMEND_NOTES);
        algorithm.push(StrategyEnum.SIMPLIFY_NOTES);
        algorithm.push(StrategyEnum.OBVIOUS_SEXTUPLET);
        for (let strategy: number = 0; strategy < StrategyEnum.COUNT; strategy++) {
            if (strategy !== StrategyEnum.OBVIOUS_SEXTUPLET && strategy !== StrategyEnum.SIMPLIFY_NOTES && strategy !== StrategyEnum.AMEND_NOTES) {
                algorithm.push(strategy);
            }
        }
        let board:Board = new Board(TestBoards.ONLY_OBVIOUS_SINGLES, algorithm);
        let strategies:boolean[] = board.getStrategies();
        expect(board.getSolutionString()).toBe(TestBoards.ONLY_OBVIOUS_SINGLES_SOLUTION);
        expect(strategies[StrategyEnum.OBVIOUS_SEXTUPLET]).toBeTruthy();
    });

    it('should solve obvious septuplet', () => {
        let algorithm:StrategyEnum[] = new Array();
        algorithm.push(StrategyEnum.AMEND_NOTES);
        algorithm.push(StrategyEnum.SIMPLIFY_NOTES);
        algorithm.push(StrategyEnum.OBVIOUS_SEPTUPLET);
        for (let strategy: number = 0; strategy < StrategyEnum.COUNT; strategy++) {
            if (strategy !== StrategyEnum.OBVIOUS_SEPTUPLET && strategy !== StrategyEnum.SIMPLIFY_NOTES && strategy !== StrategyEnum.AMEND_NOTES) {
                algorithm.push(strategy);
            }
        }
        let board:Board = new Board(TestBoards.COLUMN_OBVIOUS_PAIR, algorithm);
        let strategies:boolean[] = board.getStrategies();
        expect(board.getSolutionString()).toBe(TestBoards.COLUMN_OBVIOUS_PAIR_SOLUTION);
        expect(strategies[StrategyEnum.OBVIOUS_SEPTUPLET]).toBeTruthy();
    });

    it('should solve obvious octuplet', () => {
        let algorithm:StrategyEnum[] = new Array();
        algorithm.push(StrategyEnum.AMEND_NOTES);
        algorithm.push(StrategyEnum.SIMPLIFY_NOTES);
        algorithm.push(StrategyEnum.OBVIOUS_OCTUPLET);
        for (let strategy: number = 0; strategy < StrategyEnum.COUNT; strategy++) {
            if (strategy !== StrategyEnum.OBVIOUS_OCTUPLET && strategy !== StrategyEnum.SIMPLIFY_NOTES && strategy !== StrategyEnum.AMEND_NOTES) {
                algorithm.push(strategy);
            }
        }
        let board:Board = new Board(TestBoards.OBVIOUS_OCTUPLET, algorithm);
        let strategies:boolean[] = board.getStrategies();
        expect(board.getSolutionString()).toBe(TestBoards.OBVIOUS_OCTUPLET_SOLUTION);
        expect(strategies[StrategyEnum.OBVIOUS_OCTUPLET]).toBeTruthy();
    });

    it('should solve pointing pair', () => {
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
    });
});

describe("difficulty reporter", () => {
    it('print difficulty report to console', () => {
        // Takes ~2 min to run so turned off by default
        if (false) {
            console.log("Difficulty Report:");
            console.log("Individual Puzzle Difficulties:");
            let min:number = 1000, max:number = 0, average:number = 0, temp:number, unsolvable:number = 0;
            for (let i:number = 0; i < difficultyBoards.length; i++) {
                try {
                    temp = (new Board(difficultyBoards[i])).getDifficulty();
                    min = Math.min(temp, min);
                    max = Math.max(temp, max);
                    average += temp;
                    console.log(temp);
                } catch (e) {
                    unsolvable++;
                }
            }
            average /= difficultyBoards.length - unsolvable;
            console.log("Difficulty Report Summary Statistics:");
            console.log("Min Difficulty: " + min);
            console.log("Max Difficulty: " + max);
            console.log("Average Difficulty: " + average);
            console.log("Was able to solve " + (difficultyBoards.length - unsolvable) + " out of " + difficultyBoards.length);
        }
    });
});
