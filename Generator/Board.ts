import { CustomError, CustomErrorEnum } from "./CustomError";
import { anyCellsEqual, checkBoardForDuplicates, getBoardArray, getCellBoard, simplifyNotes, SudokuEnum } from "./Sudoku";
import { Solver } from "./Solver";
import { Hint } from "./Hint";
import { StrategyEnum } from "./Sudoku"
import { Cell } from "./Cell";
import { Dependency } from "./Dependency";
import { Refutation } from "./Refutation";

/**
 * Constructed using board string
 * Throws exception if invalid board
 * Returns:
 * Board (2d array, one array per row each containing one string per cell)
 * Solution (2d array or string)
 * Most complex strategy that could be needed to solve
 * Difficulty (integer on scale)
 */

export class Board{
    private board: string[][];
    private solution: string[][];
    private solutionString: string;
    private strategies: boolean[];
    private moveStrategies: boolean[][]; // stores drillStrategies for each move
    private drills: boolean[];
    private difficulty: number;
    private solver: Solver;
    private givensCount: number;

    /**
     * Creates board object if valid, otherwise throws error
     * @param board - 81 length board string (left to right, top to bottom)
     */
    constructor(board:string);

    /**
     * Creates board object if valid, otherwise throws error
     * @param board - 81 length board string (left to right, top to bottom)
     * @param algorithm - specific order to apply strategies
     */
    constructor(board:string, algorithm: StrategyEnum[]);

    constructor(board: string, algorithm?: StrategyEnum[]) {

        this.validatePuzzle(board);

        this.board = getBoardArray(board);

        this.strategies = new Array(StrategyEnum.COUNT).fill(false);
        this.drills = new Array(StrategyEnum.COUNT).fill(false);
        this.moveStrategies = new Array();

        if (algorithm === undefined) {
            this.solver = new Solver(this.board);
        }
        else {
            this.solver = new Solver(this.board, algorithm);
        }

        this.givensCount = this.solver.getPlacedCount();

        this.drills = this.getDrillStrategies();

        this.solve();
        this.setDifficulty();
    }

    /**
     * Get board array
     * @returns board array
     */
    public getBoard():string[][] {
        return this.board;
    }

    /**
     * Get solution array
     * @returns solution array
     */
    public getSolution():string[][] {
        return this.solution;
    }

    /**
     * Get solution string
     * @returns solution string
     */
    public getSolutionString():string {
        return this.solutionString;
    }

    /**
     * Get boolean array containing strategies used by Solver
     * @returns strategies boolean array
     */
    public getStrategies():boolean[] {
        return this.strategies;
    }

    /**
     * Get difficulty
     * @returns difficulty
     */
    public getDifficulty():number {
        return this.difficulty;
    }

    /**
     * Get drills
     * @returns drills
     */
    public getDrills():boolean[] {
        return this.drills;
    }

    /**
     * Get givensCount
     * @returns number of givens
     */
    public getGivensCount():number {
        return this.givensCount;
    }

    /**
     * Returns a boolean array representing strategies that can be used as the first step in solving this board
     * If a strategies prereqs are included then it is excluded in order to ensure good examples of strategies are used
     * For example, if there is a naked pair made up of two naked singles only the naked single will be used as a drill
     * Excludes amend and simplify notes as well as any strategies past hidden quadruplet in StrategyEnum (so index 0 is naked single and index 9 is hidden quadruplet)
     * @returns boolean array representing strategies that can be used as the first step in solving this board
     */
    private getDrillStrategies():boolean[] {
        // Run through all of the simplify notes so drills that require notes to be removed can be added
        let solver:Solver = new Solver(this.board);
        let hints:Hint[] = solver.getAllHints();
        // Skips over the early game amend and simplify strategies from hints
        while ((solver.nextStep()).getStrategyType() <= StrategyEnum.SIMPLIFY_NOTES) {
            hints = solver.getAllHints();
        }
        // Adds drills
        let drillStrategies:boolean[] = new Array(StrategyEnum.COUNT).fill(false);
        let drillCells:Cell[][] = new Array(StrategyEnum.COUNT);
        for (let i:number = 0; i < hints.length; i++) {
            drillStrategies[hints[i].getStrategyType()] = true;
            drillCells[hints[i].getStrategyType()] = hints[i].getCellsCause();
        }
        // Removes strategies whose prereqs are included
        for (let i:number = 0; i < drillStrategies.length; i++) {
            if (drillStrategies[i]) {
                let prereqs:StrategyEnum[] = this.getPrereqs(i);
                for (let j:number = 0; j < prereqs.length; j++) {
                    // Checks if there is a drill that is a prereq of the current drill, if so sees if they overlap in which case drill is excluded
                    if (drillStrategies[prereqs[j]]) {
                        let drillA:Cell[] = drillCells[i];
                        let drillB:Cell[] = drillCells[prereqs[j]];
                        if (anyCellsEqual(drillA, drillB)) {
                            drillStrategies[i] = false;
                            j = prereqs.length;
                        }
                    }
                }
            }
        }
        return drillStrategies.slice(StrategyEnum.NAKED_SINGLE, StrategyEnum.HIDDEN_QUADRUPLET + 1);
    }

    /**
     * Given a strategy returns an array containing its prereqs
     * @param strategy - strategy getting prereqs for
     * @returns array of prereqs for the given strategy
     */
    private getPrereqs(strategy: StrategyEnum):StrategyEnum[] {
        let prereqs:StrategyEnum[] = new Array();
        if (strategy === StrategyEnum.HIDDEN_OCTUPLET) {
            prereqs.push(StrategyEnum.NAKED_OCTUPLET);
            strategy = StrategyEnum.NAKED_OCTUPLET;
        }
        if (strategy === StrategyEnum.NAKED_OCTUPLET || strategy === StrategyEnum.HIDDEN_SEPTUPLET) {
            prereqs.push(StrategyEnum.NAKED_SEPTUPLET);
            strategy = StrategyEnum.NAKED_SEPTUPLET;
        }
        if (strategy === StrategyEnum.NAKED_SEPTUPLET || strategy === StrategyEnum.HIDDEN_SEXTUPLET) {
            prereqs.push(StrategyEnum.NAKED_SEXTUPLET);
            strategy = StrategyEnum.NAKED_SEXTUPLET;
        }
        if (strategy === StrategyEnum.NAKED_SEXTUPLET || strategy === StrategyEnum.HIDDEN_QUINTUPLET) {
            prereqs.push(StrategyEnum.NAKED_QUINTUPLET);
            strategy = StrategyEnum.NAKED_QUINTUPLET;
        }
        if (strategy === StrategyEnum.NAKED_QUINTUPLET || strategy === StrategyEnum.HIDDEN_QUADRUPLET) {
            prereqs.push(StrategyEnum.NAKED_QUADRUPLET);
            strategy = StrategyEnum.NAKED_QUADRUPLET;
        }
        if (strategy === StrategyEnum.NAKED_QUADRUPLET || strategy === StrategyEnum.HIDDEN_TRIPLET) {
            prereqs.push(StrategyEnum.NAKED_TRIPLET);
            strategy = StrategyEnum.NAKED_TRIPLET;
        }
        if (strategy === StrategyEnum.NAKED_TRIPLET || strategy === StrategyEnum.HIDDEN_PAIR) {
            prereqs.push(StrategyEnum.NAKED_PAIR);
            strategy = StrategyEnum.NAKED_PAIR;
        }
        if (strategy === StrategyEnum.POINTING_TRIPLET) {
            prereqs.push(StrategyEnum.POINTING_PAIR);
            strategy = StrategyEnum.POINTING_PAIR;
        }
        if (strategy === StrategyEnum.POINTING_PAIR) {
            prereqs.push(StrategyEnum.HIDDEN_SINGLE);
            strategy = StrategyEnum.HIDDEN_SINGLE;
        }
        if (strategy === StrategyEnum.NAKED_PAIR || strategy === StrategyEnum.HIDDEN_SINGLE) {
            prereqs.push(StrategyEnum.NAKED_SINGLE);
        }
        return prereqs;
    }

    /**
     * Solves the puzzle and sets strategy and solution
     */
    private solve():void {
        // Stores hint for current step
        let hint:Hint = this.solver.nextStep();
        // Gets hint for each stop to solve puzzle (hint is null when board is finished being solved)
        while (hint !== null) {
            // Records what strategy was used
            this.strategies[hint.getStrategyType()] = true;

            // Records what strategies were used for each move
            let move:boolean[] = this.getDrillStrategies();
            // Moves are classified as one per value insertion so check if move has already started and if so add to it
            // moveStrategies array index 0 is for when placedCount == givensCount and 1 is givensCount + 1 and so on
            let moveIndex:number = this.solver.getPlacedCount() - this.givensCount;
            if (moveIndex >= this.moveStrategies.length) {
                this.moveStrategies.push(move);
            }
            else {
                for (let i:number = 0; i < move.length; i++) {
                    this.moveStrategies[moveIndex][i] = this.moveStrategies[moveIndex][i] || move[i];
                }
            }

            // Gets hint for next step
            hint = this.solver.nextStep();
        }
        // Sets solution string
        this.solution = this.solver.getSolution();
        this.setSolutionString();
        // Adds prereqs to strategies (strategies that current strategies could be reduced to)
        for (let i:number = 0; i < StrategyEnum.COUNT; i++) {
            if (this.strategies[i]) {
                let prereqs:StrategyEnum[] = this.getPrereqs(StrategyEnum[StrategyEnum[i]]);
                for (let j:number = 0; j < prereqs.length; j++) {
                    this.strategies[prereqs[j]] = true;
                }
            }
        }
        return;
    }

    /**
     * Sets solution string
     */
    private setSolutionString():void {
        this.solutionString = "";
        for (let i:number = 0; i < this.solution.length; i++) {
            for (let j:number = 0; j < this.solution[i].length; j++) {
                this.solutionString += this.solution[i][j];
            }
        }
        return;
    }

    /**
     * Sets difficulty using combined refutation and dependency scores
     * Inspired by https://www.fi.muni.cz/~xpelanek/publications/flairs-sudoku.pdf
     */
    private setDifficulty():void {
        let board:Cell[][] = getCellBoard(this.board);
        // Add all notes to board
        for (let r:number = 0; r < 9; r++) {
            for (let c:number = 0; c < 9; c++) {
                if (board[r][c].isEmpty()) {
                    board[r][c].resetNotes();
                }
            }
        }
        // Simplify notes based on givens
        for (let r:number = 0; r < 9; r++) {
            for (let c:number = 0; c < 9; c++) {
                if (!board[r][c].isEmpty()) {
                    simplifyNotes(board, r, c);
                }
            }
        }
        // Set difficulty as combination of refutation and dependency scores
        this.difficulty = Refutation.getRefutationScore(board, this.solution, 1) + (-1 * Dependency.getDependencyScore(board));
        return;
    }

    /**
     * Returns if given value is a possible candidate at given position taking into account row/column/box constraints
     * @param row - row to check
     * @param col - column to check
     * @param value - value to check
     * @param board - 2d board array to check
     * @returns true if value is a possible candidate, false otherwise
     */
    private isPossibleCandidate(row:number, col:number, value:string, board:string[][]):boolean {
        // Check row
        for (let i:number = 0; i < 9; i++) {
            if (board[row][i] === value) {
                return false;
            }
        }
        // Check column
        for (let i:number = 0; i < 9; i++) {
            if (board[i][col] === value) {
                return false;
            }
        }
        // Check box
        let boxRow:number = Math.floor(row / 3);
        let boxCol:number = Math.floor(col / 3);
        for (let i:number = 0; i < 3; i++) {
            for (let j:number = 0; j < 3; j++) {
                if (board[boxRow * 3 + i][boxCol * 3 + j] === value) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Returns if given Sudoku board is unsolvable, uniquely solvable, or has multiple solutions using recursive algorithm
     * @param row - row to start at
     * @param col - column to start at
     * @param board - 2d board array to solve
     * @param solutions - number of solutions found so far
     * @returns 0 if unsolvable, 1 if uniquely solvable, 2 if multiple solutions
     */
    private getSolutionCount(row:number, col:number, board:string[][], solutions:number):number {
        // If at end of board, return 1 plus number of solutions found so far
        if (row === 9) {
            return 1 + solutions;
        }
        // If at end of row, move to next row
        if (col === 9) {
            return this.getSolutionCount(row + 1, 0, board, solutions);
        }
        // If cell is not empty, move to next cell'
        if (board[row][col] !== SudokuEnum.EMPTY_CELL) {
            return this.getSolutionCount(row, col + 1, board, solutions);
        }
        // Try each possible value for cell
        for (let i:number = 1; i <= 9; i++) {
            // If value is valid, place it in cell and move to next cell
            if (this.isPossibleCandidate(row, col, i.toString(), board)) {
                board[row][col] = i.toString();
                solutions = this.getSolutionCount(row, col + 1, board, solutions);
                // If more than 1 solution found, return
                if (solutions > 1) {
                    return solutions;
                }
            }
        }
        // Reset cell to empty and return number of solutions found
        board[row][col] = SudokuEnum.EMPTY_CELL;
        return solutions;
    }

    /**
     * Determines if the input board is a valid Sudoku board
     * @param board - 81 length board string (left to right, top to bottom)
     * @throws {@link CustomError}
     * Thrown if board has invalid length, characters, duplicate values, is already solved, is unsolvable, or has multiple solutions
     * in a row, column, or box (Excluding zeros)
     */
    public validatePuzzle(board: string):boolean {

        // Regex ^[0123456789]*$ which makes sure only contains those chars
        let valid:string = SudokuEnum.EMPTY_CELL + SudokuEnum.CANDIDATES;
        valid = "^[" + valid + "]*$";

        if (board.length !== SudokuEnum.BOARD_LENGTH) {
            throw new CustomError(CustomErrorEnum.INVALID_BOARD_LENGTH);
        }
        else if (!new RegExp(valid).test(board)) {
            throw new CustomError(CustomErrorEnum.INVALID_BOARD_CHARACTERS);
        }
        else if (!board.includes(SudokuEnum.EMPTY_CELL)) {
            throw new CustomError(CustomErrorEnum.BOARD_ALREADY_SOLVED);
        }
        else {
            // Checks board for duplicate values in the same row/column/box
            var boardArray: string[][] = getBoardArray(board);
            checkBoardForDuplicates(boardArray);
        }
        // Checks board for unsolvable or multiple solutions
        let solutionCount:number = this.getSolutionCount(0, 0, boardArray, 0);
        if (solutionCount === 0) {
            throw new CustomError(CustomErrorEnum.UNSOLVABLE);
        }
        else if (solutionCount > 1) {
            throw new CustomError(CustomErrorEnum.MULTIPLE_SOLUTIONS);
        }
        return true;
    }
}