import { getDrillHint, getDrillPuzzleString } from "../../../lib/Drill";
import { getPuzzleData } from "../../../lib/PuzzleData";
import { getHint } from "../../../lib/Hint";
import { Solver } from "../../Solver";
import { getBoardArray, StrategyEnum, SudokuEnum } from "../../Sudoku";
import { TestBoards } from "../testResources";
import { Strategy } from "../../Strategy";
import { Board } from "../../Board";

function getDrillIndex(drills: number[], strategy: StrategyEnum): number {
    return drills[strategy - StrategyEnum.SIMPLIFY_NOTES - 1];
}

describe("get drill puzzle strings", () => {
    it('drill indexes in puzzle data are correct', () => {
        let boardObj: Board = new Board(TestBoards.HIDDEN_SINGLE_DRILL);
        let drills: number[] = boardObj.getDrills();
        let obviousSingleIndex: number = getDrillIndex(drills, StrategyEnum.OBVIOUS_SINGLE);
        let hiddenSingleIndex: number = getDrillIndex(drills, StrategyEnum.HIDDEN_SINGLE);

        expect(obviousSingleIndex).toBe(80);

        /**
         * Was getting a hidden single here:
         * let drillPuzzle = getDrillPuzzleString(TestBoards.HIDDEN_SINGLE_DRILL, 77);
         * which returned: 547893216168427953293615487932156748851742639476389521684271395309564872005938160
         * which is nothing but obvious singles so the issue where simplify notes is not being run
         * before trying to find drills is there, think based on using a solver that 44 should be the
         * real last move so this test should work once I fix that
         */

        expect(hiddenSingleIndex).toBe(44);
    });

    it('get drill puzzle string works for simplest case', () => {
        const drillPuzzleString = getDrillPuzzleString(TestBoards.SINGLE_OBVIOUS_SINGLE, 80);
        expect(drillPuzzleString).toBe(TestBoards.SINGLE_OBVIOUS_SINGLE);
    });

    it('end to end test of getting puzzle data -> drills -> drill puzzle string -> drill hint', () => {
        // First get the puzzle data
        const puzzleString = TestBoards.ONLY_OBVIOUS_SINGLES;
        const puzzleData = getPuzzleData(puzzleString) as any;
        const drills = puzzleData.drills;
        const hiddenSingle = drills[StrategyEnum.HIDDEN_SINGLE - StrategyEnum.SIMPLIFY_NOTES - 1];
        const pointingTriplet = drills[StrategyEnum.POINTING_TRIPLET - StrategyEnum.SIMPLIFY_NOTES - 1];
        //console.log("Here is all the puzzle data: " + JSON.stringify(puzzleData));
        //console.log("The pointing triplet occurs when there are " + pointingTriplet + " cells filled in.");
        //console.log("The hidden single occurs when there are " + hiddenSingle + " cells filled in.");

        // Get the drill puzzle strings
        const drillPuzzleHS = getDrillPuzzleString(puzzleString, hiddenSingle);
        const drillPuzzlePT = getDrillPuzzleString(puzzleString, pointingTriplet);
        // Verify the drill strings have the correct number of cells filled in
        expect(drillPuzzleHS.split('0').length - 1).toBe(81 - hiddenSingle);
        expect(drillPuzzlePT.split('0').length - 1).toBe(81 - pointingTriplet);

        // Verify can get the drill hints using the drill puzzles
        let hint:any = getDrillHint(drillPuzzleHS, "HIDDEN_SINGLE");
        expect(hint.strategy).toBe("HIDDEN_SINGLE");
        // TODO: thoroughly assert aspects of both drill hints
        // TODO: document getDrillHint in README and expose via API
    });

});