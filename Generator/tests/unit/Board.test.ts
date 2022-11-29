import {Board} from '../../Board';
import { CustomError, CustomErrorEnum } from '../../CustomError';

describe("create Board object", () => {
    it('should throw invalid board length error', async () => {
        try {
            let obj:Board = new Board("0");
        } catch (err) {
            expect(err).toBeInstanceOf(CustomError);
            expect(err).toHaveProperty('Error_Message', CustomErrorEnum.INVALID_BOARD_LENGTH);
        }
    });

    it('should throw invalid board character error', async () => {
        try {
            let obj:Board = new Board("a00000000000000000000000000000000000000000000000000000000000000000000000000000000");
        } catch (err) {
            expect(err).toBeInstanceOf(CustomError);
            expect(err).toHaveProperty('Error_Message', CustomErrorEnum.INVALID_BOARD_CHARACTERS);
        }
    });

    /*it('should create board object', async () => {
        let board:string[][] = [["0","0","0","0","0","0","0","0","0"],
                                ["0","0","0","0","0","0","0","0","0"],
                                ["0","0","0","0","0","0","0","0","0"],
                                ["0","0","0","0","0","0","0","0","0"],
                                ["0","0","0","0","0","0","0","0","0"],
                                ["0","0","0","0","0","0","0","0","0"],
                                ["0","0","0","0","0","0","0","0","0"],
                                ["0","0","0","0","0","0","0","0","0"],
                                ["0","0","0","0","0","0","0","0","0"]];
        let obj:Board = new Board("000000000000000000000000000000000000000000000000000000000000000000000000000000000");
        expect(obj.getBoard()).toEqual(board);
    });*/

    it('should solve', async () => {
        let board:Board = new Board("439275618051896437876143592342687951185329746697451283928734165563912874714568329");
        let calcSolution:string = board.getSolutionString();
        let solution:string = "439275618251896437876143592342687951185329746697451283928734165563912874714568329";
        expect(calcSolution).toBe(solution);
    });

    it('should solve 2', async () => {
        let board:Board = new Board("310084002200150006570003010423708095760030000009562030050006070007000900000001500");
        let calcSolution:string = board.getSolutionString();
        let solution:string = "316984752298157346574623819423718695765439128189562437851396274637245981942871563";
        expect(calcSolution).toBe(solution);
    });
});