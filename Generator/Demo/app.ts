import errorHandler from "../HandleError";
import { Solver } from "../Solver";
import { StrategyEnum, getBoardArray } from "../Sudoku";
import { Hint } from "../Hint";

const expressApp = require('express');
const app = expressApp();
const cors = require("cors");
const port = 3001;

app.use(cors());
app.use(expressApp.urlencoded({ extended: true }));
app.use(expressApp.json());

app.get('/solver/nextStep', (req, res) => {
    let board: string[][] = getBoardArray(req.query.board);
    let algorithm: StrategyEnum[] = new Array();
    for (let i: number = 1; i <= StrategyEnum.COUNT; i++) {
        if (Number(req.query.nakedSingle) === i) {
            algorithm.push(StrategyEnum.NAKED_SINGLE);
        }
        else if (Number(req.query.hiddenSingle) === i) {
            algorithm.push(StrategyEnum.HIDDEN_SINGLE);
        }
        else if (Number(req.query.nakedPair) === i) {
            algorithm.push(StrategyEnum.NAKED_PAIR);
        }
    }
    let solver: Solver = new Solver(board, algorithm);
    let hint: Hint = solver.nextStep();
    if (hint !== null) {
        res.send({ board: solver.getBoard(), notes: solver.getNotes(), info: hint.getInfo(), action: hint.getAction() });
    }
    else {
        res.send({ board: solver.getBoard(), notes: null, info: null, action: null });
    }
});

app.use(errorHandler);

app.listen(port, () => console.log(`Listening on: ${port}`));
