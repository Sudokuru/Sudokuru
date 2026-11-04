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
import { createEmptyPuzzle } from "../utils/puzzleFactories";
import { BOUNDED_REFUTATION_BOARD } from "../utils/difficultyBoards";
import {
  SINGLE_NOTE_PATCH_BY_SIZE,
  SOLVED_TEST_BOARDS,
} from "../utils/testBoards";

const COLUMN_OBVIOUS_PAIR =
  ADDITIONAL_TEST_BOARDS_BY_NAME.COLUMN_OBVIOUS_PAIR;
const COLUMN_OBVIOUS_PAIR_SOLUTION =
  ADDITIONAL_TEST_BOARDS_BY_NAME.COLUMN_OBVIOUS_PAIR_SOLUTION;

/** Literal expectations for three seeded runs with a 32-trial budget per run. */
const V4_REFUTATION_SCORES = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 0, 18, 0, 27, 0, 2, 0, 59, null, 0,
] as const;

describe("getRefutationScore", () => {
  describe("sampling options", () => {
    it("preserves standalone defaults when options are omitted or explicit", () => {
      const puzzle = getPuzzle(COLUMN_OBVIOUS_PAIR.flat().join(""));

      expect(getRefutationScore(puzzle, COLUMN_OBVIOUS_PAIR_SOLUTION, {})).toBe(9);
      expect(
        getRefutationScore(puzzle, COLUMN_OBVIOUS_PAIR_SOLUTION, {
          runCount: 3,
          maxTrialsPerRun: 32,
          seed: 81,
        })
      ).toBe(9);
    });

    it("can stop after the first successful run before a later run stalls", () => {
      const puzzle = getPuzzle(BOUNDED_REFUTATION_BOARD.puzzle);

      expect(
        getRefutationScore(puzzle, BOUNDED_REFUTATION_BOARD.solution, {
          runCount: 1,
        })
      ).toBe(61);
      expect(
        getRefutationScore(puzzle, BOUNDED_REFUTATION_BOARD.solution)
      ).toBeNull();
    });

    it("finishes a bounded rating when allowed one additional trial per run", () => {
      const puzzle = getPuzzle(BOUNDED_REFUTATION_BOARD.puzzle);

      expect(
        getRefutationScore(puzzle, BOUNDED_REFUTATION_BOARD.solution, {
          maxTrialsPerRun: 33,
        })
      ).toBe(47);
    });

    it("uses an explicit zero seed and repeats that stream independently", () => {
      const puzzle = getPuzzle(COLUMN_OBVIOUS_PAIR.flat().join(""));

      expect(
        getRefutationScore(puzzle, COLUMN_OBVIOUS_PAIR_SOLUTION, { seed: 0 })
      ).toBe(6);
      expect(getRefutationScore(puzzle, COLUMN_OBVIOUS_PAIR_SOLUTION)).toBe(9);
      expect(
        getRefutationScore(puzzle, COLUMN_OBVIOUS_PAIR_SOLUTION, { seed: 0 })
      ).toBe(6);
    });

    it("permits free singles but no wrong-candidate trials with a zero budget", () => {
      expect(
        getRefutationScore(getPuzzle("1000"), SOLVED_TEST_BOARDS[2], {
          maxTrialsPerRun: 0,
        })
      ).toBe(0);
      expect(
        getRefutationScore(
          getPuzzle(COLUMN_OBVIOUS_PAIR.flat().join("")),
          COLUMN_OBVIOUS_PAIR_SOLUTION,
          { maxTrialsPerRun: 0 }
        )
      ).toBeNull();
    });

    it.each([0, -1, 1.5, NaN, Infinity])(
      "rejects invalid run count %s",
      (runCount) => {
        expect(() =>
          getRefutationScore(getPuzzle("1000"), SOLVED_TEST_BOARDS[2], {
            runCount,
          })
        ).toThrow(RangeError);
      }
    );

    it.each([-1, 1.5, NaN, Infinity])(
      "rejects invalid trial budget %s",
      (maxTrialsPerRun) => {
        expect(() =>
          getRefutationScore(getPuzzle("1000"), SOLVED_TEST_BOARDS[2], {
            maxTrialsPerRun,
          })
        ).toThrow(RangeError);
      }
    );
  });

  describe("V4 sampled scores", () => {
    it.each(
      ALL_ADDITIONAL_BOARDS_WITH_REFUTATION_SCORES.map(
        (fixture, index) => [index, fixture] as const
      )
    )(
      "matches the bounded V4 score for additional board %i",
      (index, { board, solution }) => {
        const puzzle: CellProps[][] = getPuzzle(board.flat().join(""));
        const solutionCopy: SudokuNumber[][] = cloneBoard(solution);

        expect(getRefutationScore(puzzle, solutionCopy)).toBe(
          V4_REFUTATION_SCORES[index]
        );
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

        expect(getRefutationScore(puzzle, solution)).toBe(0);
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

        expect(getRefutationScore(puzzle, solution)).toBe(0);
      }
    );
  });

  describe("functional behavior", () => {
    it("counts the assumption and subsequent singles for a multi-step refutation", () => {
      const puzzle = getPuzzle(COLUMN_OBVIOUS_PAIR.flat().join(""));
      expect(getRefutationScore(puzzle, COLUMN_OBVIOUS_PAIR_SOLUTION)).toBe(9);
    });

    it("sums all incorrect candidate costs for a refutable cell", () => {
      const puzzle = getPuzzle(
        ADDITIONAL_TEST_BOARDS_BY_NAME.POINTING_PAIR.flat().join("")
      );
      expect(
        getRefutationScore(
          puzzle,
          ADDITIONAL_TEST_BOARDS_BY_NAME.POINTING_PAIR_SOLUTION
        )
      ).toBe(59);
    });

    it("returns null when a later run exhausts its trial budget", () => {
      const puzzle = getPuzzle(BOUNDED_REFUTATION_BOARD.puzzle);
      expect(
        getRefutationScore(puzzle, BOUNDED_REFUTATION_BOARD.solution)
      ).toBeNull();
    });

    it("returns null when a wrong assumption completes an alternative solution", () => {
      expect(
        getRefutationScore(createEmptyPuzzle(2), SOLVED_TEST_BOARDS[2])
      ).toBeNull();
    });

    it("returns null when single deductions cannot refute any cell", () => {
      expect(
        getRefutationScore(createEmptyPuzzle(4), SOLVED_TEST_BOARDS[4])
      ).toBeNull();
    });

    it("is independent of unrelated ratings", () => {
      const puzzle = getPuzzle(COLUMN_OBVIOUS_PAIR.flat().join(""));
      const solution = cloneBoard(COLUMN_OBVIOUS_PAIR_SOLUTION);
      expect(getRefutationScore(puzzle, solution)).toBe(9);

      expect(
        getRefutationScore(
          getPuzzle(
            ADDITIONAL_TEST_BOARDS_BY_NAME.BOX_OBVIOUS_PAIR.flat().join("")
          ),
          ADDITIONAL_TEST_BOARDS_BY_NAME.BOX_OBVIOUS_PAIR_SOLUTION
        )
      ).toBe(18);
      expect(getRefutationScore(puzzle, solution)).toBe(9);
    });

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

      expect(getRefutationScore(firstPuzzle, firstSolution)).toBe(9);
      expect(getRefutationScore(secondPuzzle, secondSolution)).toBe(9);
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
        getRefutationScore(puzzleWithEmptyNotes, cloneBoard(solution))
      ).toBe(9);
      expect(
        getRefutationScore(puzzleWithSolutionOnlyNotes, cloneBoard(solution))
      ).toBe(9);
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
        getRefutationScore(givenPuzzle, cloneBoard(solution))
      ).toBe(9);
      expect(
        getRefutationScore(userValuePuzzle, cloneBoard(solution))
      ).toBe(9);
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
      const score: number | null = getRefutationScore(puzzle, solution);

      expect(puzzle).toEqual(puzzleBefore);
      expect(solution).toEqual(solutionBefore);
      expect(score).toBe(9);
    });
  });
});
