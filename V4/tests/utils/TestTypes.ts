import type { SudokuValue } from "../../Types";

export type BoardWithDependencyScore = {
  board: SudokuValue[][];
  dependencyScore: number;
};
