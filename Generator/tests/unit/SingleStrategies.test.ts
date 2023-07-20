import { Cell } from "../../Cell";
import { getBlankCellBoard } from "../testResources";
import { SingleStrategies } from "../../SingleStrategies";
import { SudokuEnum } from "../../Sudoku";
import { CellBoard } from "../../CellBoard";
import { Group } from "../../Group";

describe("check cell for naked single", () => {
    it('should not find a naked single on the empty board', () => {
        let board:Cell[][] = getBlankCellBoard();
        expect(SingleStrategies.getSingle(board, 0, 0)).toBe(-1);
    });
    it('should find a naked single', () => {
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