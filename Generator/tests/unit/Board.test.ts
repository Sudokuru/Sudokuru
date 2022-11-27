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

    it('should create board object', async () => {
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
    });
});