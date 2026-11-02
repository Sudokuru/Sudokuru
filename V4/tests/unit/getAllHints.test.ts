import { getAmendNotesHint } from "../../amendNotes";
import { getAllHints } from "../../hints";
import { getObviousSingleHint } from "../../obviousSingle";
import * as sudokuVisionModule from "../../sudokuVision";
import type {
  CellLocation,
  CellProps,
  Hint,
  SudokuNumber,
  SudokuStrategy,
} from "../../Types";
import * as wrongValueModule from "../../wrongValue";
import { getWrongValueHint } from "../../wrongValue";
import { clonePuzzle } from "../../puzzles";
import { expectStrategyHint } from "../utils/assertions";
import {
  createAmendNotesPuzzle,
  createMixedStrategyPuzzle,
  createObviousSinglePuzzle,
  createSolvedPuzzle,
  createWrongValuePuzzle,
  HINT_TEST_SOLUTION as SOLUTION,
} from "../utils/hintPuzzleFactories";

describe("getAllHints", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("collecting every hint for the requested strategy", () => {
    it.each<{
      strategy: SudokuStrategy;
      createPuzzle: () => CellProps[][];
      locations: CellLocation[];
      getStrategyHint: (
        puzzle: readonly (readonly CellProps[])[],
        solution: readonly (readonly SudokuNumber[])[],
        location: CellLocation
      ) => Hint | null;
    }>([
      {
        strategy: "WRONG_VALUE",
        createPuzzle: createWrongValuePuzzle,
        locations: [
          { r: 0, c: 0 },
          { r: 2, c: 0 },
          { r: 3, c: 3 },
        ],
        getStrategyHint: getWrongValueHint,
      },
      {
        strategy: "AMEND_NOTES",
        createPuzzle: createAmendNotesPuzzle,
        locations: [
          { r: 0, c: 3 },
          { r: 2, c: 0 },
          { r: 3, c: 3 },
        ],
        getStrategyHint: getAmendNotesHint,
      },
      {
        strategy: "OBVIOUS_SINGLE",
        createPuzzle: createObviousSinglePuzzle,
        locations: [
          { r: 0, c: 2 },
          { r: 2, c: 0 },
          { r: 3, c: 3 },
        ],
        getStrategyHint: getObviousSingleHint,
      },
    ])(
      "returns every $strategy hint in deterministic vision order",
      ({ strategy, createPuzzle, locations, getStrategyHint }) => {
        const puzzle = createPuzzle();
        const expected = locations.map((location) =>
          expectStrategyHint(
            getStrategyHint(puzzle, SOLUTION, location),
            strategy
          )
        );

        expect(getAllHints(puzzle, SOLUTION, strategy)).toEqual(expected);
      }
    );

    it("collects only the required strategy when other strategies are available", () => {
      const puzzle = createMixedStrategyPuzzle();
      const expected = [
        expectStrategyHint(
          getObviousSingleHint(puzzle, SOLUTION, { r: 0, c: 2 }),
          "OBVIOUS_SINGLE"
        ),
      ];

      expect(getAllHints(puzzle, SOLUTION, "OBVIOUS_SINGLE")).toEqual(
        expected
      );
    });

    it("returns an empty array when the requested strategy has no hints", () => {
      expect(
        getAllHints(createSolvedPuzzle(), SOLUTION, "WRONG_VALUE")
      ).toEqual([]);
    });
  });

  describe("candidate retry and multiplicity", () => {
    it("skips null strategy attempts and continues collecting later candidates", () => {
      const puzzle = createWrongValuePuzzle();
      const expected = [
        expectStrategyHint(
          getWrongValueHint(puzzle, SOLUTION, { r: 2, c: 0 }),
          "WRONG_VALUE"
        ),
        expectStrategyHint(
          getWrongValueHint(puzzle, SOLUTION, { r: 3, c: 3 }),
          "WRONG_VALUE"
        ),
      ];
      const getWrongValueHintSpy = jest.spyOn(
        wrongValueModule,
        "getWrongValueHint"
      );
      getWrongValueHintSpy.mockReturnValueOnce(null);

      expect(getAllHints(puzzle, SOLUTION, "WRONG_VALUE")).toEqual(expected);
      expect(getWrongValueHintSpy).toHaveBeenCalledTimes(3);
    });

    it("preserves distinct hints that target the same cell", () => {
      const location = { r: 0, c: 0 };
      const firstHint: Hint = {
        strategy: "WRONG_VALUE",
        stages: [{ text: "First application at this cell." }],
      };
      const secondHint: Hint = {
        strategy: "WRONG_VALUE",
        stages: [{ text: "Second application at this cell." }],
      };
      function* generateRepeatedVisionChecks() {
        yield ["WRONG_VALUE", location] as const;
        yield ["WRONG_VALUE", location] as const;
      }

      jest
        .spyOn(sudokuVisionModule, "createSudokuVision")
        .mockReturnValue(generateRepeatedVisionChecks());
      jest
        .spyOn(wrongValueModule, "getWrongValueHint")
        .mockReturnValueOnce(firstHint)
        .mockReturnValueOnce(secondHint);

      expect(
        getAllHints(createSolvedPuzzle(), SOLUTION, "WRONG_VALUE")
      ).toEqual([firstHint, secondHint]);
    });
  });

  it("returns equal results for repeated calls with the same inputs", () => {
    const puzzle = createWrongValuePuzzle();

    const first = getAllHints(puzzle, SOLUTION, "WRONG_VALUE");
    const second = getAllHints(puzzle, SOLUTION, "WRONG_VALUE");

    expect(second).toEqual(first);
    expect(second).not.toBe(first);
  });

  it("does not mutate the puzzle or solution", () => {
    const puzzle = createWrongValuePuzzle();
    const solution = SOLUTION.map((row) => [...row]);
    const puzzleBefore = clonePuzzle(puzzle);
    const solutionBefore = solution.map((row) => [...row]);

    getAllHints(puzzle, solution, "WRONG_VALUE");

    expect(puzzle).toEqual(puzzleBefore);
    expect(solution).toEqual(solutionBefore);
  });
});
