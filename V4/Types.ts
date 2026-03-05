export type SudokuValue = number;

export const SUDOKU_CELL_TYPES = ["note", "value", "given"] as const;
export type CellType = (typeof SUDOKU_CELL_TYPES)[number];

export interface CellLocation {
  r: number; // row (0 indexed)
  c: number; // column (0 indexed)
}

export interface CellWithValue {
  type: Extract<CellType, "given" | "value">;
  value: SudokuValue;
}

export interface CellWithNotes {
  type: Extract<CellType, "note">;
  notes: SudokuValue[];
}

export type CellProps = CellWithValue | CellWithNotes;

export type CellWithLocation = CellProps & CellLocation;
export type ValueCellWithLocation = CellWithValue & CellLocation;
export type NoteCellWithLocation = CellWithNotes & CellLocation;

export const SUDOKU_GAME_VARIANTS = ["demo", "drill", "classic"] as const;
export type GameVariant = (typeof SUDOKU_GAME_VARIANTS)[number];

export const SUDOKU_GAME_DIFFICULTIES = [
  "novice",
  "amateur",
  "layman",
  "trainee",
  "protege",
  "professional",
  "pundit",
  "master",
  "grandmaster"
] as const;
export type GameDifficulty = (typeof SUDOKU_GAME_DIFFICULTIES)[number];

export interface GameStatistics {
  difficulty: GameDifficulty;
  internalDifficulty: number;
  time: number;
  score: number;
  numWrongCellsPlayed: number;
  numHintsUsed: number;
  numHintsUsedPerStrategy: {
    hintStrategy: SudokuStrategy;
    numHintsUsed: number;
  }[];
}

export const SUDOKU_STRATEGY_ARRAY = [
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
] as const;
export type SudokuStrategy = (typeof SUDOKU_STRATEGY_ARRAY)[number];

export type HighlightType = "removal" | "placement" | "focus";

export interface HighlightedCell {
  location: CellLocation;
  highlightType: HighlightType;
}

export interface HighlightedNumber {
  location: CellLocation;
  highlightType: HighlightType;
}

export interface HighlightedNote {
  location: CellLocation;
  value: SudokuValue;
  highlightType: HighlightType;
}

/**
 * Atomic, frontend-renderable hint stage.
 * Each field is optional so strategies can emit compact, composable stages.
 */
export interface HintStage {
  removeValues?: ValueCellWithLocation[];
  removeNotes?: NoteCellWithLocation[];
  placeValues?: ValueCellWithLocation[];
  placeNotes?: NoteCellWithLocation[];
  highlightCells?: HighlightedCell[];
  highlightNumbers?: HighlightedNumber[];
  highlightNotes?: HighlightedNote[];
  text?: string;
}

export interface Hint {
  stages: HintStage[];
  strategy: SudokuStrategy;
}

// Internal extension used by queue/vision scanning internals.
export interface HintData extends Hint {
  queueLocations: CellLocation[];
}

export interface SudokuDrill {
  strategy: SudokuStrategy;
  hintIndex: number;
}

export interface SudokuObjectProps {
  variant: GameVariant;
  version: number;
  selectedCells: CellLocation[];
  statistics: GameStatistics;
  puzzle: CellProps[][];
  puzzleSolution: SudokuValue[][];
  actionHistory: CellWithLocation[][];
  inNoteMode: boolean;
}

/**
 * Aggregated puzzle analysis returned by getSudokuData in v4.
 *
 * Includes legacy PuzzleData concepts:
 * - solution
 * - rawDifficulty
 * - givensCount
 * - puzzleStrategies
 * - drills
 *
 * And v4 additions:
 * - hintsToSolve (ordered hints used to solve)
 * - drills with hintIndex mapping into hintsToSolve
 */
export type SudokuData = {
  puzzle: CellProps[][];
  solution: SudokuValue[][];
  givensCount: number;
  rawDifficulty: number;
  difficulty: GameDifficulty;
  puzzleStrategies: SudokuStrategy[];
  hintsToSolve: Hint[];
  drills: SudokuDrill[];
};
