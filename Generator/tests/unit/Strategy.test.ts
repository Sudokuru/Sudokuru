import {Strategy} from '../../Strategy';
import { Cell } from '../../Cell';
import { CustomError, CustomErrorEnum } from '../../CustomError';
import { getBlankCellBoard, getError, getRowTuplet, removeNotesFromEach, removeTupleNotes } from '../testResources';
import { Group } from '../../Group';
import { GroupEnum, StrategyEnum, SudokuEnum, TupleEnum } from '../../Sudoku';
import { CellBoard } from '../../CellBoard';

describe("create amend notes", () => {
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

describe("create obvious single", () => {
    it('should throw strategy not identified error', async () => {
        let board:Cell[][] = getBlankCellBoard();
        let strategy:Strategy = new Strategy(new CellBoard(board), board, board);
        const error = await getError(async () => strategy.getValuesToPlace());
        expect(error).toBeInstanceOf(CustomError);
        expect(error).toHaveProperty('Error_Message', CustomErrorEnum.STRATEGY_NOT_IDENTIFIED);
    });
    it('should not be a obvious single', () => {
        let board:Cell[][] = getBlankCellBoard();
        let strategy:Strategy = new Strategy(new CellBoard(board), board, board);
        expect(strategy.setStrategyType(StrategyEnum.OBVIOUS_SINGLE)).toBeFalsy();
    });
    it('should be a obvious single', () => {
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
        expect(strategy.setStrategyType(StrategyEnum.OBVIOUS_SINGLE)).toBeTruthy();
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
    it ('should be another hidden single', () => {
        // first hidden single for this board (first strategy applied after amend notes):
        // 000003206168027053003600007932100748000040639006309521680000395309500800005038160
        let board:Cell[][] = getBlankCellBoard();
        board[0][0].setNotes([4, 5, 7]);
        board[0][1].setNotes([4, 5, 7, 9]);
        board[0][2].setNotes([4, 7]);
        board[0][3].setNotes([4, 8, 9]);
        board[0][4].setNotes([1, 5, 8, 9]);
        board[0][5].setValue("3");
        board[0][6].setValue("2");
        board[0][7].setNotes([1, 8]);
        board[0][8].setValue("6");
        board[1][0].setValue("1");
        board[1][1].setValue("6");
        board[1][2].setValue("8");
        board[1][3].setNotes([4, 9]);
        board[1][4].setValue("2");
        board[1][5].setValue("7");
        board[1][6].setNotes([4, 9]);
        board[1][7].setValue("5");
        board[1][8].setValue("3");
        board[2][0].setNotes([2, 4, 5]);
        board[2][1].setNotes([2, 4, 5, 9]);
        board[2][2].setValue("3");
        board[2][3].setValue("6");
        board[2][4].setNotes([1, 5, 8, 9]);
        board[2][5].setNotes([1, 4, 5]);
        board[2][6].setNotes([4, 9]);
        board[2][7].setNotes([1, 8]);
        board[2][8].setValue("7");
        board[3][0].setValue("9");
        board[3][1].setValue("3");
        board[3][2].setValue("2");
        board[3][3].setValue("1");
        board[3][4].setNotes([5, 6]);
        board[3][5].setNotes([5, 6]);
        board[3][6].setValue("7");
        board[3][7].setValue("4");
        board[3][8].setValue("8");
        board[4][0].setNotes([5, 7, 8]);
        board[4][1].setNotes([1, 5, 7]);
        board[4][2].setNotes([1, 7]);
        board[4][3].setNotes([2, 7, 8]);
        board[4][4].setValue("4");
        board[4][5].setNotes([2, 5]);
        board[4][6].setValue("6");
        board[4][7].setValue("3");
        board[4][8].setValue("9");
        board[5][0].setNotes([4, 7, 8]);
        board[5][1].setNotes([4, 7]);
        board[5][2].setValue("6");
        board[5][3].setValue("3");
        board[5][4].setNotes([7, 8]);
        board[5][5].setValue("9");
        board[5][6].setValue("5");
        board[5][7].setValue("2");
        board[5][8].setValue("1");
        board[6][0].setValue("6");
        board[6][1].setValue("8");
        board[6][2].setNotes([1, 4, 7]);
        board[6][3].setNotes([2, 4, 7]);
        board[6][4].setNotes([1, 7]);
        board[6][5].setNotes([1, 2, 4]);
        board[6][6].setValue("3");
        board[6][7].setValue("9");
        board[6][8].setValue("5");
        board[7][0].setValue("3");
        board[7][1].setNotes([1, 2, 4, 7]);
        board[7][2].setValue("9");
        board[7][3].setValue("5");
        board[7][4].setNotes([1, 6, 7]);
        board[7][5].setNotes([1, 2, 4, 6]);
        board[7][6].setValue("8");
        board[7][7].setNotes([7]);
        board[7][8].setNotes([2, 4]);
        board[8][0].setNotes([2, 4, 7]);
        board[8][1].setNotes([2, 4, 7]);
        board[8][2].setValue("5");
        board[8][3].setNotes([2, 4, 7, 9]);
        board[8][4].setValue("3");
        board[8][5].setValue("8");
        board[8][6].setValue("1");
        board[8][7].setValue("6");
        board[8][8].setNotes([2, 4]);
        let strategyA:Strategy = new Strategy(new CellBoard(board), board, board);
        expect(strategyA.setStrategyType(StrategyEnum.AMEND_NOTES)).toBeFalsy();
        let strategy:Strategy = new Strategy(new CellBoard(board), board, board);
        expect(strategy.setStrategyType(StrategyEnum.HIDDEN_SINGLE)).toBeTruthy();
    });
});

describe("create hidden pair", () => {
    it('should not be a hidden pair', () => {
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
        expect(strategy.setStrategyType(StrategyEnum.HIDDEN_PAIR)).toBeFalsy();
    });
    it ('should be a hidden pair', () => {
        let board:Cell[][] = getBlankCellBoard();
        for (let row:number = 0; row < SudokuEnum.COLUMN_LENGTH; row++) {
            for (let column:number = 0; column < SudokuEnum.ROW_LENGTH; column++) {
                board[row][column].resetNotes();
            }
        }
        for (let i:number = 0; i < 7; i++) {
            board[0][i].removeNote("8");
            board[0][i].removeNote("9");
        }
        let strategy:Strategy = new Strategy(new CellBoard(board), board, board);
        expect(strategy.setStrategyType(StrategyEnum.HIDDEN_PAIR)).toBeTruthy();
        expect((strategy.getNotesToRemove())[0].getSize()).toBe(SudokuEnum.ROW_LENGTH - 2);
        let cause:Cell[] = strategy.getCause();
        expect(cause.length).toBe(7);
        let groups:number[][] = strategy.getGroups();
        expect(groups.length).toBe(1);
        expect(groups[0][0]).toBe(GroupEnum.ROW);
        expect(groups[0][1]).toBe(0);
    });
});

describe("create obvious pair", () => {
    it("should not be a obvious pair", () => {
        // Create board
        let board:Cell[][] = getBlankCellBoard();

        // Create pair
        let cells:Cell[][] = getRowTuplet(TupleEnum.PAIR, board);

        // Remove all but obvious pair from one cell and remove obvious pair plus one more note from other cell
        // Removing the extra note turns it into a obvious single instead of a obvious pair
        let notes:Group = new Group(true);
        removeTupleNotes(TupleEnum.TRIPLET, notes); // removes a triplet of candidates from the notes
        removeNotesFromEach(notes, cells); // removes notes for all but the triplet of candidates from each cell

        // Test that it isn't a obvious pair
        let strategy:Strategy = new Strategy(new CellBoard(board), board, board);
        expect(strategy.setStrategyType(StrategyEnum.OBVIOUS_PAIR)).toBeFalsy();
    });
    it("should be a obvious pair", () => {
        // Create board
        let board:Cell[][] = getBlankCellBoard();
        for (let row:number = 0; row < SudokuEnum.COLUMN_LENGTH; row++) {
            for (let column:number = 0; column < SudokuEnum.ROW_LENGTH; column++) {
                board[row][column].resetNotes();
            }
        }

        // Create pair
        let cells:Cell[][] = getRowTuplet(TupleEnum.PAIR, board);

        // Remove all but obvious pair from pair
        let notes:Group = new Group(true);
        removeTupleNotes(TupleEnum.PAIR, notes);
        removeNotesFromEach(notes, cells);

        // Test that is obvious pair and can remove notes from every cell in shared row and box except obvious pair themself
        let strategy:Strategy = new Strategy(new CellBoard(board), board, board);
        expect(strategy.setStrategyType(StrategyEnum.OBVIOUS_PAIR)).toBeTruthy();
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
    it("should not be an obvious pair because it contains an obvious single", () => {
        // Cells board[1][2] and board[1][6] would be an obvious pair except one of the cells
        // only has one of the values in a pair thus being an obvious single
        // board used is this one after amend or auto filling all the notes and removing the
        // four note from the cell at board[1][2] with just 8 left:
        // 316984752200157006570623010423718695765439000189562430050006070007000900000001500
        let board:Cell[][] = getBlankCellBoard();
        board[0][0].setValue("3");
        board[0][1].setValue("1");
        board[0][2].setValue("6");
        board[0][3].setValue("9");
        board[0][4].setValue("8");
        board[0][5].setValue("4");
        board[0][6].setValue("7");
        board[0][7].setValue("5");
        board[0][8].setValue("2");
        board[1][0].setValue("2");
        board[1][1].setNotes([4, 9]);
        board[1][2].setNotes([8]);
        board[1][3].setValue("1");
        board[1][4].setValue("5");
        board[1][5].setValue("7");
        board[1][6].setNotes([3, 8]);
        board[1][7].setNotes([4, 8]);
        board[1][8].setValue("6");
        board[2][0].setValue("5");
        board[2][1].setValue("7");
        board[2][2].setNotes([4, 8]);
        board[2][3].setValue("6");
        board[2][4].setValue("2");
        board[2][5].setValue("3");
        board[2][6].setNotes([8]);
        board[2][7].setValue("1");
        board[2][8].setNotes([4, 8, 9]);
        board[3][0].setValue("4");
        board[3][1].setValue("2");
        board[3][2].setValue("3");
        board[3][3].setValue("7");
        board[3][4].setValue("1");
        board[3][5].setValue("8");
        board[3][6].setValue("6");
        board[3][7].setValue("9");
        board[3][8].setValue("5");
        board[4][0].setValue("7");
        board[4][1].setValue("6");
        board[4][2].setValue("5");
        board[4][3].setValue("4");
        board[4][4].setValue("3");
        board[4][5].setValue("9");
        board[4][6].setNotes([1, 2, 8]);
        board[4][7].setNotes([2, 8]);
        board[4][8].setNotes([1, 8]);
        board[5][0].setValue("1");
        board[5][1].setValue("8");
        board[5][2].setValue("9");
        board[5][3].setValue("5");
        board[5][4].setValue("6");
        board[5][5].setValue("2");
        board[5][6].setValue("4");
        board[5][7].setValue("3");
        board[5][8].setNotes([7]);
        board[6][0].setNotes([8, 9]);
        board[6][1].setValue("5");
        board[6][2].setNotes([1, 2, 4, 8]);
        board[6][3].setNotes([2, 3, 8]);
        board[6][4].setNotes([4, 9]);
        board[6][5].setValue("6");
        board[6][6].setNotes([1, 2, 3, 8]);
        board[6][7].setValue("7");
        board[6][8].setNotes([1, 3, 4, 8]);
        board[7][0].setNotes([6, 8]);
        board[7][1].setNotes([3, 4]);
        board[7][2].setValue("7");
        board[7][3].setNotes([2, 3, 8]);
        board[7][4].setNotes([4]);
        board[7][5].setNotes([5]);
        board[7][6].setValue("9");
        board[7][7].setNotes([2, 4, 6, 8]);
        board[7][8].setNotes([1, 3, 4, 8]);
        board[8][0].setNotes([6, 8, 9]);
        board[8][1].setNotes([3, 4, 9]);
        board[8][2].setNotes([2, 4, 8]);
        board[8][3].setNotes([2, 3, 8]);
        board[8][4].setNotes([4, 7, 9]);
        board[8][5].setValue("1");
        board[8][6].setValue("5");
        board[8][7].setNotes([2, 4, 6, 8]);
        board[8][8].setNotes([3, 4, 8]);
        let strategy:Strategy = new Strategy(new CellBoard(board), board, board);
        expect(strategy.setStrategyType(StrategyEnum.OBVIOUS_PAIR)).toBeFalsy();
    });
});

describe("create pointing pair", () => {
    it("should be a pointing pair", () => {
        // Create board
        let board:Cell[][] = getBlankCellBoard();
        for (let row:number = 0; row < SudokuEnum.COLUMN_LENGTH; row++) {
            for (let column:number = 0; column < SudokuEnum.ROW_LENGTH; column++) {
                board[row][column].resetNotes();
            }
        }
        
        // Remove "1" from every cell in the first box except for the first two in the top row
        let boxRowStart:number = Cell.getBoxRowStart(0), boxColumnStart:number = Cell.getBoxColumnStart(0);
        for (let row:number = boxRowStart; row < (boxRowStart + SudokuEnum.BOX_LENGTH); row++) {
            for (let column:number = boxColumnStart; column < (boxColumnStart + SudokuEnum.BOX_LENGTH); column++) {
                if (row === boxRowStart && column < (boxColumnStart + 2)) {
                    continue;
                }
                board[row][column].removeNote("1");
            }
        }

        // Test that is pointing pair and can remove notes from every cell in shared row except for those in box itself and correct cause/groups
        let strategy:Strategy = new Strategy(new CellBoard(board), board, board);
        expect(strategy.setStrategyType(StrategyEnum.POINTING_PAIR)).toBeTruthy();
        expect(strategy.getNotesToRemove().length).toBe(6);
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
    it("should not be a pointing pair because it is an obvious pair", () => {
        // The two 4,8s in the first box would be a pointing pair except they are also an obvious
        // pair which makes it confusing especially as drill so they are excluded
        // board used is this one after amend or auto filling all the notes:
        // 316984752200157006570623010423718695765439000189562430050006070007000900000001500
        let board:Cell[][] = getBlankCellBoard();
        board[0][0].setValue("3");
        board[0][1].setValue("1");
        board[0][2].setValue("6");
        board[0][3].setValue("9");
        board[0][4].setValue("8");
        board[0][5].setValue("4");
        board[0][6].setValue("7");
        board[0][7].setValue("5");
        board[0][8].setValue("2");
        board[1][0].setValue("2");
        board[1][1].setNotes([4, 9]);
        board[1][2].setNotes([4, 8]);
        board[1][3].setValue("1");
        board[1][4].setValue("5");
        board[1][5].setValue("7");
        board[1][6].setNotes([3, 8]);
        board[1][7].setNotes([4, 8]);
        board[1][8].setValue("6");
        board[2][0].setValue("5");
        board[2][1].setValue("7");
        board[2][2].setNotes([4, 8]);
        board[2][3].setValue("6");
        board[2][4].setValue("2");
        board[2][5].setValue("3");
        board[2][6].setNotes([8]);
        board[2][7].setValue("1");
        board[2][8].setNotes([4, 8, 9]);
        board[3][0].setValue("4");
        board[3][1].setValue("2");
        board[3][2].setValue("3");
        board[3][3].setValue("7");
        board[3][4].setValue("1");
        board[3][5].setValue("8");
        board[3][6].setValue("6");
        board[3][7].setValue("9");
        board[3][8].setValue("5");
        board[4][0].setValue("7");
        board[4][1].setValue("6");
        board[4][2].setValue("5");
        board[4][3].setValue("4");
        board[4][4].setValue("3");
        board[4][5].setValue("9");
        board[4][6].setNotes([1, 2, 8]);
        board[4][7].setNotes([2, 8]);
        board[4][8].setNotes([1, 8]);
        board[5][0].setValue("1");
        board[5][1].setValue("8");
        board[5][2].setValue("9");
        board[5][3].setValue("5");
        board[5][4].setValue("6");
        board[5][5].setValue("2");
        board[5][6].setValue("4");
        board[5][7].setValue("3");
        board[5][8].setNotes([7]);
        board[6][0].setNotes([8, 9]);
        board[6][1].setValue("5");
        board[6][2].setNotes([1, 2, 4, 8]);
        board[6][3].setNotes([2, 3, 8]);
        board[6][4].setNotes([4, 9]);
        board[6][5].setValue("6");
        board[6][6].setNotes([1, 2, 3, 8]);
        board[6][7].setValue("7");
        board[6][8].setNotes([1, 3, 4, 8]);
        board[7][0].setNotes([6, 8]);
        board[7][1].setNotes([3, 4]);
        board[7][2].setValue("7");
        board[7][3].setNotes([2, 3, 8]);
        board[7][4].setNotes([4]);
        board[7][5].setNotes([5]);
        board[7][6].setValue("9");
        board[7][7].setNotes([2, 4, 6, 8]);
        board[7][8].setNotes([1, 3, 4, 8]);
        board[8][0].setNotes([6, 8, 9]);
        board[8][1].setNotes([3, 4, 9]);
        board[8][2].setNotes([2, 4, 8]);
        board[8][3].setNotes([2, 3, 8]);
        board[8][4].setNotes([4, 7, 9]);
        board[8][5].setValue("1");
        board[8][6].setValue("5");
        board[8][7].setNotes([2, 4, 6, 8]);
        board[8][8].setNotes([3, 4, 8]);
        let strategy:Strategy = new Strategy(new CellBoard(board), board, board);
        expect(strategy.setStrategyType(StrategyEnum.POINTING_PAIR)).toBeFalsy();
    });
});

describe("create obvious triplet", () => {
    it("should be a obvious triplet", () => {
        // Create board
        let board:Cell[][] = getBlankCellBoard();
        for (let row:number = 0; row < SudokuEnum.COLUMN_LENGTH; row++) {
            for (let column:number = 0; column < SudokuEnum.ROW_LENGTH; column++) {
                board[row][column].resetNotes();
            }
        }

        // Create triplet
        let cells:Cell[][] = getRowTuplet(TupleEnum.TRIPLET, board);

        // Remove all but obvious triplet from triplet
        let notes:Group = new Group(true);
        removeTupleNotes(TupleEnum.TRIPLET, notes);
        removeNotesFromEach(notes, cells);

        // Test that is obvious triplet and can remove notes from every cell in shared row and box except obvious triplet themself
        let strategy:Strategy = new Strategy(new CellBoard(board), board, board);
        expect(strategy.setStrategyType(StrategyEnum.OBVIOUS_TRIPLET)).toBeTruthy();
        expect(strategy.getNotesToRemove().length).toBe(12);
    });
});

describe("create obvious quadruplet through octuplet", () => {
    it("should be a obvious quadruplet through octuplet", () => {
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

            // Remove all but obvious set from tuplet (and one more from first cell)
            let notes:Group = new Group(true);
            removeTupleNotes(tuple, notes);
            removeNotesFromEach(notes, cells);
            cells[0][0].removeNote("1");

            // Test that is obvious set and can remove notes from every cell in shared row and box except obvious tuplet themself
            let strategy:Strategy = new Strategy(new CellBoard(board), board, board);
            //expect(strategy.setStrategyType()).toBeTruthy();
            if (tuple === TupleEnum.QUADRUPLET) {
                expect(strategy.setStrategyType(StrategyEnum.OBVIOUS_QUADRUPLET));
            }
            else if (tuple === TupleEnum.QUINTUPLET) {
                expect(strategy.setStrategyType(StrategyEnum.OBVIOUS_QUINTUPLET));
            }
            else if (tuple === TupleEnum.SEXTUPLET) {
                expect(strategy.setStrategyType(StrategyEnum.OBVIOUS_SEXTUPLET));
            }
            else if (tuple === TupleEnum.SEPTUPLET) {
                expect(strategy.setStrategyType(StrategyEnum.OBVIOUS_SEPTUPLET));
            }
            else if (tuple === TupleEnum.OCTUPLET) {
                expect(strategy.setStrategyType(StrategyEnum.OBVIOUS_OCTUPLET));
            }
            expect(strategy.getNotesToRemove().length).toBe(SudokuEnum.ROW_LENGTH - tuple);
        }
    });
});