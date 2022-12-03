import {Strategy} from '../../Strategy';
import { Cell } from '../../Cell';
import { CustomError, CustomErrorEnum } from '../../CustomError';

describe("create naked single", () => {
    it('should throw strategy not identified error', () => {
        let cells:Cell[][] = new Array();
        let strategy:Strategy = new Strategy(cells);
        try {
            strategy.getValuesToPlace();
        } catch (err) {
            expect(err).toBeInstanceOf(CustomError);
            expect(err).toHaveProperty('Error_Message', CustomErrorEnum.STRATEGY_NOT_IDENTIFIED);
        }
    });
    it('should not be a naked single', () => {
        let cells:Cell[][] = new Array();
        let cell:Cell = new Cell(0, 0);
        cells.push([cell]);
        let strategy:Strategy = new Strategy(cells);
        expect(strategy.isNakedSingle).toBeFalsy;
    });
    it('should be a naked single', () => {
        let cells:Cell[][] = new Array();
        let cell:Cell = new Cell(0, 0);
        for (let i:number = 1; i < 9; i++) {
            cell.removeNote(i.toString());
        }
        cells.push([cell]);
        let strategy:Strategy = new Strategy(cells);
        expect(strategy.isNakedSingle()).toBeTruthy;
        expect(strategy.getValuesToPlace()[0].getValue()).toBe("9");
    });
});