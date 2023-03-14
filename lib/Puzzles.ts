import { StrategyEnum } from "../Generator";
import { getMaxGameDifficulty } from "../Generator/Board";
import { Hint } from "../Generator/Hint";
import { Solver } from "../Generator/Solver";
import { Strategy } from "../Generator/Strategy";

const START_GAME:string = "api/v1/user/newGame?difficulty=";
const GET_GAME:string = "api/v1/user/activeGames";
const SAVE_GAME:string = GET_GAME;
const FINISH_GAME:string = GET_GAME;
// HTTP Status Codes
const SUCCESS:number = 200;
const NOT_FOUND:number = 404;

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

        if (res.status === SUCCESS) {
            const data:JSON = await res.json();
            return data;
        }
        else if (res.status === NOT_FOUND) {
            return null;
        }
        else {
            console.log("Error: " + GET_GAME + " GET request has status " + res.status);
            return null;
        }
    }

    /**
     * Given a game saves it to users account and returns true if successful
     * @param url - server url e.g. http://localhost:3001/
     * @param game - activeGame JSON object
     * @param token - authentication token
     */
    public static async saveGame(url: string, game: JSON, token: string):Promise<boolean> {
        const res:Response = await fetch(url + SAVE_GAME, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(game)
        });

        return res.status === SUCCESS;
    }

    /**
    * Given an user auth token deletes the users active game and returns if successful
    * @param url - server url e.g. http://localhost:3001/
    * @param token - authentication token
    * @returns promise of puzzle JSON object
     */
    public static async finishGame(url: string, token: string):Promise<boolean> {
        const res:Response = await fetch(url + FINISH_GAME, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        });

        return res.status === SUCCESS;
    }

    /**
     * Given the state of the board and notes return a hint
     * @param board - 2d board array (9 arrays, one for each row, each with 9 strings representing values or "0" if empty)
     * @param notes - 2d notes array (81 arrays, one for each cell containing each note that is left in it)
     * @param strategies - optional parameter specifying which strategies to use
     * @param solution - optional parameter specifying solution to the given board, used in amend notes strategy to correct user mistakes
     * @returns JSON object containing hint data
     */
    public static getHint(board: string[][], notes: string[][], strategies?: string[], solution?: string[][]):JSON {
        let algorithm:number[];
        if (strategies !== undefined) {
            algorithm = new Array();
            for (let i:number = (StrategyEnum.INVALID + 1); i < StrategyEnum.COUNT; i++) {
                for (let j:number = 0; j < strategies.length; j++) {
                    if (StrategyEnum[i] === strategies[j]) {
                        algorithm.push(i);
                        j = strategies.length;
                    }
                }
            }
        }
        let solver:Solver = new Solver(board, algorithm, notes, solution);
        let hint:Hint = solver.nextStep();
        return <JSON><unknown>{
            "strategy": hint.getStrategy(),
            "cause": hint.getCause(),
            "groups": hint.getGroups(),
            "placements": hint.getPlacements(),
            "removals": hint.getRemovals(),
            "info": hint.getInfo(),
            "action": hint.getAction()
        };
    }
}
