import { getBoardArray } from "../../../Sudoku";
import { Solver } from "../../../Solver";
import { TestBoards } from "../../testResources";
import { getHint } from "../../../../lib/Hint";
import { Bench } from 'tinybench';

const bench = new Bench({ time: 100 });

bench
    .add("getHint", () => {
        const board:string[][] = getBoardArray(TestBoards.SINGLE_NAKED_SINGLE);
        const solver:Solver = new Solver(board);
        let notes:string[][] = solver.getNotes();
        getHint(board, notes, undefined, getBoardArray(TestBoards.SINGLE_NAKED_SINGLE_SOLUTION));
    });

await bench.warmup();
await bench.run();

console.table(bench.table());