import { getDrillPuzzleString } from "../../../lib/Drill";
import { getPuzzleData } from "../../../lib/PuzzleData";
import { getHint } from "../../../lib/Hint";
import { Solver } from "../../Solver";
import { getBoardArray, StrategyEnum } from "../../Sudoku";
import { TestBoards } from "../testResources";
import { Strategy } from "../../Strategy";

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
        //console.log("Here is all the puzzle data: " + JSON.stringify(puzzleData));
        //console.log("The pointing triplet occurs when there are " + pointingTriplet + " cells filled in.");
        //console.log("The hidden single occurs when there are " + hiddenSingle + " cells filled in.");

        // Get the drill puzzle strings
        const drillPuzzleHS = getDrillPuzzleString(puzzleString, hiddenSingle);
        const drillPuzzlePT = getDrillPuzzleString(puzzleString, pointingTriplet);
        // Verify the drill strings have the correct number of cells filled in
        expect(drillPuzzleHS.split('0').length - 1).toBe(81 - hiddenSingle);
        expect(drillPuzzlePT.split('0').length - 1).toBe(81 - pointingTriplet);

        //console.log("drill puzzle hidden single: " + drillPuzzleHS);

        let solver = new Solver(getBoardArray(drillPuzzleHS));
        /*do {
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
        } while (solver.nextStep());*/
    });

    it('narrow issue', () => {
        const drillPuzzleStringHS = "316984752298157346574623819423718695765439128189562437851396274637045980942001500";
        const drillPuzzleHS = getBoardArray(drillPuzzleStringHS);

        //let solver = new Solver(drillPuzzleHS);
        let solver = new Solver(getBoardArray(TestBoards.ONLY_OBVIOUS_SINGLES));
        let hint = solver.nextStep();
        while (hint !== null) {
            let hints = solver.getAllHints();

            // Sometimes there are zero hints available which is a big issue
            // But somehow nextStep keeps on?
            // only two differences between how nextStep gets a valid hint and how setAllHints
            // for drills gets none or invalid one so must be one of these thigns at issue:
            // 1. setHint creates new Hint(strategyObj) whereas
            //    drills use strategyObj.getDrillHint()
            // 2. drills setAllHints pass in 2nd arg drill to setStrategyType as true

            // wait a minute, this is weird, if we find a second instance of a drill hint then
            // we reset the strategy type but not the drill hint and still returns true from
            // isStrategy! think should instead set drill hint back to null and if in hint then
            // return whether or not drill hint is null!
            // actually nvm that is expected it does return false if it's a diff drill but if
            // it found the same drill twice it just resets

            // So that was dead end so far, next step is to actually trace through the isStrategy
            // call for the hidden single that does not exist

            if (hints.length === 0) {
                //console.log("Uh oh, there are zero hints available?!");
                // actually this is ok cause some hints can't be drills
            }

            let strategies = "";
            hints.forEach((hint) => {
                strategies += hint.getStrategy() + ", ";
            });
            //console.log("Hints available at this step are: " + strategies);

            if (solver.getPlacedCount() === 75 && hints.length > 1 && hints[1].getStrategy() === "HIDDEN_SINGLE") {
                console.log("this is the place!");

                // Creating strategy obj just like setAllHints does
                let hs = new Strategy(solver.cellBoard, solver.board, solver.emptyCells, solver.solution);
                //if (hs.setStrategyType(StrategyEnum.HIDDEN_SINGLE, true)) {
                //    console.log("Replicated the error!");
                //}
                // going to follow it one step further to isStrategy:
                if (hs.isStrategy(StrategyEnum.HIDDEN_SINGLE, true)) {
                    console.log("followed issue to isStrategy");
                }
            }

            let board = solver.getBoard();
            let boardString: string = "";
            for (let row = 0; row < board.length; row++) {
                for (let col = 0; col < board[row].length; col++) {
                    boardString += board[row][col];
                }
            }

            //console.log("state of the board: " + boardString);
            //console.log("the placement count is: " + solver.getPlacedCount());
            //console.log("--------------------\n");

            hint = solver.nextStep();
        }
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