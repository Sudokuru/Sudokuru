/**
 * The purpose of this file is to calculate the refutation score for a handful of suodku boards and compare them to average human solving times.
 * Benchmarks the refutation score calculation against the number of givens in the board (using correlation coefficient with solving time as metric).
 * Run this program using the following command while in the Generator folder: npx ts-node RefutationBenchmark.ts
 */

import { Cell } from "./Cell";
import { Dependency } from "./Dependency";
import { Refutation } from "./Refutation";
import { getBoardArray, getCellBoard, simplifyNotes } from "./Sudoku";

const calculateCorrelation = require("calculate-correlation");

let puzzles:string[] = ["100603700700240560304795080800002400046300100000500008003000809000050307020830010", "007900100000700060630000407006000200800000706000008005902004800450000900000000001", "000000800654090000100600000000000090000082037009030008000500100040129050002040000", "090038070000000380000006400050004900080370600140000000000000200670410009500009000",
                        "000005008000804109002090540230080654700650800085031002020000000050208716008100000", "090000060000100450306000100005002001800000040027450000000907000002000000001020800", "002054039700000000050000007005000004040690300020000090007500600000403050000208000", "801000290006500000000089006600003000015000008000600420000000000900428017500700000"];
let solutions:string[] = ["152683794798241563364795281835912476946378152217564938573126849681459327429837615", "547962138218743569639851427396517284825439716174628395962174853451386972783295641", "793214865654893271128657943385761492461982537279435618936578124847129356512346789", "491238576765941382823756491357164928289375614146892735914587263672413859538629147",
                          "946715328573824169812396547231987654794652831685431972127569483359248716468173295", "194285367278136459356749128435892671819673542627451983583967214942518736761324895", "162754839798321546354986217975832164841697325623145798437519682286473951519268473", "871364295396572184254189376629843751415297638738651429147935862963428517582716943"];
let solveTimeSeconds:number[] = [460, 746, 898, 1410, 460, 746, 898, 1410];

let refutationScores:number[] = [];
let dependencyScores:number[] = [];
let rdScores:number[] = [];
let notGivens:number[] = [];

for (let i:number = 0; i < puzzles.length; i++) {
    let board:Cell[][] = getCellBoard(getBoardArray(puzzles[i]));
    // Add all notes to board
    for (let r:number = 0; r < 9; r++) {
        for (let c:number = 0; c < 9; c++) {
            if (board[r][c].isEmpty()) {
                board[r][c].resetNotes();
            }
        }
    }
    // Simplify notes based on givens
    for (let r:number = 0; r < 9; r++) {
        for (let c:number = 0; c < 9; c++) {
            if (!board[r][c].isEmpty()) {
                simplifyNotes(board, r, c);
            }
        }
    }
    let solution:string[][] = getBoardArray(solutions[i]);
    refutationScores.push(Refutation.getRefutationScore(board, solution, 1));
    dependencyScores.push(Dependency.getDependencyScore(board));
    rdScores.push(refutationScores[i] + (-1 * dependencyScores[i]));
    notGivens.push((puzzles[i].match(/0/g) || []).length);
}

console.log("Givens correlation coefficient: " + calculateCorrelation(notGivens, solveTimeSeconds));
console.log("Refutation score correlation coefficient: " + calculateCorrelation(refutationScores, solveTimeSeconds));
console.log("Dependency score correlation coefficient: " + calculateCorrelation(dependencyScores, solveTimeSeconds));
console.log("Combined refutation+dependency score correlation coefficient: " + calculateCorrelation(rdScores, solveTimeSeconds));