/**
 * Typescript Interfaces/Types for Sudokuru Package
 */

export type sudokuStrategy = 'AMEND_NOTES' | 'SIMPLIFY_NOTES' |
    'NAKED_SINGLE' | 'NAKED_PAIR' | "NAKED_TRIPLET" | "NAKED_QUADRUPLET" |
    'HIDDEN_SINGLE' | 'HIDDEN_PAIR' | 'HIDDEN_TRIPLET'  | 'HIDDEN_QUADRUPLET' |
    'POINTING_PAIR' | 'POINTING_TRIPLET';

export type sudokuStrategyArray = sudokuStrategy[];
