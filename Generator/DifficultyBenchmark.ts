/**
 * The purpose of this file is to calculate the refutation score for a handful of suodku boards and compare them to average human solving times.
 * Benchmarks the refutation score calculation against the number of givens in the board (using correlation coefficient with solving time as metric).
 * Run this program using the following command while in the Generator folder: npx ts-node DifficultyBenchmark.ts > Benchmarks.txt
 */

import { Cell } from "./Cell";
import { Dependency } from "./Dependency";
import { Refutation } from "./Refutation";
import { getBoardArray, getCellBoard, simplifyNotes } from "./Sudoku";

const calculateCorrelation = require("calculate-correlation");

interface Dataset {
    name:string,
    puzzles:string[],
    solutions:string[],
    solveTimeSeconds:number[]
}

let data:Dataset[] = [];

// Puzzles and solve times from http://www.sudokuoftheday.co.uk/ (solve times are taken from statistics for registered users on specific levels like easy) 
data.push({
    name: "Sudoku of the day 1",
    puzzles: ["100603700700240560304795080800002400046300100000500008003000809000050307020830010", "007900100000700060630000407006000200800000706000008005902004800450000900000000001", "000000800654090000100600000000000090000082037009030008000500100040129050002040000", "090038070000000380000006400050004900080370600140000000000000200670410009500009000"],
    solutions: ["152683794798241563364795281835912476946378152217564938573126849681459327429837615", "547962138218743569639851427396517284825439716174628395962174853451386972783295641", "793214865654893271128657943385761492461982537279435618936578124847129356512346789", "491238576765941382823756491357164928289375614146892735914587263672413859538629147"],
    solveTimeSeconds: [460, 746, 898, 1410]
});

// Puzzles and solve times from http://www.sudokuoftheday.co.uk/ (solve times are taken from statistics for registered users on specific levels like easy) 
data.push({
    name: "Sudoku of the day 2",
    puzzles: ["000005008000804109002090540230080654700650800085031002020000000050208716008100000", "090000060000100450306000100005002001800000040027450000000907000002000000001020800", "002054039700000000050000007005000004040690300020000090007500600000403050000208000", "801000290006500000000089006600003000015000008000600420000000000900428017500700000"],
    solutions: ["946715328573824169812396547231987654794652831685431972127569483359248716468173295", "194285367278136459356749128435892671819673542627451983583967214942518736761324895", "162754839798321546354986217975832164841697325623145798437519682286473951519268473", "871364295396572184254189376629843751415297638738651429147935862963428517582716943"],
    solveTimeSeconds: [460, 746, 898, 1410]
});

// Puzzles I (Greg) solved on Sudokuru frontend twice and took my average time to solve them (rounding up to the nearest second)
data.push({
    name: "Sudokuru 1",
    puzzles: ["640508003135006870728143659213957468000402305000630097071825906092304781486719532", "092146587405238190001079204210365709900004813734091650160452300023917465547683920", "209006148650040390180009007890007436410500279720964010060801954048035720501492603", "800340006043008910001002043370469100100503700520810639905074000410930208700100095"],
    solutions: ["649578123135296874728143659213957468967482315854631297371825946592364781486719532", "392146587475238196681579234218365749956724813734891652169452378823917465547683921", "239756148657148392184329567895217436416583279723964815362871954948635721571492683", "897341526243658917651792843378469152169523784524817639985274361416935278732186495"],
    solveTimeSeconds: [85, 89, 135, 251]
});

// Second set of puzzles that I (Greg) solved on Sudokuru frontend twice and took my average time to solve them (rounding up to the nearest second)
data.push({
    name: "Sudokuru 2",
    puzzles: ["840179600106538420700600080018425376405017298237986514520760843674093150381250069", "246800073100004906935600802410700200050069380683020007590378604800102539000006718", "980004652052689134060120070003246795020001086670090201246900810007002403000460029", "906500870415000000070004501080000600207015030500000082800100706743986215651472390"],
    solutions: ["842179635196538427753642981918425376465317298237986514529761843674893152381254769", "246895173178234956935617842419783265752469381683521497591378624867142539324956718", "981734652752689134364125978813246795429571386675398241246953817597812463138467529", "926531874415768923378294561184329657267815439539647182892153746743986215651472398"],
    solveTimeSeconds: [90, 173, 209, 293]
});


interface DifficultyMetrics {
    refutationScore?:number;
    dependencyScore?:number;
    notGivens?:number;
}

interface PuzzleMetrics {
    puzzle:string;
    solution:string;
    solveTimeSeconds:number;
    difficultyMetrics:DifficultyMetrics;
}

interface CorrelationScores {
    givens:number;
    refutationScore:number;
    dependencyScore:number;
    adjustedDependencyScore:number;
    basicRDScore:number;
}

/**
 * Calculates difficulty metrics for provided puzzle
 * @param puzzle - string representation of the puzzle
 * @param solution - string representation of the solution
 * @returns calculated difficulty metrics for the puzzle
 */
function getDifficultyMetrics(puzzle:string, solution:string):DifficultyMetrics {

    let board:Cell[][] = getCellBoard(getBoardArray(puzzle));
    let solutionBoard:string[][] = getBoardArray(solution);

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

    return {
        refutationScore: Refutation.getRefutationScore(board, solutionBoard, 1),
        dependencyScore: Dependency.getDependencyScore(board),
        notGivens: (puzzle.match(/0/g) || []).length
    };
}

/**
 * Given a puzzle, solution, and solve time, returns metrics for the puzzle
 * @param puzzle - string representation of the puzzle
 * @param solution - string representation of the solution
 * @param solveTimeSeconds - time taken human(s) to solve the puzzle in seconds
 * @returns metrics for the puzzle
 */
function getPuzzleMetrics(puzzle:string, solution:string, solveTimeSeconds:number):PuzzleMetrics {
    let metrics:DifficultyMetrics = getDifficultyMetrics(puzzle, solution);
    return {
        puzzle: puzzle,
        solution: solution,
        solveTimeSeconds: solveTimeSeconds,
        difficultyMetrics: metrics
    };
}

/**
 * Given arrays of puzzles, solutions, and solve times, returns metrics for each puzzle
 * @param puzzles - array of puzzle strings
 * @param solutions - array of solution strings
 * @param solveTimeSeconds - array of solve times in seconds
 * @returns array of metrics for each puzzle
 */
function getPuzzlesMetrics(puzzles:string[], solutions:string[], solveTimeSeconds:number[]):PuzzleMetrics[] {
    let puzzlesMetrics:PuzzleMetrics[] = [];
    for (let i:number = 0; i < puzzles.length; i++) {
        puzzlesMetrics.push(getPuzzleMetrics(puzzles[i], solutions[i], solveTimeSeconds[i]));
    }
    return puzzlesMetrics;
}

/**
 * Adjusts dependency score for number of not givens i.e. makes it so that a hard puzzle with more empty spaces is not considered easier than an easier puzzle with fewer empty spaces
 * @param dependencyScore - raw dependency score
 * @param notGivens - number of not givens
 * @returns dependency score adjusted for number of not givens
 */
function adjustDependencyScore(dependencyScore:number, notGivens:number):number {
    return dependencyScore / (notGivens ** 1.9);
}

/**
 * Given two arrays of numbers, returns the correlation coefficient between the two arrays or 0 if an error occurs
 * @param a - array of numbers
 * @param b - array of numbers
 * @returns correlation coefficient between a and b or 0 if an error occurs
 */
function safeCalculateCorrelation(a:number[], b:number[]):number {
    let correlation:number = calculateCorrelation(a, b);
    if (isNaN(correlation)) {
        return 0;
    }
    return correlation;
}

/**
 * Given an array of metrics for each puzzle, prints correlation scores for givens, refutation score, dependency score, and combined refutation+dependency score
 * @param puzzlesMetrics - array of metrics for each puzzle
 */
function getCorrelationScores(puzzlesMetrics:PuzzleMetrics[], solveTimeSeconds:number[]):CorrelationScores{
    let refutationScores:number[] = [];
    let dependencyScores:number[] = [];
    let notGivens:number[] = [];
    let adjustedDependencyScores:number[] = [];
    let rdScores:number[] = [];

    for (let i:number = 0; i < puzzlesMetrics.length; i++) {
        refutationScores.push(puzzlesMetrics[i].difficultyMetrics.refutationScore);
        dependencyScores.push(puzzlesMetrics[i].difficultyMetrics.dependencyScore);
        notGivens.push(puzzlesMetrics[i].difficultyMetrics.notGivens);
        adjustedDependencyScores.push(adjustDependencyScore(puzzlesMetrics[i].difficultyMetrics.dependencyScore, puzzlesMetrics[i].difficultyMetrics.notGivens));
        rdScores.push(puzzlesMetrics[i].difficultyMetrics.refutationScore + puzzlesMetrics[i].difficultyMetrics.dependencyScore);
    }

    return {
        givens: safeCalculateCorrelation(notGivens, solveTimeSeconds),
        refutationScore: safeCalculateCorrelation(refutationScores, solveTimeSeconds),
        dependencyScore: safeCalculateCorrelation(dependencyScores, solveTimeSeconds),
        adjustedDependencyScore: safeCalculateCorrelation(adjustedDependencyScores, solveTimeSeconds),
        basicRDScore: safeCalculateCorrelation(rdScores, solveTimeSeconds)
    };
}

/**
 * Prints correlation scores
 * @param correlationScores - object containing correlation scores
 */
function printCorrelationScores(correlationScores:CorrelationScores) {
    console.log("Givens correlation coefficient: " + correlationScores.givens);
    console.log("Refutation score correlation coefficient: " + correlationScores.refutationScore);
    console.log("Dependency score correlation coefficient: " + correlationScores.dependencyScore);
    console.log("Adjusted dependency score correlation coefficient: " + correlationScores.adjustedDependencyScore);
    console.log("Basic combined refutation+dependency score correlation coefficient: " + correlationScores.basicRDScore);
    console.log("");
}

let averageCorrelationScores:CorrelationScores = {
    givens: 0,
    refutationScore: 0,
    dependencyScore: 0,
    adjustedDependencyScore: 0,
    basicRDScore: 0
};

for (let i:number = 0; i < data.length; i++) {
    console.log(data[i].name + " data:");
    let puzzlesMetrics:PuzzleMetrics[] = getPuzzlesMetrics(data[i].puzzles, data[i].solutions, data[i].solveTimeSeconds);
    console.table(puzzlesMetrics.map((puzzleMetrics:PuzzleMetrics) => {
        return {
            solveTimeSeconds: puzzleMetrics.solveTimeSeconds,
            refutationScore: puzzleMetrics.difficultyMetrics.refutationScore,
            dependencyScore: puzzleMetrics.difficultyMetrics.dependencyScore,
            adjustedDependencyScore: adjustDependencyScore(puzzleMetrics.difficultyMetrics.dependencyScore, puzzleMetrics.difficultyMetrics.notGivens),
            notGivens: puzzleMetrics.difficultyMetrics.notGivens
        };
    }));
    let correlationScores:CorrelationScores = getCorrelationScores(puzzlesMetrics, data[i].solveTimeSeconds);

    averageCorrelationScores.givens += correlationScores.givens;
    averageCorrelationScores.refutationScore += correlationScores.refutationScore;
    averageCorrelationScores.dependencyScore += correlationScores.dependencyScore;
    averageCorrelationScores.adjustedDependencyScore += correlationScores.adjustedDependencyScore;
    averageCorrelationScores.basicRDScore += correlationScores.basicRDScore;

    printCorrelationScores(correlationScores);
}

averageCorrelationScores.givens /= data.length;
averageCorrelationScores.refutationScore /= data.length;
averageCorrelationScores.dependencyScore /= data.length;
averageCorrelationScores.adjustedDependencyScore /= data.length;
averageCorrelationScores.basicRDScore /= data.length;

console.log("Average correlation scores:");
printCorrelationScores(averageCorrelationScores);