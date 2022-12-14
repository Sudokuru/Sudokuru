import {Cell} from '../../Cell';
import { CustomError, CustomErrorEnum } from '../../CustomError';
import { SudokuEnum } from '../../Sudoku';
import { getError } from '../testResources';

describe("create Cell object", () => {
    it('should throw row out of range error', async () => {
        const error = await getError(async () => new Cell(-1, 0));
        expect(error).toBeInstanceOf(CustomError);
        expect(error).toHaveProperty('Error_Message', CustomErrorEnum.ROW_INDEX_OUT_OF_RANGE);
    });
    it('should throw column out of range error', async () => {
        const error = await getError(async () => new Cell(0, SudokuEnum.COLUMN_LENGTH));
        expect(error).toBeInstanceOf(CustomError);
        expect(error).toHaveProperty('Error_Message', CustomErrorEnum.COLUMN_INDEX_OUT_OF_RANGE);
    });
    it('should throw invalid value error', async () => {
        const error = await getError(async () => new Cell(0, 0, "a"));
        expect(error).toBeInstanceOf(CustomError);
        expect(error).toHaveProperty('Error_Message', CustomErrorEnum.INVALID_VALUE);
    });
    it('should remove notes', () => {
        let obj:Cell = new Cell(0, 0);

        expect(obj.hasNote("1")).toBeTruthy;
        obj.removeNote("1");
        expect(obj.hasNote("1")).toBeFalsy;

        expect(obj.hasNote("2")).toBeTruthy;
        expect(obj.hasNote("3")).toBeTruthy;
        let notes:Map<string, undefined> = new Map([["2", undefined], ["3", undefined]]);
        obj.removeNotes(notes);
        expect(obj.hasNote("2")).toBeFalsy;
        expect(obj.hasNote("3")).toBeFalsy;
    });
    it('should initialize box', () => {
        let a:Cell = new Cell(1, 1);
        let b:Cell = new Cell(2, 7);
        let c:Cell = new Cell(3, 0);
        let d:Cell = new Cell(8, 4);

        expect(a.getBox()).toBe(0);
        expect(b.getBox()).toBe(2);
        expect(c.getBox()).toBe(3);
        expect(d.getBox()).toBe(7);

        expect(a.getBoxColumnStart()).toBe(0);
        expect(b.getBoxColumnStart()).toBe(6);

        expect(c.getBoxRowStart()).toBe(3);
        expect(d.getBoxRowStart()).toBe(6);
    });
});