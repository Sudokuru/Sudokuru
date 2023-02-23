const START_GAME:string = "api/v1/user/activeGames/newGame";

/**
* Functions to handle puzzle related operations
*/
export class Puzzles{
   /**
    * Given a difficulty and an user auth token retrieves a random puzzle close to the difficulty that the user hasn't solved before
    * @param url - server url e.g. http://localhost:3001/
    * @param difficulty - difficulty integer
    * @param token - authentication token
    * @returns puzzle JSON object
    */
   public static async startGame(url: string, difficulty: number, token: string):Promise<JSON> {
       try {
           let res:Response = await fetch(url + START_GAME, {
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
