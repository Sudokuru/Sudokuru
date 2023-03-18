import { Solver } from "../Generator/Solver";
import { StrategyEnum, getBoardArray } from "../Generator/Sudoku";

const GET_DRILL_GAME:string = "api/v1/drillGames?drillStrategies[]=";

interface getDrillGameResponse {
    puzzle: string
}

/**
 * Functions to handle requesting drills
 */
export class Drills{
    public static strategies:string[][] = [
        ["NAKED_SET", "NAKED_SINGLE", "NAKED_PAIR", "NAKED_TRIPLET", "NAKED_QUADRUPLET", "NAKED_QUINTUPLET", "NAKED_SEXTUPLET", "NAKED_SEPTUPLET", "NAKED_OCTUPLET"],
        ["HIDDEN_SET", "HIDDEN_SINGLE"]
    ];

    public static async getGame(url: string, strategy: string, token: string):Promise<JSON> {
        const res:Response = await fetch(url + GET_DRILL_GAME + strategy, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        });

        if (res.status === 200) {
            let data:getDrillGameResponse = await res.json();
            let boardString:string = data[0].puzzle;
            let solver:Solver = new Solver(getBoardArray(boardString));
            let notes:string = solver.getNotesString();
            // Simplifies notes
            while ((solver.nextStep()).getStrategyType() <= StrategyEnum.SIMPLIFY_NOTES) {
                notes = solver.getNotesString();
            }
            return <JSON><unknown>{
                "puzzleCurrentState": boardString,
                "puzzleCurrentNotesState": notes
            };
        }
        else if (res.status === 404) {
            return null;
        }
        else {
            console.log("Error: " + GET_DRILL_GAME + " GET request has status " + res.status);
            return null;
        }
    }
}