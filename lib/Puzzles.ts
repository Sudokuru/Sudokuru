import {StrategyEnum} from "../Generator/Sudoku";
import {Hint} from "../Generator/Hint";
import {Solver} from "../Generator/Solver";
import {Strategy} from "../Generator/Strategy";
import {activeGame, gameResults, puzzle, sudokuStrategy, sudokuStrategyArray} from "./Api";

const START_GAME:string = "api/v1/newGame?closestDifficulty=";
const GET_GAME:string = "api/v1/activeGames";
const SAVE_GAME:string = "api/v1/activeGames?puzzle=";
const FINISH_GAME:string = "api/v1/activeGames?puzzle=";
// HTTP Status Codes
const SUCCESS:number = 200;
const NOT_FOUND:number = 404;

// Random games to be used by getRandomGame for landing page
const RANDOM_GAMES:puzzle[][] = [
    [
        {
            "puzzle": "003070040006002301089000000000107080517000006000400000271009005095000000000020000",
            "puzzleSolution": "123675948456982371789314562964157283517238496832496157271849635395761824648523719",
            "strategies": [
                "NAKED_SINGLE",
                "HIDDEN_SINGLE",
                "NAKED_PAIR"
            ],
            "difficulty": 348,
            "drillStrategies": [
                "NAKED_SINGLE",
                "POINTING_PAIR",
                "POINTING_TRIPLET"
            ]
        },
        {
            "puzzle": "020400000006009130000015200000080000300000500800064700014702805000001090000000000",
            "puzzleSolution": "123476958456829137789315246247583619361297584895164723914732865578641392632958471",
            "strategies": [
                "NAKED_SINGLE",
                "HIDDEN_SINGLE"
            ],
            "difficulty": 2,
            "drillStrategies": [
                "POINTING_PAIR",
                "NAKED_TRIPLET",
                "HIDDEN_QUADRUPLET"
            ]
        },
        {
            "puzzle": "103000900006000001009300024000006040060007813817005002090000430000009080000020000",
            "puzzleSolution": "123574968456982371789361524932816745564297813817435692291658437375149286648723159",
            "strategies": [
                "NAKED_SINGLE",
                "HIDDEN_SINGLE"
            ],
            "difficulty": 64,
            "drillStrategies": [
                "NAKED_SINGLE",
                "POINTING_TRIPLET",
                "HIDDEN_QUADRUPLET"
            ]
        },
        {
            "puzzle": "020609780050000090709050340071008000004000000060020000030001000900007020000000160",
            "puzzleSolution": "123649785456873291789152346271938654594716832368524917632481579915367428847295163",
            "strategies": [
                "NAKED_SINGLE",
                "HIDDEN_SINGLE"
            ],
            "difficulty": 654,
            "drillStrategies": [
                "HIDDEN_PAIR",
                "POINTING_TRIPLET"
            ]
        },
        {
            "puzzle": "020700080050091007709304000000500098004010000290000040008060300000180004900000070",
            "puzzleSolution": "123756489456891237789324561317542698864913725295678143578469312632187954941235876",
            "strategies": [
                "NAKED_SINGLE",
                "HIDDEN_SINGLE"
            ],
            "difficulty": 835,
            "drillStrategies": [
                "NAKED_SINGLE",
                "NAKED_QUADRUPLET"
            ]
        },
        {
            "puzzle": "120000000400009017780500034060000003000065000800070002000000400500900001300080050",
            "puzzleSolution": "123647895456839217789512634261498573937265148845371962618753429574926381392184756",
            "strategies": [
                "NAKED_SINGLE",
                "HIDDEN_SINGLE"
            ],
            "difficulty": 96,
            "drillStrategies": [
                "NAKED_PAIR",
                "HIDDEN_PAIR",
                "HIDDEN_TRIPLET",
                "POINTING_TRIPLET",
                "NAKED_QUADRUPLET"
            ]
        },
        {
            "puzzle": "100060500006780300709020406200040005090000021000007030002000800640070000900400000",
            "puzzleSolution": "123964578456781392789523416237149685594836721861257934312695847648372159975418263",
            "strategies": [
                "NAKED_SINGLE",
                "HIDDEN_SINGLE",
                "NAKED_PAIR",
                "HIDDEN_PAIR",
                "POINTING_PAIR"
            ],
            "difficulty": 24,
            "drillStrategies": [
                "HIDDEN_PAIR",
                "POINTING_PAIR",
                "NAKED_TRIPLET"
            ]
        },
        {
            "puzzle": "000050080000003109780000005000320008500090060000000200041006073000002050600007040",
            "puzzleSolution": "123459786456873129789261435967324518512798364834615297241586973378942651695137842",
            "strategies": [
                "NAKED_SINGLE",
                "HIDDEN_SINGLE",
                "NAKED_PAIR"
            ],
            "difficulty": 246
        },
        {
            "puzzle": "000000800450000001009000004030080900800370000000526040000400070608002010007000506",
            "puzzleSolution": "123647895456893721789215634532184967864379152971526348315468279698752413247931586",
            "strategies": [
                "NAKED_SINGLE",
                "HIDDEN_SINGLE",
                "NAKED_PAIR"
            ],
            "difficulty": 622,
            "drillStrategies": [
                "NAKED_PAIR",
            ]
        },
        {
            "puzzle": "020000008000700900000000010007009100000008056240006000005302000890004030300800560",
            "puzzleSolution": "123945678456781923789623415567239184931478256248156397675312849892564731314897562",
            "strategies": [
                "NAKED_SINGLE",
                "HIDDEN_SINGLE",
                "NAKED_PAIR"
            ],
            "difficulty": 291,
            "drillStrategies": [
                "HIDDEN_SINGLE",
                "NAKED_PAIR",
                "POINTING_TRIPLET",
                "NAKED_QUADRUPLET",
            ]
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
    * @param difficulty - difficulty number (between 0 and 1)
    * @param strategies - new game can have subset of these strategies
    * @param token - authentication token
    * @returns promise of puzzle JSON object
    */
    public static async startGame(url: string, difficulty: number, strategies: sudokuStrategyArray, token: string):Promise<puzzle[]> {
        // If difficulty was put on the standard 1-1000 scale the top portion of the scale would contain strategies user doesn't know
        // Therefore the following code sets difficulty on 1-HardestPossiblePuzzleWithOnlyGivenStrategies scale
        let hardestStrategyDifficulty:number = Strategy.getHighestStrategyDifficultyBound(strategies);
        //let hardestGameWithStrategies:number = Math.min(getMaxGameDifficulty(MAX_DIFFICULTY), getMaxGameDifficulty(hardestStrategyDifficulty) * 2);
        let hardestStrategyRatio:number;
        if (strategies.indexOf("POINTING_PAIR") !== -1 || strategies.indexOf("POINTING_TRIPLET") !== -1){
            hardestStrategyRatio = 1;
        }
        else if (strategies.indexOf("HIDDEN_PAIR") !== -1 || strategies.indexOf("HIDDEN_TRIPLET") !== -1 || strategies.indexOf("HIDDEN_QUADRUPLET") !== -1){
            hardestStrategyRatio = 1;
        }
        else if (strategies.indexOf("HIDDEN_SINGLE") !== -1 ){
            hardestStrategyRatio = 1;
        }
        else if (strategies.indexOf("NAKED_PAIR") !== -1 || strategies.indexOf("NAKED_TRIPLET") !== -1 || strategies.indexOf("NAKED_QUADRUPLET") !== -1){
            hardestStrategyRatio = 0.2;
        }
        else if (strategies.indexOf("NAKED_SINGLE") !== -1){
            hardestStrategyRatio = 0.2;
        }
        difficulty = Math.ceil(1000 * (difficulty * (hardestStrategyRatio)));

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
    public static async getGame(url: string, token: string):Promise<activeGame[]> {
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
    public static async saveGame(url: string, game: activeGame, puzzle: string, token: string):Promise<boolean> {
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
    public static async finishGame(url: string, puzzle: string, token: string):Promise<gameResults> {
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
    public static getRandomGame():puzzle[] {
        return RANDOM_GAMES[Math.floor(Math.random() * RANDOM_GAMES.length)];
    }
}
