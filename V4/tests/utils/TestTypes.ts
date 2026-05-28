import type { SudokuValue } from "../../Types";

export type BoardWithDependencyScore = {
  board: SudokuValue[][];
  dependencyScore: number;
};

export type BoardWithRefutationScore = {
  board: SudokuValue[][];
  solution: SudokuValue[][];
  refutationScore: number;
};

export type BoardWithDifficulty = {
  board: SudokuValue[][];
  difficulty: number;
};

export type BoardStringWithDifficulty = {
  board: string;
  difficulty: number;
};
