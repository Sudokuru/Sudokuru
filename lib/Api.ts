/**
 * Typescript Interfaces/Types for Sudokuru Package
 */

export type sudokuStrategy = 'AMEND_NOTES' | 'SIMPLIFY_NOTES' |
    'NAKED_SINGLE' | 'NAKED_PAIR' | "NAKED_TRIPLET" | "NAKED_QUADRUPLET" |
    'HIDDEN_SINGLE' | 'HIDDEN_PAIR' | 'HIDDEN_TRIPLET'  | 'HIDDEN_QUADRUPLET' |
    'POINTING_PAIR' | 'POINTING_TRIPLET';

export type sudokuStrategyArray = sudokuStrategy[];

export interface puzzle {
    puzzle: string,
    puzzleSolution: string,
    strategies: sudokuStrategyArray,
    difficulty: number,
    drillStrategies?: sudokuStrategyArray
}

export interface drill {
    puzzleCurrentState: string,
    puzzleCurrentNotesState: string,
    puzzleSolution: string,
}

export interface activeGame {
    userId: string,
    puzzle: string,
    puzzleSolution: string,
    currentTime: number,
    difficulty: number,
    puzzleCurrentState: string,
    puzzleCurrentNotesState: string,
    numHintsUsed: number,
    numWrongCellsPlayed: number
}

export interface gameResults {
    score: number,
    solveTime: number,
    numHintsUsed: number,
    numWrongCellsPlayed: number
}
