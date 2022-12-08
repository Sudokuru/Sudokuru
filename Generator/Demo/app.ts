import errorHandler from "../HandleError";
import { Solver } from "../Solver";
import { getBoardArray } from "../Sudoku";
import { Hint } from "../Hint";

const expressApp = require('express');
const app = expressApp();
const port = 3000;

app.use(expressApp.urlencoded({ extended: true }));
app.use(expressApp.json());

app.get('/solver/nextStep', (req, res) => {
    let board: string[][] = getBoardArray(req.query.board);
    let solver: Solver = new Solver(board);
    let hint: Hint = solver.nextStep();
    res.send({ board: solver.getBoard(), info: hint.getInfo(), action: hint.getAction() });
});

app.use(errorHandler);

app.listen(port, () => console.log(`Listening on: ${port}`));
