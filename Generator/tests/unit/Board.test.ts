import {Board} from '../../Board';
import { CustomError, CustomErrorEnum } from '../../CustomError';

describe("create Board object", () => {
    it('should throw invalid board length error', async () => {
        let obj:Board = new Board("0");
        expect(obj).toThrow(CustomError);
        expect(obj).toThrow(CustomErrorEnum.INVALID_BOARD_LENGTH);
    });
});