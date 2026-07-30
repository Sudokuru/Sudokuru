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
import * as wrongValueModule from "../../wrongValue";
import { getWrongValueHint } from "../../wrongValue";
import { expectStrategyHint } from "../utils/assertions";
import { clonePuzzle } from "../utils/clonePuzzle";
import {
  createAmendNotesPuzzle,
  createMixedStrategyPuzzle,
  createObviousSinglePuzzle,
  createSolvedPuzzle,
  createWrongValuePuzzle,
  HINT_TEST_SOLUTION as SOLUTION,
} from "../utils/hintPuzzleFactories";

describe("getHint", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

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

    it("continues to the next vision candidate when a strategy attempt returns null", () => {
      const puzzle = createWrongValuePuzzle();
      const expected = expectStrategyHint(
        getWrongValueHint(puzzle, SOLUTION, { r: 2, c: 0 }),
        "WRONG_VALUE"
      );
      const getWrongValueHintSpy = jest.spyOn(
        wrongValueModule,
        "getWrongValueHint"
      );
      getWrongValueHintSpy.mockReturnValueOnce(null);

      expect(getHint(puzzle, SOLUTION, ["WRONG_VALUE"])).toEqual(expected);
      expect(getWrongValueHintSpy).toHaveBeenNthCalledWith(
        1,
        puzzle,
        SOLUTION,
        { r: 0, c: 0 }
      );
      expect(getWrongValueHintSpy).toHaveBeenNthCalledWith(
        2,
        puzzle,
        SOLUTION,
        { r: 2, c: 0 }
      );
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
