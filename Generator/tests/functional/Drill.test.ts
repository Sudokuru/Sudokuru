import { getDrillPuzzleString } from "../../../lib/Drill";
import { getPuzzleData } from "../../../lib/PuzzleData";
import { getHint } from "../../../lib/Hint";
import { Solver } from "../../Solver";
import { getBoardArray, StrategyEnum } from "../../Sudoku";
import { TestBoards } from "../testResources";

describe("get drill puzzle strings", () => {
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
        console.log("Here is all the puzzle data: " + JSON.stringify(puzzleData));
        console.log("The pointing triplet occurs when there are " + pointingTriplet + " cells filled in.");
        console.log("The hidden single occurs when there are " + hiddenSingle + " cells filled in.");

        // Get the drill puzzle strings
        const drillPuzzleHS = getDrillPuzzleString(puzzleString, hiddenSingle);
        const drillPuzzlePT = getDrillPuzzleString(puzzleString, pointingTriplet);
        // Verify the drill strings have the correct number of cells filled in
        expect(drillPuzzleHS.split('0').length - 1).toBe(81 - hiddenSingle);
        expect(drillPuzzlePT.split('0').length - 1).toBe(81 - pointingTriplet);

        console.log("drill puzzle hidden single: " + drillPuzzleHS);

        let solver = new Solver(getBoardArray(drillPuzzleHS));
        do {
            let hint = getHint(solver.getBoard(), solver.getNotes(), [
                "HIDDEN_SINGLE",

                "AMEND_NOTES",
                "SIMPLIFY_NOTES",
                "OBVIOUS_SINGLE", 
                "OBVIOUS_PAIR",
                "HIDDEN_PAIR",
                "POINTING_PAIR",
                "OBVIOUS_TRIPLET",
                "HIDDEN_TRIPLET",
                "POINTING_TRIPLET",
                "OBVIOUS_QUADRUPLET",
                "HIDDEN_QUADRUPLET",
            ]);
            console.log("Hint available: " + JSON.stringify(hint));
        } while (solver.nextStep());
    });

    it('get drill puzzle string works for a pointing triplet drill', () => {
        // double checking drills solver thingy works
        /*let puzzle = TestBoards.POINTING_TRIPLET_DRILL_SEED;
        let solver = new Solver(getBoardArray(puzzle));
        let move = 1;
        while (solver.nextStep() !== null) {
            let hints = solver.getAllHints();
            let strategies = "";
            hints.forEach((hint) => {
                strategies += hint.getStrategy() + ", ";
            });
            let board = solver.getBoard();
            let boardString: string = "";
            for (let row = 0; row < board.length; row++) {
                for (let col = 0; col < board[row].length; col++) {
                    boardString += board[row][col];
                }
            }
            console.log("State of the board at move " + move + ": " + boardString);
            console.log("Move " + move + " has strategy options: " + strategies);

            if (move === 123) {
                let hiddenSingle = hints[1];
                console.log("this should say hidden single: " + hiddenSingle.getStrategy());
                console.log("The placements are: ");
                let placements = hiddenSingle.getPlacements();
                for (let i: number = 0; i < placements.length; i++) {
                    console.log("" + placements[i]);
                }
                console.log("The cause is ");
                let cause = hiddenSingle.getCause();
                for (let i: number = 0; i < cause.length; i++) {
                    console.log("" + cause[i]);
                }
                // TODO: figure out why hidden single hint is getting generated without any removals
                // that should be impossible!
                let removals = hiddenSingle.getRemovals();
                console.log("The removals are ");
                for (let i: number = 0; i < removals.length; i++) {
                    console.log("" + removals[i]);
                }
            }

            move++;
        }*/
/*
        let solver2 = new Solver(getBoardArray("197568423852394167634172598763285914429716835581943276348629751915837042276000000"), [StrategyEnum.HIDDEN_SINGLE, StrategyEnum.AMEND_NOTES, StrategyEnum.OBVIOUS_SINGLE]);
        let allHints = solver2.getAllHints();
        while (allHints.length === 1) {
            solver2.nextStep();
            allHints = solver2.getAllHints();
        }
        console.log("All hints available are: ");
        allHints.forEach((hint) => {
            console.log("" + hint.getStrategy());
        });
        let hint = solver2.nextStep();
        console.log("The strategy used is " + hint.getStrategy());
        console.log("The cause is ");
        let cause = hint.getCause();
        for (let i: number = 0; i < cause.length; i++) {
            console.log("" + cause[i]);
        }
        let removals = hint.getRemovals();
        console.log("The removals are ");
        for (let i: number = 0; i < removals.length; i++) {
            console.log("" + removals[i]);
        }
*/
    });
});