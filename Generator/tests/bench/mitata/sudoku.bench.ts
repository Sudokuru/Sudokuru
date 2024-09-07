import { benchmarkSuite } from "jest-bench";
import { getBoardArray } from "../../../Sudoku";
import { Solver } from "../../../Solver";
import { TestBoards } from "../../testResources";
import { getHint } from "../../../../lib/Hint";
import { bench, run } from "mitata";

bench("getHint", () => {
    const board:string[][] = getBoardArray(TestBoards.SINGLE_NAKED_SINGLE);
    const solver:Solver = new Solver(board);
    let notes:string[][] = solver.getNotes();
    getHint(board, notes, undefined, getBoardArray(TestBoards.SINGLE_NAKED_SINGLE_SOLUTION));
});

await run();