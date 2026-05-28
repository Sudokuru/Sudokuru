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
