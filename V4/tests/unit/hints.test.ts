import { getAmendNotesHint } from "../../amendNotes";
import { getHint } from "../../hints";
import { getObviousSingleHint } from "../../obviousSingle";
import type {
  CellLocation,
  CellProps,
  Hint,
  SudokuNumber,
  SudokuStrategy,
} from "../../Types";
import { getWrongValueHint } from "../../wrongValue";
import { clonePuzzle } from "../utils/clonePuzzle";

const SOLUTION: readonly (readonly SudokuNumber[])[] = [
  [1, 2, 3, 4],
  [3, 4, 1, 2],
  [4, 1, 2, 3],
  [2, 3, 4, 1],
];

function createSolvedPuzzle(): CellProps[][] {
  return SOLUTION.map((row) =>
    row.map((value) => ({ type: "given", value }))
  );
}

function createWrongValuePuzzle(): CellProps[][] {
  const puzzle = createSolvedPuzzle();
  puzzle[0][0] = { type: "value", value: 2 };
  puzzle[2][0] = { type: "value", value: 1 };
  return puzzle;
}

function createAmendNotesPuzzle(): CellProps[][] {
  const puzzle = createSolvedPuzzle();
  puzzle[0][3] = { type: "note", notes: [1, 2] };
  puzzle[2][0] = { type: "note", notes: [1] };
  return puzzle;
}

function createObviousSinglePuzzle(): CellProps[][] {
  const puzzle = createSolvedPuzzle();
  puzzle[0][2] = { type: "note", notes: [3] };
  puzzle[2][0] = { type: "note", notes: [4] };
  return puzzle;
}

function createMixedStrategyPuzzle(): CellProps[][] {
  const puzzle = createSolvedPuzzle();
  puzzle[0][2] = { type: "note", notes: [3] };
  puzzle[1][1] = { type: "note", notes: [1] };
  puzzle[3][3] = { type: "value", value: 2 };
  return puzzle;
}

function expectStrategyHint(
  hint: Hint | null,
  strategy: SudokuStrategy
): Hint {
  expect(hint).not.toBeNull();
  expect(hint?.strategy).toBe(strategy);
  return hint!;
}

describe("getHint", () => {
  describe("default strategy priority", () => {
    it("returns a wrong-value hint before lower-priority available hints", () => {
      const puzzle = createMixedStrategyPuzzle();
      const expected = expectStrategyHint(
        getWrongValueHint(puzzle, SOLUTION, { r: 3, c: 3 }),
        "WRONG_VALUE"
      );

      expect(getHint(puzzle, SOLUTION)).toEqual(expected);
    });

    it("advances to amend notes when no wrong value is available", () => {
      const puzzle = createAmendNotesPuzzle();
      const expected = expectStrategyHint(
        getAmendNotesHint(puzzle, SOLUTION, { r: 0, c: 3 }),
        "AMEND_NOTES"
      );

      expect(getHint(puzzle, SOLUTION)).toEqual(expected);
    });

    it("skips unavailable earlier strategies to return an obvious single", () => {
      const puzzle = createObviousSinglePuzzle();
      const expected = expectStrategyHint(
        getObviousSingleHint(puzzle, SOLUTION, { r: 0, c: 2 }),
        "OBVIOUS_SINGLE"
      );

      expect(getHint(puzzle, SOLUTION)).toEqual(expected);
    });
  });

  describe("explicit strategy selection", () => {
    it("honors the caller's strategy order", () => {
      const puzzle = createMixedStrategyPuzzle();
      const strategies = [
        "AMEND_NOTES",
        "OBVIOUS_SINGLE",
        "WRONG_VALUE",
      ] as const;
      const expected = expectStrategyHint(
        getAmendNotesHint(puzzle, SOLUTION, { r: 1, c: 1 }),
        "AMEND_NOTES"
      );

      expect(getHint(puzzle, SOLUTION, strategies)).toEqual(expected);
    });

    it("does not return a hint from an omitted strategy", () => {
      const puzzle = createMixedStrategyPuzzle();
      const expected = expectStrategyHint(
        getObviousSingleHint(puzzle, SOLUTION, { r: 0, c: 2 }),
        "OBVIOUS_SINGLE"
      );

      expect(getHint(puzzle, SOLUTION, ["OBVIOUS_SINGLE"])).toEqual(expected);
    });

    it("returns null when the caller enables no strategies", () => {
      expect(getHint(createMixedStrategyPuzzle(), SOLUTION, [])).toBeNull();
    });
  });

  describe("deterministic candidate selection", () => {
    it.each<{
      strategy: SudokuStrategy;
      puzzle: () => CellProps[][];
      firstLocation: CellLocation;
      expectedHint: (
        puzzle: readonly (readonly CellProps[])[],
        solution: readonly (readonly SudokuNumber[])[],
        location: CellLocation
      ) => Hint | null;
    }>([
      {
        strategy: "WRONG_VALUE",
        puzzle: createWrongValuePuzzle,
        firstLocation: { r: 0, c: 0 },
        expectedHint: getWrongValueHint,
      },
      {
        strategy: "AMEND_NOTES",
        puzzle: createAmendNotesPuzzle,
        firstLocation: { r: 0, c: 3 },
        expectedHint: getAmendNotesHint,
      },
      {
        strategy: "OBVIOUS_SINGLE",
        puzzle: createObviousSinglePuzzle,
        firstLocation: { r: 0, c: 2 },
        expectedHint: getObviousSingleHint,
      },
    ])(
      "returns the first queued $strategy candidate",
      ({ strategy, puzzle: createPuzzle, firstLocation, expectedHint }) => {
        const puzzle = createPuzzle();
        const expected = expectStrategyHint(
          expectedHint(puzzle, SOLUTION, firstLocation),
          strategy
        );

        expect(getHint(puzzle, SOLUTION, [strategy])).toEqual(expected);
      }
    );

    it("returns the same hint for repeated calls with the same inputs", () => {
      const puzzle = createMixedStrategyPuzzle();
      const strategies = ["WRONG_VALUE", "AMEND_NOTES"] as const;

      const first = expectStrategyHint(
        getHint(puzzle, SOLUTION, strategies),
        "WRONG_VALUE"
      );
      const second = getHint(puzzle, SOLUTION, strategies);

      expect(second).toEqual(first);
    });
  });

  it("returns null when the puzzle has no available hint", () => {
    expect(getHint(createSolvedPuzzle(), SOLUTION)).toBeNull();
  });

  it("does not mutate the puzzle, solution, or strategy priority", () => {
    const puzzle = createMixedStrategyPuzzle();
    const solution = SOLUTION.map((row) => [...row]);
    const strategies: SudokuStrategy[] = [
      "OBVIOUS_SINGLE",
      "AMEND_NOTES",
      "WRONG_VALUE",
    ];
    const puzzleBefore = clonePuzzle(puzzle);
    const solutionBefore = solution.map((row) => [...row]);
    const strategiesBefore = [...strategies];

    getHint(puzzle, solution, strategies);

    expect(puzzle).toEqual(puzzleBefore);
    expect(solution).toEqual(solutionBefore);
    expect(strategies).toEqual(strategiesBefore);
  });
});
