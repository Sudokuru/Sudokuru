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
    ["ONLY_OBVIOUS_SINGLES", -9980],
    ["COLUMN_OBVIOUS_PAIR", 8997911],
    ["POINTING_PAIR", 58999807],
    ["HIDDEN_SINGLE_DRILL", -5887],
  ] as const)(
    "matches the combined V4 score for %s with either solution path",
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

    expect(getRawDifficulty(puzzle)).toBe(255999807);
    expect(
      getRawDifficulty(puzzle, BOUNDED_REFUTATION_BOARD.solution)
    ).toBe(255999807);
  });

  it("also caps a finite refutation score above the provisional ceiling", () => {
    const puzzle = getPuzzle(HIGH_REFUTATION_BOARD.puzzle);
    const solution = HIGH_REFUTATION_BOARD.solution;

    expect(getRefutationScore(puzzle, solution)).toBe(259);
    expect(getRawDifficulty(puzzle)).toBe(255998617);
    expect(getRawDifficulty(puzzle, solution)).toBe(255998617);
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

      expect(getRawDifficulty(puzzle)).toBe(-50000);
      expect(getRawDifficulty(puzzle, solution)).toBe(-50000);
    }
  );

  it("repeats the same result independently of unrelated ratings", () => {
    const puzzle = getPuzzle(
      ADDITIONAL_TEST_BOARDS_BY_NAME.COLUMN_OBVIOUS_PAIR.flat().join("")
    );

    expect(getRawDifficulty(puzzle)).toBe(8997911);
    expect(getRawDifficulty(getPuzzle(BOUNDED_REFUTATION_BOARD.puzzle))).toBe(
      255999807
    );
    expect(getRawDifficulty(puzzle)).toBe(8997911);
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

    expect(getRawDifficulty(puzzle)).toBe(8997911);
    expect(getRawDifficulty(puzzle, solution)).toBe(8997911);
    expect(puzzle).toEqual(beforePuzzle);
    expect(solution).toEqual(beforeSolution);
  });
});
