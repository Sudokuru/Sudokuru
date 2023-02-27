import { getMaxGameDifficulty } from "../Generator/Board";
import { Hint } from "../Generator/Hint";
import { Solver } from "../Generator/Solver";
import { Strategy } from "../Generator/Strategy";

const START_GAME:string = "api/v1/user/newGame?difficulty=";
const GET_GAME:string = "api/v1/user/activeGames";

/**
* Functions to handle puzzle related operations
*/
export class Puzzles{
   /**
    * Given a difficulty and an user auth token retrieves a random puzzle close to the difficulty that the user hasn't solved before
    * @param url - server url e.g. http://localhost:3001/
    * @param difficulty - difficulty number (between 0 and 1)
    * @param strategies - new game can have subset of these strategies
    * @param token - authentication token
    * @returns promise of puzzle JSON object
    */
    public static async startGame(url: string, difficulty: number, strategies: string[], token: string):Promise<JSON> {
        // If difficulty was put on the standard 1-1000 scale the top portion of the scale would contain strategies user doesn't know
        // Therefore the following code sets difficulty on 1-HardestPossiblePuzzleWithOnlyGivenStrategies scale
        let hardestStrategyDifficulty:number = Strategy.getHighestStrategyDifficultyBound(strategies);
        let hardestGameWithStrategies:number = Math.ceil((getMaxGameDifficulty(hardestStrategyDifficulty)) / 1000);
        difficulty = Math.ceil(difficulty * hardestGameWithStrategies);
        try {
            let res:Response = await fetch(url + START_GAME + JSON.stringify(difficulty), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                }
            });
            let data:JSON = await res.json();
            return data;
        } catch(err) {
            console.log(err);
        }
    }

   /**
    * Given an user auth token retrieves the users active game or returns null if the user doesn't have an active game
    * @param url - server url e.g. http://localhost:3001/
    * @param token - authentication token
    * @returns promise of puzzle JSON object
    */
    public static async getGame(url: string, token: string):Promise<JSON> {
        const res:Response = await fetch(url + GET_GAME, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        });

        if (res.status === 200) {
            const data:JSON = await res.json();
            return data;
        }
        else if (res.status === 404) {
            return null;
        }
        else {
            console.log("Error: " + GET_GAME + " GET request has status " + res.status);
            return null;
        }
    }

    /**
     * Given the state of the board and notes return a hint
     * @param board - 2d board array (9 arrays one for each row, each with 9 strings representing values or "0" if empty)
     * @param notes - 2d notes array (81 arrays one for each cell containing each note that is left in it)
     * @returns JSON object containing hint data
     */
    public static getHint(board: string[][], notes: string[][]):JSON {
        let solver:Solver = new Solver(board, undefined, notes);
        let hint:Hint = solver.nextStep();
        return <JSON><unknown>{
            "strategyType": hint.getStrategyType(),
            "cause": hint.getCause(),
            "groups": hint.getGroups(),
            "placements": hint.getPlacements(),
            "removals": hint.getEffectRemovals(),
            "info": hint.getInfo(),
            "action": hint.getAction()
        };
    }
}
