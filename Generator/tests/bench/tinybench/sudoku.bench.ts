import { getBoardArray } from "../../../Sudoku";
import { Solver } from "../../../Solver";
import { TestBoards } from "../../testResources";
import { getHint } from "../../../../lib/Hint";
import { Bench, Task } from 'tinybench';

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

const table = (task: Task) => {
    return {
    'Task Name': task.name,
    'ops/sec': task.result.error ? 'NaN' : parseInt(task.result.hz.toString(), 10).toLocaleString(),
    'Average Time (ns)': task.result.error ? 'NaN' : task.result.mean * 1000 * 1000,
    'Average Time (s)': task.result.error ? 'NaN' : task.result.mean / 1000,
    Margin: task.result.error ? 'NaN' : `\xb1${task.result.rme.toFixed(2)}%`,
    Samples: task.result.error ? 'NaN' : task.result.samples.length,
  }
}

console.table(bench.table((task) => (table(task))));