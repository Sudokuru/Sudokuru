import errorHandler from "../HandleError";
import { Solver } from "../Solver";
import { getBoardArray } from "../Sudoku";
import { Hint } from "../Hint";

const expressApp = require('express');
const app = expressApp();
const cors = require("cors");
const port = 3000;

app.use(cors());
app.use(expressApp.urlencoded({ extended: true }));
app.use(expressApp.json());

app.get('/solver/nextStep', (req, res) => {
    let board: string[][] = getBoardArray(req.query.board);
    let solver: Solver = new Solver(board);
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
