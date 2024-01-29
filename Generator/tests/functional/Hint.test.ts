import { getHint } from "../../../lib/Hint";
import { TestBoards } from "../testResources";
import { getBoardArray } from "../../Sudoku";
import { Solver } from "../../Solver";

describe("get hints", () => {
    it('get hint works with or without some optional parameters', () => {
        let board:string[][] = getBoardArray(TestBoards.SINGLE_NAKED_SINGLE);
        let solver:Solver = new Solver(board);
        let notes:string[][] = solver.getNotes();
        let hint:JSON = getHint(board, notes, undefined, getBoardArray(TestBoards.SINGLE_NAKED_SINGLE_SOLUTION));
        expect(hint["strategy"]).toBe("AMEND_NOTES");
        solver.nextStep();
        notes = solver.getNotes();
        hint = getHint(board, notes);
        expect(hint["strategy"]).toBe("NAKED_SINGLE");
    });
    // TODO: test that it uses the given strategies if they are given
    // TODO: test that it uses the given solution if it is given
});