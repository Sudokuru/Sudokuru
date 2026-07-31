import { clonePuzzle } from "../../puzzles";
import { getRefutationScore } from "../../refutation";
import {
  SUPPORTED_BOARD_SIZES,
  type CellProps,
  type SudokuNumber,
  type SupportedBoardSize,
} from "../../Types";
import { cloneBoard, getPuzzle } from "../../validate";
import {
  ADDITIONAL_TEST_BOARDS_BY_NAME,
  ALL_ADDITIONAL_BOARDS_WITH_REFUTATION_SCORES,
} from "../utils/additionalBoards";
import {
  SINGLE_NOTE_PATCH_BY_SIZE,
  SOLVED_TEST_BOARDS,
} from "../utils/testBoards";

const COLUMN_OBVIOUS_PAIR =
  ADDITIONAL_TEST_BOARDS_BY_NAME.COLUMN_OBVIOUS_PAIR;
const COLUMN_OBVIOUS_PAIR_SOLUTION =
  ADDITIONAL_TEST_BOARDS_BY_NAME.COLUMN_OBVIOUS_PAIR_SOLUTION;

/**
 * Scores recorded from the legacy implementation after resetting its seed
 * before each boost case.
 */
const COLUMN_OBVIOUS_PAIR_SCORES_BY_BOOST = [
  [0, 38],
  [0.5, 38],
  [1, 58],
] as const;

describe("getRefutationScore", () => {
  describe("legacy score compatibility", () => {
    it.each(
      ALL_ADDITIONAL_BOARDS_WITH_REFUTATION_SCORES.map(
        (fixture, index) => [index, fixture] as const
      )
    )(
      "matches the hardcoded boost=1 score for additional board %i",
      (_index, { board, solution, refutationScore }) => {
        const puzzle: CellProps[][] = getPuzzle(board.flat().join(""));
        const solutionCopy: SudokuNumber[][] = cloneBoard(solution);

        expect(getRefutationScore(puzzle, solutionCopy, 1)).toBe(
          refutationScore
        );
      }
    );

    it.each(COLUMN_OBVIOUS_PAIR_SCORES_BY_BOOST)(
      "matches the hardcoded column-pair score at boost %s",
      (boost, expectedScore) => {
        const puzzle: CellProps[][] = getPuzzle(
          COLUMN_OBVIOUS_PAIR.flat().join("")
        );
        const solution: SudokuNumber[][] = cloneBoard(
          COLUMN_OBVIOUS_PAIR_SOLUTION
        );

        expect(getRefutationScore(puzzle, solution, boost)).toBe(expectedScore);
      }
    );
  });

  describe("V4 board support", () => {
    it.each(
      SUPPORTED_BOARD_SIZES.map(
        (size: SupportedBoardSize) => [size, size] as const
      )
    )(
      "returns zero for a solved %ix%i puzzle",
      (size: SupportedBoardSize) => {
        const solution: SudokuNumber[][] = cloneBoard(
          SOLVED_TEST_BOARDS[size]
        );
        const puzzle: CellProps[][] = getPuzzle(solution.flat().join(""));

        expect(getRefutationScore(puzzle, solution, 1)).toBe(0);
      }
    );

    it.each(
      SUPPORTED_BOARD_SIZES.map(
        (size: SupportedBoardSize) => [size, size] as const
      )
    )(
      "returns zero when a %ix%i puzzle needs only one obvious single",
      (size: SupportedBoardSize) => {
        const solution: SudokuNumber[][] = cloneBoard(
          SOLVED_TEST_BOARDS[size]
        );
        const puzzle: CellProps[][] = getPuzzle(solution.flat().join(""));
        const [patch] = SINGLE_NOTE_PATCH_BY_SIZE[size];

        puzzle[patch.row][patch.column] =
          patch.cell.type === "note"
            ? { ...patch.cell, notes: [...patch.cell.notes] }
            : { ...patch.cell };

        expect(getRefutationScore(puzzle, solution, 1)).toBe(0);
      }
    );
  });

  describe("functional behavior", () => {
    it("returns the same literal score on repeated calls", () => {
      const firstPuzzle: CellProps[][] = getPuzzle(
        COLUMN_OBVIOUS_PAIR.flat().join("")
      );
      const secondPuzzle: CellProps[][] = getPuzzle(
        COLUMN_OBVIOUS_PAIR.flat().join("")
      );
      const firstSolution: SudokuNumber[][] = cloneBoard(
        COLUMN_OBVIOUS_PAIR_SOLUTION
      );
      const secondSolution: SudokuNumber[][] = cloneBoard(
        COLUMN_OBVIOUS_PAIR_SOLUTION
      );

      expect(getRefutationScore(firstPuzzle, firstSolution, 0.5)).toBe(38);
      expect(getRefutationScore(secondPuzzle, secondSolution, 0.5)).toBe(38);
    });

    it("ignores user note contents when calculating difficulty", () => {
      const puzzleWithEmptyNotes: CellProps[][] = getPuzzle(
        COLUMN_OBVIOUS_PAIR.flat().join("")
      );
      const puzzleWithSolutionOnlyNotes: CellProps[][] = clonePuzzle(
        puzzleWithEmptyNotes
      );
      const solution: SudokuNumber[][] = cloneBoard(
        COLUMN_OBVIOUS_PAIR_SOLUTION
      );

      for (
        let rowIndex: number = 0;
        rowIndex < puzzleWithSolutionOnlyNotes.length;
        rowIndex += 1
      ) {
        for (
          let columnIndex: number = 0;
          columnIndex < puzzleWithSolutionOnlyNotes.length;
          columnIndex += 1
        ) {
          const cell = puzzleWithSolutionOnlyNotes[rowIndex][columnIndex];

          if (cell.type === "note") {
            cell.notes = [solution[rowIndex][columnIndex]];
          }
        }
      }

      expect(
        getRefutationScore(
          puzzleWithEmptyNotes,
          cloneBoard(solution),
          1
        )
      ).toBe(58);
      expect(
        getRefutationScore(
          puzzleWithSolutionOnlyNotes,
          cloneBoard(solution),
          1
        )
      ).toBe(58);
    });

    it("treats matching user values as placed puzzle values", () => {
      const givenPuzzle: CellProps[][] = getPuzzle(
        COLUMN_OBVIOUS_PAIR.flat().join("")
      );
      const userValuePuzzle: CellProps[][] = givenPuzzle.map((row) =>
        row.map((cell) =>
          cell.type === "note"
            ? { type: "note", notes: [...cell.notes] }
            : { type: "value", value: cell.value }
        )
      );
      const solution: SudokuNumber[][] = cloneBoard(
        COLUMN_OBVIOUS_PAIR_SOLUTION
      );

      expect(
        getRefutationScore(givenPuzzle, cloneBoard(solution), 1)
      ).toBe(58);
      expect(
        getRefutationScore(userValuePuzzle, cloneBoard(solution), 1)
      ).toBe(58);
    });

    it("does not mutate the puzzle or solution", () => {
      const puzzle: CellProps[][] = getPuzzle(
        COLUMN_OBVIOUS_PAIR.flat().join("")
      );
      const solution: SudokuNumber[][] = cloneBoard(
        COLUMN_OBVIOUS_PAIR_SOLUTION
      );
      const puzzleBefore: CellProps[][] = clonePuzzle(puzzle);
      const solutionBefore: SudokuNumber[][] = cloneBoard(solution);
      const score: number = getRefutationScore(puzzle, solution, 1);

      expect(puzzle).toEqual(puzzleBefore);
      expect(solution).toEqual(solutionBefore);
      expect(score).toBe(58);
    });
  });
});
