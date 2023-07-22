import { Cell } from "../../Cell";
import { getBlankCellBoard } from "../testResources";
import { SimpleSolver } from "../../SimpleSolver";
import { CellBoard } from "../../CellBoard";
import { Group } from "../../Group";

describe("solve board step by step using naked and hidden single strategies", () => {
    it('should not solve a board with no naked or hidden singles', () => {
        let board:Cell[][] = getBlankCellBoard();
        expect(SimpleSolver.solveStep(board)).toBe(false);
    });
    it('should solve a board with a naked single', () => {
        let board:Cell[][] = getBlankCellBoard();
        // Remove all notes except for 8 from cell
        let cellBoard:CellBoard = new CellBoard(board);
        let notes:Group = new Group(true);
        notes.remove(8);
        cellBoard.resetNotes(0, 0);
        cellBoard.removeNotes(0, 0, notes);
        expect(SimpleSolver.solveStep(board)).toBe(true);
        expect(board[0][0].getValue()).toBe("9");
    });
});