const START_GAME:string = "api/v1/user/newGame?difficulty=";
const START_GAME_STRATEGIES:string = "&strategies=";

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
        try {
            let res:Response = await fetch(url + START_GAME + JSON.stringify(difficulty) + START_GAME_STRATEGIES + JSON.stringify(strategies), {
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
