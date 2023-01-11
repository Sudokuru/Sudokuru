import {Strategy} from '../../Strategy';
import { Cell } from '../../Cell';
import { CustomError, CustomErrorEnum } from '../../CustomError';
import { getError } from '../testResources';
import { Group } from '../../Group';
import { SudokuEnum, getBlankCellBoard } from '../../Sudoku';

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

describe("create naked pair", () => {
    it("should not be a naked pair", () => {
        // Create board
        let board:Cell[][] = getBlankCellBoard();

        // Create pair
        let cells:Cell[][] = new Array();
        cells.push(new Array());
        cells[0].push(board[0][0]);
        cells[0].push(board[0][1]);

        // Remove all but naked pair from one cell and remove naked pair plus one more note from other cell
        let notes:Group = new Group(true);
        notes.remove(1);
        notes.remove(2);
        cells[0][0].removeNotes(notes);
        notes.remove(3);
        cells[0][1].removeNotes(notes);

        // Test that it isn't a naked pair
        let strategy:Strategy = new Strategy(board, board);
        expect(strategy.isNakedPair()).toBeFalsy;
    });
    it("should be a naked pair", () => {
        // Create board
        let board:Cell[][] = getBlankCellBoard();

        // Create pair
        let cells:Cell[][] = new Array();
        cells.push(new Array());
        cells[0].push(board[0][0]);
        cells[0].push(board[0][1]);

        // Remove all but naked pair from pair
        let notes:Group = new Group(true);
        notes.remove(1);
        notes.remove(2);
        cells[0][0].removeNotes(notes);
        cells[0][1].removeNotes(notes);

        // Test that is naked pair and can remove notes from every cell in shared row and box except naked pair themself
        let strategy:Strategy = new Strategy(board, board);
        expect(strategy.isNakedPair()).toBeTruthy;
        expect(strategy.getNotesToRemove().length).toBe(13);
    });
});

describe("create naked triplet", () => {
    it("should be a naked triplet", () => {
        // Create board
        let board:Cell[][] = getBlankCellBoard();

        // Create triplet
        let cells:Cell[][] = new Array();
        cells.push(new Array());
        cells[0].push(board[0][0]);
        cells[0].push(board[0][1]);
        cells[0].push(board[0][2]);

        // Remove all but naked triplet from triplet (and one more from one cell)
        let notes:Group = new Group(true);
        notes.remove(1);
        notes.remove(2);
        notes.remove(3);
        cells[0][0].removeNotes(notes);
        cells[0][1].removeNotes(notes);
        notes.insert(3);
        cells[0][2].removeNotes(notes);

        // Test that is naked triplet and can remove notes from every cell in shared row and box except naked triplet themself
        let strategy:Strategy = new Strategy(board, board);
        expect(strategy.isNakedTriplet()).toBeTruthy;
        expect(strategy.getNotesToRemove().length).toBe(12);
    });
});

describe("create naked quadruplet", () => {
    it("should be a naked quadruplet", () => {
        // Create board
        let board:Cell[][] = getBlankCellBoard();

        // Create quadruplet
        let cells:Cell[][] = new Array();
        cells.push(new Array());
        cells[0].push(board[0][0]);
        cells[0].push(board[0][1]);
        cells[0].push(board[0][2]);
        cells[0].push(board[0][3]);

        // Remove all but naked quadruplet from quadruplet (and one more from last two cells)
        let notes:Group = new Group(true);
        notes.remove(1);
        notes.remove(2);
        notes.remove(3);
        notes.remove(4);
        cells[0][0].removeNotes(notes);
        cells[0][1].removeNotes(notes);
        notes.insert(3);
        cells[0][2].removeNotes(notes);
        cells[0][3].removeNotes(notes);

        // Test that is naked quadruplet and can remove notes from every cell in shared row and box except naked quadruplet themself
        let strategy:Strategy = new Strategy(board, board);
        expect(strategy.isNakedQuadruplet()).toBeTruthy;
        expect(strategy.getNotesToRemove().length).toBe(5);
    });
});