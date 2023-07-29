import {StrategyEnum} from "../Generator/Sudoku";
import {Hint} from "../Generator/Hint";
import {Solver} from "../Generator/Solver";
import { Strategy} from "../Generator/Strategy";

const START_GAME:string = "api/v1/newGame?closestDifficulty=";
const GET_GAME:string = "api/v1/activeGames";
const SAVE_GAME:string = "api/v1/activeGames?puzzle=";
const FINISH_GAME:string = "api/v1/activeGames?puzzle=";
// HTTP Status Codes
const SUCCESS:number = 200;
const NOT_FOUND:number = 404;
// Random games to be used by getRandomGame for landing page
interface GAME {
    userID: string;
    puzzle: string;
    puzzleSolution: string;
    difficulty: number;
    currentTime: number;
    numHintsUsed: number;
    numWrongCellsPlayed: number;
    _id: string;
    moves: any[];
    __v: number;
}
const RANDOM_GAMES:GAME[][] = [
    [
        {
            "userID": "",
            "puzzle": "003006908450000037000001000004900800007000002290700010040000300900502600000100000",
            "puzzleSolution": "123476958456298137789351264614925873837614592295783416541867329978532641362149785",
            "difficulty": 1000,
            "currentTime": 0,
            "numHintsUsed": 0,
            "numWrongCellsPlayed": 0,
            "_id": "",
            "moves": [],
            "__v": 0
        }
    ],
    [
        {
            "userID": "",
            "puzzle": "000004000056000030000000610040300007900100058800000020000002000010609000300510070",
            "puzzleSolution": "123764589456891732789253614241385967937126458865947321678432195512679843394518276",
            "difficulty": 1000,
            "currentTime": 0,
            "numHintsUsed": 0,
            "numWrongCellsPlayed": 0,
            "_id": "",
            "moves": [],
            "__v": 0
        }
    ],
    [
        {
            "userID": "",
            "puzzle": "100470000450008000000000000030000700071903840000027001008000005090100307540002000",
            "puzzleSolution": "123476958456298173789531264835614792271953846964827531318769425692145387547382619",
            "difficulty": 1000,
            "currentTime": 0,
            "numHintsUsed": 0,
            "numWrongCellsPlayed": 0,
            "_id": "",
            "moves": [],
            "__v": 0
        }
    ],
    [
        {
            "userID": "",
            "puzzle": "100064070000007002089000100030400080500000000090003007000000800000089006067000300",
            "puzzleSolution": "123964578456817932789352164231475689574698213698123457945736821312589746867241395",
            "difficulty": 1000,
            "currentTime": 0,
            "numHintsUsed": 0,
            "numWrongCellsPlayed": 0,
            "_id": "",
            "moves": [],
            "__v": 0
        }
    ],
    [
        {
            "userID": "",
            "puzzle": "000400000000972000080005060205010000340020090001000003010000085000000007674050100",
            "puzzleSolution": "123486759456972318789135264295314876347628591861597423912743685538261947674859132",
            "difficulty": 966,
            "currentTime": 0,
            "numHintsUsed": 0,
            "numWrongCellsPlayed": 0,
            "_id": "",
            "moves": [],
            "__v": 0
        }
    ]
];

/**
* Functions to handle puzzle related operations
*/
export class Puzzles{
   /**
    * Given a difficulty and an user auth token retrieves a random puzzle close to the difficulty that the user hasn't solved before
    * @param url - server url e.g. http://localhost:3100/
    * @param difficulty - difficulty integer (see Report.txt for example values)
    * @param strategies - new game can have subset of these strategies
    * @param token - authentication token
    * @returns promise of puzzle JSON object
    */
    public static async startGame(url: string, difficulty: number, strategies: string[], token: string):Promise<JSON> {
       let concatUrlString = ""
       for (let i = 0; i < strategies.length; i++){
           concatUrlString = concatUrlString + "&learnedStrategies[]=" + strategies[i];
       }

        const res:Response = await fetch(url + START_GAME + JSON.stringify(difficulty) + concatUrlString, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        });

       if (res.status === SUCCESS) {
           return await res.json();
       }
       else {
           console.log("Error: " + START_GAME + " GET request has status " + res.status);
           return null;
       }
    }

   /**
    * Given an user auth token retrieves the users active game or returns null if the user doesn't have an active game
    * @param url - server url e.g. http://localhost:3100/
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
            return await res.json();
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
     * @param url - server url e.g. http://localhost:3100/
     * @param game - activeGame JSON object
     * @param puzzle activeGame puzzle string
     * @param token - authentication token
     */
    public static async saveGame(url: string, game: JSON, puzzle: string, token: string):Promise<boolean> {
        const res:Response = await fetch(url + SAVE_GAME + JSON.stringify(puzzle), {
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
     * @param url - server url e.g. http://localhost:3100/
     * @param puzzle activeGame puzzle string
     * @param token - authentication token
     * @returns promise of puzzle JSON object
     */
    public static async finishGame(url: string, puzzle: string, token: string):Promise<boolean> {
        const res:Response = await fetch(url + FINISH_GAME + JSON.stringify(puzzle), {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        });

        if (res.status === SUCCESS) {
            return await res.json();
        }
        else if (res.status === NOT_FOUND) {
            return null;
        }
        else {
            console.log("Error: " + FINISH_GAME + " DELETE request has status " + res.status);
            return null;
        }
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

    /**
     * Returns a random game to be displayed on the landing page
     * @returns JSON puzzle object
     */
    public static getRandomGame():GAME[] {
        return RANDOM_GAMES[Math.floor(Math.random() * RANDOM_GAMES.length)];
    }
}
