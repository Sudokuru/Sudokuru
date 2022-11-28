import {Cell} from '../../Cell';
import { CustomError, CustomErrorEnum } from '../../CustomError';
import { SudokuEnum } from '../../Sudoku';

describe("create Cell object", () => {
    it('should throw row out of range error', () => {
        try {
            let obj:Cell = new Cell(-1, 0);
        } catch (err) {
            expect(err).toBeInstanceOf(CustomError);
            expect(err).toHaveProperty('Error_Message', CustomErrorEnum.ROW_INDEX_OUT_OF_RANGE);
        }
    });
    it('should throw column out of range error', () => {
        try {
            let obj:Cell = new Cell(0, SudokuEnum.COLUMN_LENGTH);
        } catch (err) {
            expect(err).toBeInstanceOf(CustomError);
            expect(err).toHaveProperty('Error_Message', CustomErrorEnum.COLUMN_INDEX_OUT_OF_RANGE);
        }
    });
    it('should throw invalid value error', () => {
        try {
            let obj:Cell = new Cell(0, 0, "a");
        } catch (err) {
            expect(err).toBeInstanceOf(CustomError);
            expect(err).toHaveProperty('Error_Message', CustomErrorEnum.INVALID_VALUE);
        }
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
});