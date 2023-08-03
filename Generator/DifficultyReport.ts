/**
 * The purpose of this file is to calculate the RD score (combined refutation and dependency score) for a bunch of puzzles in order to come up with RD score difficulty ranges for levels like easy.
 * Puzzles will be displayed in a tabular format with puzzle string, source, description, strategies required, number of givens, and RD score.
 * Run this program using the following command while in the Generator folder: npx ts-node DifficultyReport.ts > Report.txt
 */

import { Board } from "./Board";
import { StrategyEnum } from "./Sudoku";

let puzzles:string[] = ["100603700700240560304795080800002400046300100000500008003000809000050307020830010", "000005008000804109002090540230080654700650800085031002020000000050208716008100000", "007900100000700060630000407006000200800000706000008005902004800450000900000000001", "090000060000100450306000100005002001800000040027450000000907000002000000001020800", "006031070437005000010467008029178300000000026300050000805004910003509087790086004", "130000904940830200008500003009005370400900061080060020004107002802306745357200000", "000600080609830000007009610000080190200300000006057000000405008005760400370900501", "050000072009050030080600549006002150100740000500000004090000010734500920800400000",
                        "000006201800000000100200705300010006420700050000000040000002000057030090603509000", "009600001010094027000800040008170400007300000090240053070000902105002000000700000", "000060008000100700604000200030000000090070010800000093028007000005008000000319000", "005307000902500000070020016030000040600000200000905000090000003010000704000482000", "830000009000050000006407200005020000000010300600305080000100000040000020007603400", "060009300070010000301002040010000000000004008905020700000900070203050900600000000", "605107809079403020000080037060500000201000903000002010790030000010904360304801705", "431560000000040000700020040017600900003409100009005680080030002000090000000051863",
                        "709001000014050700020000060450600000002070100000004028080000090007030240000700805", "820000005000010003090408000360500000000789000000003047000304020600070000100000059"];
let sources:string[] = ["http://www.sudokuoftheday.co.uk/", "http://www.sudokuoftheday.co.uk/", "http://www.sudokuoftheday.co.uk/", "http://www.sudokuoftheday.co.uk/", "https://sudoku.com/", "https://sudoku.com/", "https://sudoku.com/", "https://sudoku.com/", "https://sudoku.com/", "https://sudoku.com/", "https://sudoku.com/", "https://sudoku.com/", "https://sudoku.com/", "https://sudoku.com/", "https://www.websudoku.com/", "https://www.websudoku.com/", "https://www.websudoku.com/", "https://www.websudoku.com/"];
let descriptions:string[] = ["Easy level with 3.5/5 stars", "Easy level with 3.5/5 stars", "Medium level with 5/5 stars", "Medium level with 5/5 stars", "Easy", "Easy", "Medium", "Medium", "Hard", "Hard", "Expert", "Expert", "Evil", "Evil", "Easy", "Medium", "Hard", "Evil"];

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
    let board:Board = new Board(puzzles[i]);
    let rdScore:number = board.getDifficulty();
    puzzlesArray.push(new Puzzle(puzzles[i], sources[i], descriptions[i], getStrategyString(board.getStrategies()), 81 - (puzzles[i].match(/0/g) || []).length, rdScore));
}

puzzlesArray.sort((a, b) => (a.rdScore > b.rdScore) ? 1 : -1);

console.table(puzzlesArray);