import type { SudokuNumber } from "../../Types";

export type BoardWithDependencyScore = {
  board: SudokuNumber[][];
  dependencyScore: number;
};

export type BoardWithRefutationScore = {
  board: SudokuNumber[][];
  solution: SudokuNumber[][];
  refutationScore: number;
};

export type BoardWithDifficulty = {
  board: SudokuNumber[][];
  difficulty: number;
};

export type BoardStringWithDifficulty = {
  board: string;
  difficulty: number;
};
