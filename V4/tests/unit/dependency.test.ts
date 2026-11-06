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
  describe("sampling options", () => {
    it("uses explicitly supplied sampling settings", () => {
      const puzzle = getPuzzle(COLUMN_OBVIOUS_PAIR.flat().join(""));

      expect(
        getDependencyScore(puzzle, { runCount: 3, stepCount: 20, seed: 81 })
      ).toBeCloseTo(-3.6666666666666665, 12);
    });

    it.each([
      [1, -3],
      [2, -2.5],
      [3, -2],
      [20, -0.3],
    ])("averages over a fixed %i-step sampling window", (stepCount, expected) => {
      // This 2x2 puzzle offers three singles, then two, then one.
      const puzzle = getPuzzle("1000");

      expect(getDependencyScore(puzzle, { runCount: 3, seed: 81,  stepCount })).toBe(expected);
    });

    it("uses the requested number of independently started paths", () => {
      const puzzle = getPuzzle(COLUMN_OBVIOUS_PAIR.flat().join(""));

      expect(getDependencyScore(puzzle, {stepCount: 20, seed: 81,  runCount: 1 })).toBe(-3.7);
      expect(getDependencyScore(puzzle, {stepCount: 20, seed: 81,  runCount: 3 })).toBeCloseTo(
        -3.6666666666666665,
        12
      );
    });

    it("uses an explicit zero seed and repeats that stream independently", () => {
      const puzzle = getPuzzle(COLUMN_OBVIOUS_PAIR.flat().join(""));

      expect(getDependencyScore(puzzle, { runCount: 3, stepCount: 20,  seed: 0 })).toBeCloseTo(
        -3.683333333333333,
        12
      );
      expect(getDependencyScore(puzzle, { runCount: 3, stepCount: 20, seed: 81 })).toBeCloseTo(-3.6666666666666665, 12);
      expect(getDependencyScore(puzzle, { runCount: 3, stepCount: 20,  seed: 0 })).toBeCloseTo(
        -3.683333333333333,
        12
      );
    });

    it.each([0, -1, 1.5, NaN, Infinity])(
      "rejects invalid run count %s",
      (runCount) => {
        expect(() =>
          getDependencyScore(getPuzzle("1000"), {stepCount: 20, seed: 81,  runCount })
        ).toThrow(RangeError);
      }
    );

    it.each([0, -1, 1.5, NaN, Infinity])(
      "rejects invalid step count %s",
      (stepCount) => {
        expect(() =>
          getDependencyScore(getPuzzle("1000"), { runCount: 3, seed: 81,  stepCount })
        ).toThrow(RangeError);
      }
    );
  });

  it.each(SUPPORTED_BOARD_SIZES)(
    "returns zero for a solved size-%i puzzle",
    (size) => {
      const puzzle = getPuzzle(SOLVED_TEST_BOARDS[size].flat().join(""));
      expect(getDependencyScore(puzzle, { runCount: 3, stepCount: 20, seed: 81 })).toBe(0);
    }
  );

  it("returns zero when a puzzle has no available simple move", () => {
    expect(getDependencyScore(createEmptyPuzzle(4), { runCount: 3, stepCount: 20, seed: 81 })).toBe(0);
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

      expect(getDependencyScore(puzzle, { runCount: 3, stepCount: 20, seed: 81 })).toBe(-0.05);
    }
  );

  it.each([
    ["ONLY_OBVIOUS_SINGLES", -14.4],
    ["COLUMN_OBVIOUS_PAIR", -3.6666666666666665],
  ] as const)("matches the V4 sampled score for %s", (fixtureName, expected) => {
    const puzzle = getPuzzle(
      ADDITIONAL_TEST_BOARDS_BY_NAME[fixtureName].flat().join("")
    );
    expect(getDependencyScore(puzzle, { runCount: 3, stepCount: 20, seed: 81 })).toBeCloseTo(expected, 12);
  });

  it("repeats the same seeded result independently of unrelated ratings", () => {
    const puzzle = getPuzzle(COLUMN_OBVIOUS_PAIR.flat().join(""));

    expect(getDependencyScore(puzzle, { runCount: 3, stepCount: 20, seed: 81 })).toBeCloseTo(
      -3.6666666666666665,
      12
    );
    expect(
      getDependencyScore(
        getPuzzle(
          ADDITIONAL_TEST_BOARDS_BY_NAME.ONLY_OBVIOUS_SINGLES.flat().join("")
        ), { runCount: 3, stepCount: 20, seed: 81 }
      )
    ).toBeCloseTo(-14.4, 12);
    expect(getDependencyScore(puzzle, { runCount: 3, stepCount: 20, seed: 81 })).toBeCloseTo(
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

    expect(getDependencyScore(puzzleWithEmptyNotes, { runCount: 3, stepCount: 20, seed: 81 })).toBeCloseTo(
      -3.6666666666666665,
      12
    );
    expect(getDependencyScore(puzzleWithMisleadingNotes, { runCount: 3, stepCount: 20, seed: 81 })).toBeCloseTo(
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

    expect(getDependencyScore(givenPuzzle, { runCount: 3, stepCount: 20, seed: 81 })).toBeCloseTo(
      -3.6666666666666665,
      12
    );
    expect(getDependencyScore(userValuePuzzle, { runCount: 3, stepCount: 20, seed: 81 })).toBeCloseTo(
      -3.6666666666666665,
      12
    );
  });

  it("does not mutate the puzzle or its note arrays", () => {
    const puzzle = getPuzzle(COLUMN_OBVIOUS_PAIR.flat().join(""));
    const before = clonePuzzle(puzzle);

    getDependencyScore(puzzle, { runCount: 3, stepCount: 20, seed: 81 });

    expect(puzzle).toEqual(before);
  });
});
