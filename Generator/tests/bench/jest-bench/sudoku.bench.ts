import { benchmarkSuite } from "jest-bench";
import { getBoardArray } from "../../../Sudoku";
import { Solver } from "../../../Solver";
import { TestBoards } from "../../testResources";
import { getHint } from "../../../../lib/Hint";

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

benchmarkSuite("test",  {

    ["getHint"]: () => {
        const board:string[][] = getBoardArray(TestBoards.SINGLE_NAKED_SINGLE);
        const solver:Solver = new Solver(board);
        let notes:string[][] = solver.getNotes();
        let hint:JSON = getHint(board, notes, undefined, getBoardArray(TestBoards.SINGLE_NAKED_SINGLE_SOLUTION));
        expect(hint["strategy"]).toBe("AMEND_NOTES");
    }
});