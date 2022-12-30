import {Strategy} from '../../Strategy';
import { Cell } from '../../Cell';
import { CustomError, CustomErrorEnum } from '../../CustomError';
import { getError } from '../testResources';

describe("create naked single", () => {
    it('should throw strategy not identified error', async () => {
        let cells:Cell[][] = new Array();
        let strategy:Strategy = new Strategy(cells, cells);
        const error = await getError(async () => strategy.getValuesToPlace());
        expect(error).toBeInstanceOf(CustomError);
        expect(error).toHaveProperty('Error_Message', CustomErrorEnum.STRATEGY_NOT_IDENTIFIED);
    });
    it('should not be a naked single', () => {
        let cells:Cell[][] = new Array();
        let cell:Cell = new Cell(0, 0);
        cells.push([cell]);
        let strategy:Strategy = new Strategy(cells, cells);
        expect(strategy.isNakedSingle).toBeFalsy;
    });
    it('should be a naked single', () => {
        let cells:Cell[][] = new Array();
        let cell:Cell = new Cell(0, 0);
        for (let i:number = 1; i < 9; i++) {
            cell.removeNote(i.toString());
        }
        cells.push([cell]);
        let strategy:Strategy = new Strategy(cells, cells);
        expect(strategy.isNakedSingle()).toBeTruthy;
        expect(strategy.getValuesToPlace()[0].getValue()).toBe("9");
    });
});

describe("create hidden single", () => {
    it('should not be a hidden single', () => {
        let cells:Cell[][] = new Array();
        cells.push(new Array());
        for (let i:number = 0; i < 9; i++) {
            cells[0].push(new Cell(0, 0));
        }
        cells[0][0].removeNote("3");
        cells[0][4].removeNote("3");
        cells[0][2].removeNote("5");
        for (let i:number = 0; i < 7; i++) {
            cells[0][i].removeNote("7");
        }
        for (let i:number = 1; i < 8; i++) {
            cells[0][i].removeNote("6");
        }
        let strategy:Strategy = new Strategy(cells, cells);
        expect(strategy.isHiddenSingle()).toBeFalsy;
    });
    it ('should be a hidden single', () => {
        let cells:Cell[][] = new Array();
        cells.push(new Array());
        for (let i:number = 0; i < 9; i++) {
            cells[0].push(new Cell(0, 0));
        }
        for (let i:number = 0; i < 8; i++) {
            cells[0][i].removeNote("9");
        }
        let strategy:Strategy = new Strategy(cells, cells);
        expect(strategy.isHiddenSingle()).toBeTruthy;
        expect(strategy.getValuesToPlace()[0].getValue()).toBe("9");
    });
});