import {Strategy} from '../../Strategy';
import { Cell } from '../../Cell';
import { CustomError, CustomErrorEnum } from '../../CustomError';
import { getBlankCellBoard, getError, getRowTuplet, removeNotesFromEach, removeTupleNotes } from '../testResources';
import { Group } from '../../Group';
import { GroupEnum, StrategyEnum, SudokuEnum, TupleEnum } from '../../Sudoku';
import { CellBoard } from '../../CellBoard';

describe("create amend notes", () => {
    it('should not be an amend notes', () => {
        let board:Cell[][] = getBlankCellBoard();
        let strategy:Strategy = new Strategy(new CellBoard(board), board, board);
        expect(strategy.setStrategyType(StrategyEnum.AMEND_NOTES)).toBeFalsy();
    });
    it('should be an amend notes', () => {
        let board:Cell[][] = getBlankCellBoard();
        // Insert values into same group as amend notes cell (which will be row 0 and column 0)
        let cellBoard:CellBoard = new CellBoard(board);
        cellBoard.setValue(0, 8, "1");
        cellBoard.setValue(1, 1, "2");
        cellBoard.setValue(8, 0, "3");
        // Insert value that doesn't share group
        cellBoard.setValue(8, 8, "4");
        let strategy:Strategy = new Strategy(cellBoard, board, board);
        expect(strategy.setStrategyType(StrategyEnum.AMEND_NOTES)).toBeTruthy();
        expect((strategy.getNotesToRemove())[0].getSize()).toBe(3);
        expect((strategy.getNotesToRemove()[0].contains("1"))).toBeTruthy();
        expect((strategy.getNotesToRemove()[0].contains("2"))).toBeTruthy();
        expect((strategy.getNotesToRemove()[0].contains("3"))).toBeTruthy();
    });
    it('should be a corrective amend notes', () => {
        let board:Cell[][] = getBlankCellBoard();
        // Create a solution that has the first cell as a 1
        let solution:string[][] = new Array();
        for (let row:number = 0; row < SudokuEnum.COLUMN_LENGTH; row++) {
            solution.push(new Array());
            for (let column:number = 1; column <= SudokuEnum.ROW_LENGTH; column++) {
                solution[row].push(column.toString());
            }
        }
        // Add a value in the same group as the first cell so amend notes has something to remove
        let cellBoard:CellBoard = new CellBoard(board);
        cellBoard.setValue(0, 1, "2");
        // Remove 1 from the first cells notes even though it must be a one
        board[0][0].resetNotes();
        board[0][0].removeNote("1");
        // Should now be an amend notes on the first cell such that the 1 is added back in and the 2 is removed
        let strategy:Strategy = new Strategy(cellBoard, board, board, solution);
        expect(strategy.setStrategyType(StrategyEnum.AMEND_NOTES)).toBeTruthy();
        expect(strategy.getNotesToRemove()[0].getRow()).toBe(0);
        expect(strategy.getNotesToRemove()[0].getColumn()).toBe(0);
        expect(strategy.getNotesToRemove()[0].contains("2")).toBeTruthy();
    });
});

describe("create naked single", () => {
    it('should throw strategy not identified error', async () => {
        let board:Cell[][] = getBlankCellBoard();
        let strategy:Strategy = new Strategy(new CellBoard(board), board, board);
        const error = await getError(async () => strategy.getValuesToPlace());
        expect(error).toBeInstanceOf(CustomError);
        expect(error).toHaveProperty('Error_Message', CustomErrorEnum.STRATEGY_NOT_IDENTIFIED);
    });
    it('should not be a naked single', () => {
        let board:Cell[][] = getBlankCellBoard();
        let strategy:Strategy = new Strategy(new CellBoard(board), board, board);
        expect(strategy.setStrategyType(StrategyEnum.NAKED_SINGLE)).toBeFalsy();
    });
    it('should be a naked single', () => {
        let board:Cell[][] = getBlankCellBoard();
        for (let row:number = 0; row < SudokuEnum.COLUMN_LENGTH; row++) {
            for (let column:number = 0; column < SudokuEnum.ROW_LENGTH; column++) {
                board[row][column].resetNotes();
            }
        }
        for (let i:number = 1; i < SudokuEnum.COLUMN_LENGTH; i++) {
            (board[0][0]).removeNote(i.toString());
        }
        let strategy:Strategy = new Strategy(new CellBoard(board), board, board);
        expect(strategy.setStrategyType(StrategyEnum.NAKED_SINGLE)).toBeTruthy();
        expect(strategy.getValuesToPlace()[0].getValue()).toBe("9");
        let cause:Cell[] = strategy.getCause();
        expect(cause.length).toBe(1);
        expect(cause[0].getRow()).toBe(0);
        expect(cause[0].getColumn()).toBe(0);
        expect((strategy.getGroups()).length).toBe(0);
    });
});

describe("create hidden single", () => {
    it('should not be a hidden single', () => {
        let board:Cell[][] = getBlankCellBoard();
        board[0][0].removeNote("3");
        board[0][4].removeNote("3");
        board[0][2].removeNote("5");
        for (let i:number = 0; i < 7; i++) {
            board[0][i].removeNote("7");
        }
        for (let i:number = 1; i < 8; i++) {
            board[0][i].removeNote("6");
        }
        let strategy:Strategy = new Strategy(new CellBoard(board), board, board);
        expect(strategy.setStrategyType(StrategyEnum.HIDDEN_SINGLE)).toBeFalsy();
    });
    it ('should be a hidden single', () => {
        let board:Cell[][] = getBlankCellBoard();
        for (let row:number = 0; row < SudokuEnum.COLUMN_LENGTH; row++) {
            for (let column:number = 0; column < SudokuEnum.ROW_LENGTH; column++) {
                board[row][column].resetNotes();
            }
        }
        for (let i:number = 0; i < 8; i++) {
            board[0][i].removeNote("9");
        }
        let strategy:Strategy = new Strategy(new CellBoard(board), board, board);
        expect(strategy.setStrategyType(StrategyEnum.HIDDEN_SINGLE)).toBeTruthy();
        expect((strategy.getNotesToRemove())[0].getSize()).toBe(SudokuEnum.ROW_LENGTH - 1);
        let cause:Cell[] = strategy.getCause();
        expect(cause.length).toBe(8);
        let groups:number[][] = strategy.getGroups();
        expect(groups.length).toBe(1);
        expect(groups[0][0]).toBe(GroupEnum.ROW);
        expect(groups[0][1]).toBe(0);
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
        removeTupleNotes(TupleEnum.TRIPLET, notes); // removes a triplet of candidates from the notes
        removeNotesFromEach(notes, cells); // removes notes for all but the triplet of candidates from each cell

        // Test that it isn't a naked pair
        let strategy:Strategy = new Strategy(new CellBoard(board), board, board);
        expect(strategy.setStrategyType(StrategyEnum.NAKED_PAIR)).toBeFalsy();
    });
    it("should be a naked pair", () => {
        // Create board
        let board:Cell[][] = getBlankCellBoard();
        for (let row:number = 0; row < SudokuEnum.COLUMN_LENGTH; row++) {
            for (let column:number = 0; column < SudokuEnum.ROW_LENGTH; column++) {
                board[row][column].resetNotes();
            }
        }

        // Create pair
        let cells:Cell[][] = getRowTuplet(TupleEnum.PAIR, board);

        // Remove all but naked pair from pair
        let notes:Group = new Group(true);
        removeTupleNotes(TupleEnum.PAIR, notes);
        removeNotesFromEach(notes, cells);

        // Test that is naked pair and can remove notes from every cell in shared row and box except naked pair themself
        let strategy:Strategy = new Strategy(new CellBoard(board), board, board);
        expect(strategy.setStrategyType(StrategyEnum.NAKED_PAIR)).toBeTruthy();
        expect(strategy.getNotesToRemove().length).toBe(13);
        let cause:Cell[] = strategy.getCause();
        expect(cause.length).toBe(2);
        expect(cause[0].getRow()+cause[1].getRow()+cause[0].getColumn()).toBe(0);
        expect(cause[1].getColumn()).toBe(1);
        let groups:number[][] = strategy.getGroups();
        expect(groups.length).toBe(2);
        expect(groups[0][0]).toBe(GroupEnum.ROW);
        expect(groups[0][1]).toBe(0);
        expect(groups[1][0]).toBe(GroupEnum.BOX);
        expect(groups[1][1]).toBe(0);
    });
});

describe("create naked triplet", () => {
    it("should be a naked triplet", () => {
        // Create board
        let board:Cell[][] = getBlankCellBoard();
        for (let row:number = 0; row < SudokuEnum.COLUMN_LENGTH; row++) {
            for (let column:number = 0; column < SudokuEnum.ROW_LENGTH; column++) {
                board[row][column].resetNotes();
            }
        }

        // Create triplet
        let cells:Cell[][] = getRowTuplet(TupleEnum.TRIPLET, board);

        // Remove all but naked triplet from triplet
        let notes:Group = new Group(true);
        removeTupleNotes(TupleEnum.TRIPLET, notes);
        removeNotesFromEach(notes, cells);

        // Test that is naked triplet and can remove notes from every cell in shared row and box except naked triplet themself
        let strategy:Strategy = new Strategy(new CellBoard(board), board, board);
        expect(strategy.setStrategyType(StrategyEnum.NAKED_TRIPLET)).toBeTruthy();
        expect(strategy.getNotesToRemove().length).toBe(12);
    });
});

describe("create naked quadruplet through octuplet", () => {
    it("should be a naked quadruplet through octuplet", () => {
        for (let tuple:TupleEnum = TupleEnum.QUADRUPLET; tuple <= TupleEnum.OCTUPLET; tuple++) {
            // Create board
            let board:Cell[][] = getBlankCellBoard();
            for (let row:number = 0; row < SudokuEnum.COLUMN_LENGTH; row++) {
                for (let column:number = 0; column < SudokuEnum.ROW_LENGTH; column++) {
                    board[row][column].resetNotes();
                }
            }

            // Create tuplet
            let cells:Cell[][] = getRowTuplet(tuple, board);

            // Remove all but naked set from tuplet (and one more from first cell)
            let notes:Group = new Group(true);
            removeTupleNotes(tuple, notes);
            removeNotesFromEach(notes, cells);
            cells[0][0].removeNote("1");

            // Test that is naked set and can remove notes from every cell in shared row and box except naked tuplet themself
            let strategy:Strategy = new Strategy(new CellBoard(board), board, board);
            //expect(strategy.setStrategyType()).toBeTruthy();
            if (tuple === TupleEnum.QUADRUPLET) {
                expect(strategy.setStrategyType(StrategyEnum.NAKED_QUADRUPLET));
            }
            else if (tuple === TupleEnum.QUINTUPLET) {
                expect(strategy.setStrategyType(StrategyEnum.NAKED_QUINTUPLET));
            }
            else if (tuple === TupleEnum.SEXTUPLET) {
                expect(strategy.setStrategyType(StrategyEnum.NAKED_SEXTUPLET));
            }
            else if (tuple === TupleEnum.SEPTUPLET) {
                expect(strategy.setStrategyType(StrategyEnum.NAKED_SEPTUPLET));
            }
            else if (tuple === TupleEnum.OCTUPLET) {
                expect(strategy.setStrategyType(StrategyEnum.NAKED_OCTUPLET));
            }
            expect(strategy.getNotesToRemove().length).toBe(SudokuEnum.ROW_LENGTH - tuple);
        }
    });
});