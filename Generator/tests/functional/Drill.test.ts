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

        // You might expect to see hidden single at index 44 where board looks like this:
        // 000003206168027053003600007932100748000040639006309521680000395309500800005038160
        // This is an interesting edge case where that hidden single is used right after the
        // final empty cell is filled in by amend notes (can't give drills while empty cells
        // remain cause messes with logic) so it is used before it can be given as a drill
        // This is cause drills are forward looking after applying current next step
        expect(hiddenSingleIndex).toBe(-1);
    });

    it('get drill puzzle string works for simplest case', () => {
        const drillPuzzleString = getDrillPuzzleString(TestBoards.SINGLE_OBVIOUS_SINGLE, 80);
        expect(drillPuzzleString).toBe(TestBoards.SINGLE_OBVIOUS_SINGLE);
    });

    it('end to end test of getting puzzle data -> drills -> drill puzzle string -> drill hint', () => {
        // First get the puzzle data
        const puzzleString = TestBoards.ONLY_OBVIOUS_SINGLES;
        const puzzleData = getPuzzleData(puzzleString) as any;
        console.log(puzzleData); // todo remove this log
        const drills = puzzleData.drills;

        // For each drill assert the puzzle string has correct number of cells filled in and
        // verify the data in each of the drill hints

        const obviousSingle = drills[StrategyEnum.OBVIOUS_SINGLE - StrategyEnum.SIMPLIFY_NOTES - 1];
        const osPuzzle = getDrillPuzzleString(puzzleString, obviousSingle);
        expect(osPuzzle.split('0').length - 1).toBe(81 - obviousSingle);
        let hint:any = getDrillHint(osPuzzle, "OBVIOUS_SINGLE");
        expect(hint.strategy).toBe("OBVIOUS_SINGLE");
        expect(hint.cause).toEqual([[8, 8]]);
        expect(hint.groups).toEqual([]);
        expect(hint.placements).toEqual([[8, 8, 3]]);
        expect(hint.removals).toEqual([]);

        const obviousPair = drills[StrategyEnum.OBVIOUS_PAIR - StrategyEnum.SIMPLIFY_NOTES - 1];
        const opPuzzle = getDrillPuzzleString(puzzleString, obviousPair);
        expect(opPuzzle.split('0').length - 1).toBe(81 - obviousPair);
        hint = getDrillHint(opPuzzle, "OBVIOUS_PAIR");
        expect(hint.strategy).toBe("OBVIOUS_PAIR");
        expect(hint.cause).toEqual([[8, 3], [8, 8]]);
        expect(hint.groups).toEqual([[0, 8]]);
        expect(hint.placements).toEqual([]);
        expect(hint.removals).toEqual([[8, 7, 3, 8]]);

        const hiddenPair = drills[StrategyEnum.HIDDEN_PAIR - StrategyEnum.SIMPLIFY_NOTES - 1];
        const hpPuzzle = getDrillPuzzleString(puzzleString, hiddenPair);
        expect(hpPuzzle.split('0').length - 1).toBe(81 - hiddenPair);
        hint = getDrillHint(hpPuzzle, "HIDDEN_PAIR");
        expect(hint.strategy).toBe("HIDDEN_PAIR");
        expect(hint.cause).toEqual([[1, 1]]);
        expect(hint.groups).toEqual([[1, 1]]);
        expect(hint.placements).toEqual([]);
        expect(hint.removals).toEqual([[8, 1, 9]]);

        const hiddenTriplet = drills[StrategyEnum.HIDDEN_TRIPLET - StrategyEnum.SIMPLIFY_NOTES - 1];
        const htPuzzle = getDrillPuzzleString(puzzleString, hiddenTriplet);
        expect(htPuzzle.split('0').length - 1).toBe(81 - hiddenTriplet);
        hint = getDrillHint(htPuzzle, "HIDDEN_TRIPLET");
        expect(hint.strategy).toBe("HIDDEN_TRIPLET");
        expect(hint.cause).toEqual([[ 8, 1 ], [ 8, 2 ], [ 8, 4 ]]);
        expect(hint.groups).toEqual([[0, 8]]);
        expect(hint.placements).toEqual([]);
        expect(hint.removals).toEqual([[ 8, 3, 2, 4, 7 ], [ 8, 7, 2, 4, 7 ], [ 8, 8, 2, 4, 7 ]]);

        const obviousQuad = drills[StrategyEnum.OBVIOUS_QUADRUPLET - StrategyEnum.SIMPLIFY_NOTES - 1];
        const oqPuzzle = getDrillPuzzleString(puzzleString, obviousQuad);
        expect(oqPuzzle.split('0').length - 1).toBe(81 - obviousQuad);
        hint = getDrillHint(oqPuzzle, "OBVIOUS_QUADRUPLET");
        expect(hint.strategy).toBe("OBVIOUS_QUADRUPLET");
        expect(hint.cause).toEqual([[ 8, 1 ], [ 8, 2 ], [ 8, 3 ], [8, 8]]);
        expect(hint.groups).toEqual([[0, 8]]);
        expect(hint.placements).toEqual([]);
        expect(hint.removals).toEqual([[ 8, 7, 2, 3, 4, 8 ]]);

        const hiddenQuad = drills[StrategyEnum.HIDDEN_QUADRUPLET - StrategyEnum.SIMPLIFY_NOTES - 1];
        const hqPuzzle = getDrillPuzzleString(puzzleString, hiddenQuad);
        expect(hqPuzzle.split('0').length - 1).toBe(81 - hiddenQuad);
        hint = getDrillHint(hqPuzzle, "HIDDEN_QUADRUPLET");
        expect(hint.strategy).toBe("HIDDEN_QUADRUPLET");
        expect(hint.cause).toEqual([[ 7, 1 ], [ 7, 4 ], [ 7, 5 ]]);
        expect(hint.groups).toEqual([[0, 7]]);
        expect(hint.placements).toEqual([]);
        expect(hint.removals).toEqual([[ 7, 3, 3, 4, 5 ], [ 7, 7, 3, 4, 5 ], [ 7, 8, 3, 4, 5 ]]);
    });

});