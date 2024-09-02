/**
 * Typescript Interfaces/Types for Sudokuru Package
 */

export type SudokuStrategy = 'AMEND_NOTES' | 'SIMPLIFY_NOTES' |
    'NAKED_SINGLE' | 'NAKED_PAIR' | "NAKED_TRIPLET" | "NAKED_QUADRUPLET" |
    'HIDDEN_SINGLE' | 'HIDDEN_PAIR' | 'HIDDEN_TRIPLET'  | 'HIDDEN_QUADRUPLET' |
    'POINTING_PAIR' | 'POINTING_TRIPLET';

export type SudokuStrategyArray = SudokuStrategy[];

// A list of all sudoku strategies in priority solve order.
export const SUDOKU_STRATEGY_ARRAY: SudokuStrategyArray = [
    "AMEND_NOTES",
    "SIMPLIFY_NOTES",
    "NAKED_SINGLE",
    "HIDDEN_SINGLE",
    "NAKED_PAIR",
    "HIDDEN_PAIR",
    "POINTING_PAIR",
    "NAKED_TRIPLET",
    "HIDDEN_TRIPLET",
    "POINTING_TRIPLET",
    "NAKED_QUADRUPLET",
    "HIDDEN_QUADRUPLET",
];
