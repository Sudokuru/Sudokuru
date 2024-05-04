import { Board } from "../../Board";
import { next, resetSeed } from "../../Random";

const calculateCorrelation = require("calculate-correlation");

describe("solve boards of varying difficulty", () => {
    it("solve sudokuru 1 dataset and verify solutions and difficulty correlation", () => {
        let puzzles:string[] = ["640508003135006870728143659213957468000402305000630097071825906092304781486719532", "092146587405238190001079204210365709900004813734091650160452300023917465547683920", "209006148650040390180009007890007436410500279720964010060801954048035720501492603", "800340006043008910001002043370469100100503700520810639905074000410930208700100095"];
        let solutions:string[] = ["649578123135296874728143659213957468967482315854631297371825946592364781486719532", "392146587475238196681579234218365749956724813734891652169452378823917465547683921", "239756148657148392184329567895217436416583279723964815362871954948635721571492683", "897341526243658917651792843378469152169523784524817639985274361416935278732186495"];
        let solveTimeSeconds:number[] = [85, 89, 135, 251];
        let difficulties:number[] = [];
        for (let i:number = 0; i < puzzles.length; i++) {
            let b:Board = new Board(puzzles[i]);
            difficulties.push(b.getDifficulty());
            expect(b.getSolutionString()).toBe(solutions[i]);
        }
        expect(calculateCorrelation(difficulties, solveTimeSeconds)).toBeGreaterThan(0.95);
    });

    afterEach(() => {
        // Reset seed after each test to ensure consistent results
        resetSeed();
    });
});