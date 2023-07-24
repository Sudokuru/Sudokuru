/**
 * The purpose of this file is to calculate the refutation score for a handful of suodku boards and compare them to average human solving times.
 * Benchmarks the refutation score calculation against the number of givens in the board (using correlation coefficient with solving time as metric).
 * Run this program using the following command while in the Generator folder: npx ts-node RefutationBenchmark.ts
 */

import { Cell } from "./Cell";
import { Refutation } from "./Refutation";
import { getBoardArray, getCellBoard, simplifyNotes } from "./Sudoku";

const calculateCorrelation = require("calculate-correlation");

let puzzles:string[] = ["100603700700240560304795080800002400046300100000500008003000809000050307020830010", "007900100000700060630000407006000200800000706000008005902004800450000900000000001", "000000800654090000100600000000000090000082037009030008000500100040129050002040000", "090038070000000380000006400050004900080370600140000000000000200670410009500009000"];
let solutions:string[] = ["152683794798241563364795281835912476946378152217564938573126849681459327429837615", "547962138218743569639851427396517284825439716174628395962174853451386972783295641", "793214865654893271128657943385761492461982537279435618936578124847129356512346789", "491238576765941382823756491357164928289375614146892735914587263672413859538629147"];
let solveTimeSeconds:number[] = [460, 746, 898, 1410];

let refutationScores:number[] = [];
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
    let refutationScore:number = Refutation.getRefutationScore(board, solution);
    refutationScores.push(refutationScore);
    notGivens.push((puzzles[i].match(/0/g) || []).length);
}

console.log("Givens correlation coefficient: " + calculateCorrelation(notGivens, solveTimeSeconds));
console.log("Refutation score correlation coefficient: " + calculateCorrelation(refutationScores, solveTimeSeconds));