import { Cell } from "../../Cell";
import { getBlankCellBoard } from "../testResources";
import { SingleStrategies } from "../../SingleStrategies";
import { SudokuEnum } from "../../Sudoku";
import { CellBoard } from "../../CellBoard";
import { Group } from "../../Group";

describe("check cell for obvious single", () => {
    it('should not find a obvious single on the empty board', () => {
        let board:Cell[][] = getBlankCellBoard();
        expect(SingleStrategies.getSingle(board, 0, 0)).toBe(-1);
    });
    it('should find a obvious single', () => {
        let board:Cell[][] = getBlankCellBoard();
        // Remove all notes except for 8 from cell
        let cellBoard:CellBoard = new CellBoard(board);
        let notes:Group = new Group(true);
        notes.remove(8);
        cellBoard.resetNotes(0, 0);
        cellBoard.removeNotes(0, 0, notes);
        expect(SingleStrategies.getSingle(board, 0, 0)).toBe(8);
    });
});

describe("check cell for hidden single", () => {
    it('should find a row hidden single', () => {
        let board:Cell[][] = getBlankCellBoard();
        // Remove 8 from all cells in row 0 except for (0, 0)
        let cellBoard:CellBoard = new CellBoard(board);
        cellBoard.resetNotes(0, 0);
        let notes:Group = new Group(false);
        notes.insert(8);
        for (let column:number = 1; column < SudokuEnum.ROW_LENGTH; column++){
            cellBoard.resetNotes(0, column);
            cellBoard.removeNotes(0, column, notes);
        }
        expect(SingleStrategies.getSingle(board, 0, 0)).toBe(8);
    });
    it('should find a column hidden single', () => {
        let board:Cell[][] = getBlankCellBoard();
        // Remove 8 from all cells in column 0 except for (0, 0)
        let cellBoard:CellBoard = new CellBoard(board);
        cellBoard.resetNotes(0, 0);
        let notes:Group = new Group(false);
        notes.insert(8);
        for (let row:number = 1; row < SudokuEnum.COLUMN_LENGTH; row++){
            cellBoard.resetNotes(row, 0);
            cellBoard.removeNotes(row, 0, notes);
        }
        expect(SingleStrategies.getSingle(board, 0, 0)).toBe(8);
    });
    it('should find a box hidden single', () => {
        let board:Cell[][] = getBlankCellBoard();
        // Remove 8 from all cells in box 0 except for (0, 0)
        let cellBoard:CellBoard = new CellBoard(board);
        cellBoard.resetNotes(0, 0);
        let notes:Group = new Group(false);
        notes.insert(8);
        let boxRowStart:number = 0;
        let boxColumnStart:number = 0;
        for (let row:number = boxRowStart; row < boxRowStart + SudokuEnum.BOX_LENGTH; row++){
            for (let column:number = boxColumnStart; column < boxColumnStart + SudokuEnum.BOX_LENGTH; column++){
                if (row !== 0 || column !== 0){
                    cellBoard.resetNotes(row, column);
                    cellBoard.removeNotes(row, column, notes);
                }
            }
        }
        expect(SingleStrategies.getSingle(board, 0, 0)).toBe(8);
    });
});