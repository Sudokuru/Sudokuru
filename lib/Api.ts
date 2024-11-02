/**
 * Typescript Interfaces/Types for Sudokuru Package
 */

export type SudokuStrategy = 'AMEND_NOTES' | 'SIMPLIFY_NOTES' |
    'OBVIOUS_SINGLE' | 'OBVIOUS_PAIR' | "OBVIOUS_TRIPLET" | "OBVIOUS_QUADRUPLET" |
    'HIDDEN_SINGLE' | 'HIDDEN_PAIR' | 'HIDDEN_TRIPLET'  | 'HIDDEN_QUADRUPLET' |
    'POINTING_PAIR' | 'POINTING_TRIPLET';

// A list of all sudoku strategies in priority solve order.
export const SUDOKU_STRATEGY_ARRAY: SudokuStrategy[] = [
    "AMEND_NOTES",
    "SIMPLIFY_NOTES",
    "OBVIOUS_SINGLE",
    "HIDDEN_SINGLE",
    "OBVIOUS_PAIR",
    "HIDDEN_PAIR",
    "POINTING_PAIR",
    "OBVIOUS_TRIPLET",
    "HIDDEN_TRIPLET",
    "POINTING_TRIPLET",
    "OBVIOUS_QUADRUPLET",
    "HIDDEN_QUADRUPLET",
];
