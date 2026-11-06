import { getRawDifficulty } from "../../difficulty";
import { clonePuzzle } from "../../puzzles";
import { getRefutationScore } from "../../refutation";
import { SUPPORTED_BOARD_SIZES } from "../../Types";
import { cloneBoard, getPuzzle } from "../../validate";
import { ADDITIONAL_TEST_BOARDS_BY_NAME } from "../utils/additionalBoards";
import {
  BOUNDED_REFUTATION_BOARD,
  HIGH_REFUTATION_BOARD,
} from "../utils/difficultyBoards";
import {
  SINGLE_NOTE_PATCH_BY_SIZE,
  SOLVED_TEST_BOARDS,
} from "../utils/testBoards";

describe("getRawDifficulty", () => {
  it.each([
    ["ONLY_OBVIOUS_SINGLES", -93977],
    ["COLUMN_OBVIOUS_PAIR", -12865],
    ["POINTING_PAIR", 12722],
    ["HIDDEN_SINGLE_DRILL", -60373],
  ] as const)(
    "matches the calibrated V4 score for %s with either solution path",
    (fixtureName, expected) => {
      const puzzle = getPuzzle(
        ADDITIONAL_TEST_BOARDS_BY_NAME[fixtureName].flat().join("")
      );
      const solution = ADDITIONAL_TEST_BOARDS_BY_NAME[`${fixtureName}_SOLUTION`];

      expect(getRawDifficulty(puzzle)).toBe(expected);
      expect(getRawDifficulty(puzzle, solution)).toBe(expected);
    }
  );

  it("uses the capped refutation component when a run cannot finish", () => {
    const puzzle = getPuzzle(BOUNDED_REFUTATION_BOARD.puzzle);
    const solution = BOUNDED_REFUTATION_BOARD.solution;
    const options = { refutationMaxTrialsPerRun: 0 };

    expect(
      getRefutationScore(puzzle, solution, {seed: 81,  runCount: 1, maxTrialsPerRun: 0 })
    ).toBeNull();
    expect(getRawDifficulty(puzzle, undefined, options)).toBe(12722);
    expect(getRawDifficulty(puzzle, solution, options)).toBe(12722);
  });

  it("also caps a finite refutation score above the provisional ceiling", () => {
    const puzzle = getPuzzle(HIGH_REFUTATION_BOARD.puzzle);
    const solution = HIGH_REFUTATION_BOARD.solution;

    expect(
      getRefutationScore(puzzle, solution, {seed: 81,  runCount: 1, maxTrialsPerRun: 64 })
    ).toBe(252);
    expect(getRawDifficulty(puzzle)).toBe(4242);
    expect(getRawDifficulty(puzzle, solution)).toBe(4242);
  });

  it.each(SUPPORTED_BOARD_SIZES)(
    "returns zero for a completed size-%i puzzle without trying to solve it",
    (size) => {
      const solution = SOLVED_TEST_BOARDS[size];
      const puzzle = getPuzzle(solution.flat().join(""));

      expect(getRawDifficulty(puzzle)).toBe(0);
      expect(getRawDifficulty(puzzle, solution)).toBe(0);
    }
  );

  it.each(SUPPORTED_BOARD_SIZES)(
    "normalizes a single empty cell on a size-%i puzzle",
    (size) => {
      const solution = SOLVED_TEST_BOARDS[size];
      const puzzle = getPuzzle(solution.flat().join(""));
      const [patch] = SINGLE_NOTE_PATCH_BY_SIZE[size];
      puzzle[patch.row][patch.column] = { type: "note", notes: [] };

      expect(getRawDifficulty(puzzle)).toBe(-400000);
      expect(getRawDifficulty(puzzle, solution)).toBe(-400000);
    }
  );

  it("repeats the same result independently of unrelated ratings", () => {
    const puzzle = getPuzzle(
      ADDITIONAL_TEST_BOARDS_BY_NAME.COLUMN_OBVIOUS_PAIR.flat().join("")
    );

    expect(getRawDifficulty(puzzle)).toBe(-12865);
    expect(getRawDifficulty(getPuzzle(BOUNDED_REFUTATION_BOARD.puzzle))).toBe(
      12722
    );
    expect(getRawDifficulty(puzzle)).toBe(-12865);
  });

  it("ignores user notes and preserves both inputs on either solution path", () => {
    const puzzle = getPuzzle(
      ADDITIONAL_TEST_BOARDS_BY_NAME.COLUMN_OBVIOUS_PAIR.flat().join("")
    );
    for (const row of puzzle) {
      for (const cell of row) {
        if (cell.type === "note") {
          cell.notes = [1];
        }
      }
    }
    const solution = cloneBoard(
      ADDITIONAL_TEST_BOARDS_BY_NAME.COLUMN_OBVIOUS_PAIR_SOLUTION
    );
    const beforePuzzle = clonePuzzle(puzzle);
    const beforeSolution = cloneBoard(solution);

    expect(getRawDifficulty(puzzle)).toBe(-12865);
    expect(getRawDifficulty(puzzle, solution)).toBe(-12865);
    expect(puzzle).toEqual(beforePuzzle);
    expect(solution).toEqual(beforeSolution);
  });
});
