import {Strategy} from '../../Strategy';
import { Cell } from '../../Cell';
import { CustomError, CustomErrorEnum } from '../../CustomError';
import { getBlankCellBoard, getError, getRowTuplet, removeNotesFromEach, removeTupleNotes } from '../testResources';
import { Group } from '../../Group';
import { SudokuEnum, TupleEnum } from '../../Sudoku';

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
        let cells:Cell[][] = getRowTuplet(TupleEnum.PAIR, board);

        // Remove all but naked pair from one cell and remove naked pair plus one more note from other cell
        // Removing the extra note turns it into a naked single instead of a naked pair
        let notes:Group = new Group(true);
        removeTupleNotes(TupleEnum.PAIR, notes);
        removeNotesFromEach(notes, cells);
        cells[0][1].removeNote("2");

        // Test that it isn't a naked pair
        let strategy:Strategy = new Strategy(board, board);
        expect(strategy.isNakedPair()).toBeFalsy;
    });
    it("should be a naked pair", () => {
        // Create board
        let board:Cell[][] = getBlankCellBoard();

        // Create pair
        let cells:Cell[][] = getRowTuplet(TupleEnum.PAIR, board);

        // Remove all but naked pair from pair
        let notes:Group = new Group(true);
        removeTupleNotes(TupleEnum.PAIR, notes);
        removeNotesFromEach(notes, cells);

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
        let cells:Cell[][] = getRowTuplet(TupleEnum.TRIPLET, board);

        // Remove all but naked triplet from triplet
        let notes:Group = new Group(true);
        removeTupleNotes(TupleEnum.TRIPLET, notes);
        removeNotesFromEach(notes, cells);

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
        let cells:Cell[][] = getRowTuplet(TupleEnum.QUADRUPLET, board);

        // Remove all but naked quadruplet from quadruplet (and one more from last cell)
        let notes:Group = new Group(true);
        removeTupleNotes(TupleEnum.QUADRUPLET, notes);
        removeNotesFromEach(notes, cells);
        cells[0][3].removeNote("1");

        // Test that is naked quadruplet and can remove notes from every cell in shared row and box except naked quadruplet themself
        let strategy:Strategy = new Strategy(board, board);
        expect(strategy.isNakedQuadruplet()).toBeTruthy;
        expect(strategy.getNotesToRemove().length).toBe(5);
    });
});

describe("create naked quintuplet", () => {
    it("should be a naked quintuplet", () => {
        // Create board
        let board:Cell[][] = getBlankCellBoard();

        // Create quintuplet
        let cells:Cell[][] = getRowTuplet(TupleEnum.QUINTUPLET, board);

        // Remove all but naked quintuplet from quintuplet (and one more from last cell)
        let notes:Group = new Group(true);
        removeTupleNotes(TupleEnum.QUINTUPLET, notes);
        removeNotesFromEach(notes, cells);
        cells[0][4].removeNote("1");

        // Test that is naked quintuplet and can remove notes from every cell in shared row and box except naked quintuplet themself
        let strategy:Strategy = new Strategy(board, board);
        expect(strategy.isNakedQuintuplet()).toBeTruthy;
        expect(strategy.getNotesToRemove().length).toBe(4);
    });
});

describe("create naked sextuplet", () => {
    it("should be a naked sextuplet", () => {
        // Create board
        let board:Cell[][] = getBlankCellBoard();

        // Create sextuplet
        let cells:Cell[][] = getRowTuplet(TupleEnum.SEXTUPLET, board);

        // Remove all but naked sextuplet from sextuplet (and one more from last cell)
        let notes:Group = new Group(true);
        removeTupleNotes(TupleEnum.SEXTUPLET, notes);
        removeNotesFromEach(notes, cells);
        cells[0][5].removeNote("1");

        // Test that is naked sextuplet and can remove notes from every cell in shared row and box except naked sextuplet themself
        let strategy:Strategy = new Strategy(board, board);
        expect(strategy.isNakedSextuplet()).toBeTruthy;
        expect(strategy.getNotesToRemove().length).toBe(3);
    });
});

describe("create naked septuplet", () => {
    it("should be a naked septuplet", () => {
        // Create board
        let board:Cell[][] = getBlankCellBoard();

        // Create septuplet
        let cells:Cell[][] = getRowTuplet(TupleEnum.SEPTUPLET, board);

        // Remove all but naked septuplet from septuplet (and one more from last five cells)
        let notes:Group = new Group(true);
        removeTupleNotes(TupleEnum.SEPTUPLET, notes);
        removeNotesFromEach(notes, cells);
        cells[0][6].removeNote("1");

        // Test that is naked septuplet and can remove notes from every cell in shared row and box except naked septuplet themself
        let strategy:Strategy = new Strategy(board, board);
        expect(strategy.isNakedSeptuplet()).toBeTruthy;
        expect(strategy.getNotesToRemove().length).toBe(2);
    });
});