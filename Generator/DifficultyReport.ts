/**
 * The purpose of this file is to calculate the RD score (combined refutation and dependency score) for a bunch of puzzles in order to come up with RD score difficulty ranges for levels like easy.
 * Puzzles will be displayed in a tabular format with puzzle string, source, description, strategies required, number of givens, and RD score.
 * Run this program using the following command while in the Generator folder: npx ts-node DifficultyReport.ts > output.txt
 */

import { Board } from "./Board";
import { Cell } from "./Cell";
import { Dependency } from "./Dependency";
import { Refutation } from "./Refutation";
import { StrategyEnum, getBoardArray, getCellBoard, simplifyNotes } from "./Sudoku";

let puzzles:string[] = ["100603700700240560304795080800002400046300100000500008003000809000050307020830010", "000005008000804109002090540230080654700650800085031002020000000050208716008100000", "007900100000700060630000407006000200800000706000008005902004800450000900000000001", "090000060000100450306000100005002001800000040027450000000907000002000000001020800"];
let sources:string[] = ["http://www.sudokuoftheday.co.uk/", "http://www.sudokuoftheday.co.uk/", "http://www.sudokuoftheday.co.uk/", "http://www.sudokuoftheday.co.uk/"];
let descriptions:string[] = ["Easy level with 3.5/5 stars", "Easy level with 3.5/5 stars", "Medium level with 5/5 stars", "Medium level with 5/5 stars"];

function Puzzle(puzzleString, source, description, strategies, givensCount, rdScore) {
    this.puzzleString = puzzleString;
    this.source = source;
    this.description = description;
    this.strategies = strategies;
    this.givensCount = givensCount;
    this.rdScore = rdScore;
}

function getStrategyString(strategies:boolean[]):string {
    let strategyString:string = "";
    for (let i:number = 0; i < strategies.length; i++) {
        if (strategies[i]) {
            strategyString += StrategyEnum[i] + ", ";
        }
    }
    return strategyString.substring(0, strategyString.length - 2);
}

let puzzlesArray = [];

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
    let boardObj:Board = new Board(puzzles[i]);
    let solution:string[][] = boardObj.getSolution();
    let refutationScore:number = Refutation.getRefutationScore(board, solution, 1);
    let dependencyScore:number = Dependency.getDependencyScore(board);
    let rdScore:number = refutationScore + (-1 * dependencyScore);
    puzzlesArray.push(new Puzzle(puzzles[i], sources[i], descriptions[i], getStrategyString(boardObj.getStrategies()), (puzzles[i].match(/0/g) || []).length, rdScore));
}

puzzlesArray.sort((a, b) => (a.rdScore > b.rdScore) ? 1 : -1);

console.table(puzzlesArray);