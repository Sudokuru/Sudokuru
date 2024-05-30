import { getHint } from "../../../lib/Hint";
import { TestBoards } from "../testResources";
import { getBoardArray } from "../../Sudoku";
import { Solver } from "../../Solver";
import { sudokuStrategy } from "../../../lib/Api";

describe("get hints", () => {
    it('get hint works with or without some optional parameters', () => {
        const board:string[][] = getBoardArray(TestBoards.SINGLE_NAKED_SINGLE);
        const solver:Solver = new Solver(board);
        let notes:string[][] = solver.getNotes();
        let hint:JSON = getHint(board, notes, undefined, getBoardArray(TestBoards.SINGLE_NAKED_SINGLE_SOLUTION));
        expect(hint["strategy"]).toBe("AMEND_NOTES");
        solver.nextStep();
        notes = solver.getNotes();
        hint = getHint(board, notes);
        expect(hint["strategy"]).toBe("NAKED_SINGLE");
    });
    
    it('get hint uses provided strategies in given order precedence', () => {
        const board:string[][] = getBoardArray(TestBoards.ONLY_NAKED_SINGLES);
        const solver:Solver = new Solver(board);
        const notes:string[][] = solver.getNotes();
        notes[2] = ["6"];
        const strategies:sudokuStrategy[] = ["NAKED_SINGLE", "AMEND_NOTES"];
        let hint:JSON = getHint(board, notes, strategies);
        expect(hint["strategy"]).toBe("NAKED_SINGLE");
        // Versus the following if using default strategy order precedence which has amend notes > naked single
        hint = getHint(board, notes);
        expect(hint["strategy"]).toBe("AMEND_NOTES");
    });

    // TODO: test that it uses the given solution if it is given
});
