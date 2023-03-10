import errorHandler from "../HandleError";
import { Solver } from "../Solver";
import { StrategyEnum, getBoardArray } from "../Sudoku";
import { Hint } from "../Hint";
import * as fs from 'fs';
import * as readline from 'readline';
import { Puzzles } from "../../lib/Puzzles";
import { Board } from "../Board";

const expressApp = require('express');
const app = expressApp();
const cors = require("cors");
const port = 3001;

const activeGame = {
    userID: "",
    puzzle: "003070040006002301089000000000107080517000006000400000271009005095000000000020000",
    currentTime: 0,
    moves: [{
        puzzleCurrentState: "000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        puzzleCurrentNotesState: "111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111"
    }],
    numHintsAskedFor: 0,
    numWrongCellsPlayed: 0,
    numWrongCellsPlayedPerStrategy: {
        NAKED_SINGLE: 0,
        HIDDEN_SINGLE: 0,
        NAKED_PAIR: 0,
        NAKED_TRIPLET: 0,
        NAKED_QUADRUPLET: 0,
        NAKED_QUINTUPLET: 0,
        NAKED_SEXTUPLET: 0,
        NAKED_SEPTUPLET: 0,
        NAKED_OCTUPLET: 0,
        HIDDEN_PAIR: 0,
        HIDDEN_TRIPLET: 0,
        HIDDEN_QUADRUPLET: 0,
        HIDDEN_QUINTUPLET: 0,
        HIDDEN_SEXTUPLET: 0,
        HIDDEN_SEPTUPLET: 0,
        HIDDEN_OCTUPLET: 0,
        POINTING_PAIR: 0,
        POINTING_TRIPLET: 0,
        BOX_LINE_REDUCTION: 0,
        X_WING: 0,
        SWORDFISH: 0,
        SINGLES_CHAINING: 0
    }
};

app.use(cors());
app.use(expressApp.urlencoded({ extended: true }));
app.use(expressApp.json());

app.get('/solver/nextStep', (req, res) => {
    let board: string[][] = getBoardArray(req.query.board);
    let algorithm: StrategyEnum[] = new Array();
    for (let i: number = 1; i <= StrategyEnum.COUNT; i++) {
        if (Number(req.query.amendNotes) === i) {
            algorithm.push(StrategyEnum.AMEND_NOTES);
        }
        else if (Number(req.query.nakedSingle) === i) {
            algorithm.push(StrategyEnum.NAKED_SINGLE);
        }
        else if (Number(req.query.hiddenSingle) === i) {
            algorithm.push(StrategyEnum.HIDDEN_SINGLE);
        }
        else if (Number(req.query.nakedPair) === i) {
            algorithm.push(StrategyEnum.NAKED_PAIR);
        }
        else if (Number(req.query.nakedTriplet) === i) {
            algorithm.push(StrategyEnum.NAKED_TRIPLET);
        }
        else if (Number(req.query.nakedQuadruplet) === i) {
            algorithm.push(StrategyEnum.NAKED_QUADRUPLET);
        }
        else if (Number(req.query.nakedQuintuplet) === i) {
            algorithm.push(StrategyEnum.NAKED_QUINTUPLET);
        }
        else if (Number(req.query.nakedSextuplet) === i) {
            algorithm.push(StrategyEnum.NAKED_SEXTUPLET);
        }
        else if (Number(req.query.nakedSeptuplet) === i) {
            algorithm.push(StrategyEnum.NAKED_SEPTUPLET);
        }
        else if (Number(req.query.nakedOctuplet) === i) {
            algorithm.push(StrategyEnum.NAKED_OCTUPLET);
        }
        else if (Number(req.query.simplifyNotes) === i) {
            algorithm.push(StrategyEnum.SIMPLIFY_NOTES);
        }
    }
    let notes: string[][];
    if (req.query.notes !== "undefined") {
        notes = JSON.parse(req.query.notes);
    }
    else {
        notes = undefined;
    }
    let solver: Solver = new Solver(board, algorithm, notes);
    let hint: Hint = solver.nextStep();
    if (hint !== null) {
        res.send({ board: solver.getBoard(), notes: solver.getNotes(), info: hint.getInfo(), action: hint.getAction(), cause: hint.getCause(), groups: hint.getGroups() });
    }
    else {
        res.send({ board: solver.getBoard(), notes: null, info: null, action: null, cause: null, groups: null });
    }
});

app.get('/getHint', (req, res) => {
    let solution:string[][] = (new Board(req.query.boardString)).getSolution();
    res.send(Puzzles.getHint(JSON.parse(req.query.board), JSON.parse(req.query.notes), undefined, solution));
});

app.get('/api/v1/user/newGame', (req, res) => {
    // Overwrites activeGame.txt with activeGame constant and then returns it
    try {
        let writer = fs.createWriteStream('activeGame.txt');
        writer.write(JSON.stringify(activeGame));
        writer.end();
    } catch(err) {
        console.log(err);
    }
    res.send(activeGame);
});

app.get('/api/v1/user/activeGames', (req, res) => {
    // Gets the current activeGame from activeGame.txt or throws 404 error if activeGame.txt doesn't exist
    if (!fs.existsSync("activeGame.txt")) {
        res.sendStatus(404);
        return;
    }

    const rl = readline.createInterface({
        input: fs.createReadStream("activeGame.txt"),
        crlfDelay: Infinity
    });
    rl.on('line', (line) => {
        res.send(JSON.parse(line));
    });
});

app.get('/api/v1/user/drill', (req, res) => {
    res.send({ puzzle: "003070040006002301089000000000107080517000006000400000271009005095000000000020000" });
});

app.use(errorHandler);

app.listen(port, () => console.log(`Listening on: ${port}`));
