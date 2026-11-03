import { getDependencyScore } from "../../dependency";
import { clonePuzzle } from "../../puzzles";
import { SUPPORTED_BOARD_SIZES, type CellProps } from "../../Types";
import { getPuzzle } from "../../validate";
import { ADDITIONAL_TEST_BOARDS_BY_NAME } from "../utils/additionalBoards";
import { createEmptyPuzzle } from "../utils/puzzleFactories";
import {
  SINGLE_NOTE_PATCH_BY_SIZE,
  SOLVED_TEST_BOARDS,
} from "../utils/testBoards";

const COLUMN_OBVIOUS_PAIR =
  ADDITIONAL_TEST_BOARDS_BY_NAME.COLUMN_OBVIOUS_PAIR;

describe("getDependencyScore", () => {
  it.each(SUPPORTED_BOARD_SIZES)(
    "returns zero for a solved size-%i puzzle",
    (size) => {
      const puzzle = getPuzzle(SOLVED_TEST_BOARDS[size].flat().join(""));
      expect(getDependencyScore(puzzle)).toBe(0);
    }
  );

  it("returns zero when a puzzle has no available simple move", () => {
    expect(getDependencyScore(createEmptyPuzzle(4))).toBe(0);
  });

  it.each(SUPPORTED_BOARD_SIZES)(
    "averages one available move over all 60 steps on a size-%i puzzle",
    (size) => {
      const puzzle = getPuzzle(SOLVED_TEST_BOARDS[size].flat().join(""));
      const [patch] = SINGLE_NOTE_PATCH_BY_SIZE[size];
      puzzle[patch.row][patch.column] = {
        type: "note",
        notes: [],
      };

      expect(getDependencyScore(puzzle)).toBe(-0.05);
    }
  );

  it.each([
    ["ONLY_OBVIOUS_SINGLES", -14.4],
    ["COLUMN_OBVIOUS_PAIR", -3.6666666666666665],
  ] as const)("matches the V4 sampled score for %s", (fixtureName, expected) => {
    const puzzle = getPuzzle(
      ADDITIONAL_TEST_BOARDS_BY_NAME[fixtureName].flat().join("")
    );
    expect(getDependencyScore(puzzle)).toBeCloseTo(expected, 12);
  });

  it("repeats the same seeded result independently of unrelated ratings", () => {
    const puzzle = getPuzzle(COLUMN_OBVIOUS_PAIR.flat().join(""));

    expect(getDependencyScore(puzzle)).toBeCloseTo(
      -3.6666666666666665,
      12
    );
    expect(
      getDependencyScore(
        getPuzzle(
          ADDITIONAL_TEST_BOARDS_BY_NAME.ONLY_OBVIOUS_SINGLES.flat().join("")
        )
      )
    ).toBeCloseTo(-14.4, 12);
    expect(getDependencyScore(puzzle)).toBeCloseTo(
      -3.6666666666666665,
      12
    );
  });

  it("rebuilds candidates instead of trusting user notes", () => {
    const puzzleWithEmptyNotes = getPuzzle(COLUMN_OBVIOUS_PAIR.flat().join(""));
    const puzzleWithMisleadingNotes = clonePuzzle(puzzleWithEmptyNotes);

    for (const row of puzzleWithMisleadingNotes) {
      for (const cell of row) {
        if (cell.type === "note") {
          cell.notes = [1];
        }
      }
    }

    expect(getDependencyScore(puzzleWithEmptyNotes)).toBeCloseTo(
      -3.6666666666666665,
      12
    );
    expect(getDependencyScore(puzzleWithMisleadingNotes)).toBeCloseTo(
      -3.6666666666666665,
      12
    );
  });

  it("treats givens and matching user values identically", () => {
    const givenPuzzle = getPuzzle(COLUMN_OBVIOUS_PAIR.flat().join(""));
    const userValuePuzzle: CellProps[][] = givenPuzzle.map((row) =>
      row.map((cell) =>
        cell.type === "note"
          ? { type: "note", notes: [...cell.notes] }
          : { type: "value", value: cell.value }
      )
    );

    expect(getDependencyScore(givenPuzzle)).toBeCloseTo(
      -3.6666666666666665,
      12
    );
    expect(getDependencyScore(userValuePuzzle)).toBeCloseTo(
      -3.6666666666666665,
      12
    );
  });

  it("does not mutate the puzzle or its note arrays", () => {
    const puzzle = getPuzzle(COLUMN_OBVIOUS_PAIR.flat().join(""));
    const before = clonePuzzle(puzzle);

    getDependencyScore(puzzle);

    expect(puzzle).toEqual(before);
  });
});
