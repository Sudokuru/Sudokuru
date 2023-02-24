import { getMaxGameDifficulty } from "../Generator/Board";
import { Strategy } from "../Generator/Strategy";

const START_GAME:string = "api/v1/user/newGame?difficulty=";

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
    * @returns puzzle JSON object
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
}
