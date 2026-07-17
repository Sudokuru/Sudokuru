import type {
  CellLocation,
  Hint,
  ValueCellWithLocation,
} from "../../Types";
import { valuesToPuzzle } from "../../validate";
import { getWrongValueHint } from "../../wrongValue";
import { ADDITIONAL_TEST_BOARDS_BY_NAME } from "../utils/additionalBoards";
import { expectHintWithoutMutation } from "../utils/assertions";
import {
  boxLocations,
  columnLocations,
  rowLocations,
} from "../../cellLocations";
import { withValues } from "../utils/withValues";

const BASE_PUZZLE = ADDITIONAL_TEST_BOARDS_BY_NAME.ONLY_OBVIOUS_SINGLES;
const SOLUTION = ADDITIONAL_TEST_BOARDS_BY_NAME.ONLY_OBVIOUS_SINGLES_SOLUTION;
const NO_DIRECT_CONFLICT_CASES: Array<{
  label: string;
  wrongValue: ValueCellWithLocation;
}> = [
  {
    label: "documented 4 at row 2, column 2",
    wrongValue: { r: 1, c: 1, type: "value", value: 4 },
  },
  {
    label: "6 at row 1, column 4",
    wrongValue: { r: 0, c: 3, type: "value", value: 6 },
  },
  {
    label: "7 at row 2, column 7",
    wrongValue: { r: 1, c: 6, type: "value", value: 7 },
  },
  {
    label: "2 at row 3, column 4",
    wrongValue: { r: 2, c: 3, type: "value", value: 2 },
  },
];

/**
 * Builds the exact staged hint expected for a direct row, column, or box conflict.
 */
function expectedDirectConflictHint(
  wrongValue: ValueCellWithLocation,
  conflictingCell: ValueCellWithLocation,
  unit: "row" | "column" | "box",
  unitLocations: CellLocation[]
): Hint {
  const otherLocations = unitLocations.filter(
    ({ r, c }) =>
      !(r === wrongValue.r && c === wrongValue.c) &&
      !(r === conflictingCell.r && c === conflictingCell.c)
  );

  return {
    strategy: "WRONG_VALUE",
    stages: [
      {
        highlightCells: [
          ...otherLocations.map((location) => ({
            location,
            highlightType: "focus" as const,
          })),
          { location: wrongValue, highlightType: "removal" },
          { location: conflictingCell, highlightType: "basis" },
        ],
        text: `The ${wrongValue.value} in row ${wrongValue.r + 1}, column ${
          wrongValue.c + 1
        } conflicts with the existing ${wrongValue.value} in the same ${unit}.`,
      },
      {
        removeValues: [wrongValue],
        highlightCells: unitLocations.map((location) => ({
          location,
          highlightType: "focus",
        })),
        text: `Remove the ${wrongValue.value} in row ${wrongValue.r + 1}, column ${
          wrongValue.c + 1
        }.`,
      },
    ],
  };
}

describe("getWrongValueHint", () => {
  it("returns the documented row-conflict hint and prefers the row over the box", () => {
    const wrongValue: ValueCellWithLocation = {
      r: 0,
      c: 3,
      type: "value",
      value: 8,
    };
    const conflictingGiven: ValueCellWithLocation = {
      r: 0,
      c: 4,
      type: "given",
      value: 8,
    };
    const puzzle = withValues(valuesToPuzzle(BASE_PUZZLE), [wrongValue]);
    const expectedHint = expectedDirectConflictHint(
      wrongValue,
      conflictingGiven,
      "row",
      rowLocations(wrongValue.r, puzzle.length)
    );

    expectHintWithoutMutation(
      getWrongValueHint,
      puzzle,
      SOLUTION,
      wrongValue,
      expectedHint
    );
  });

  it("returns a column-conflict hint and prefers the column over the box", () => {
    const wrongValue: ValueCellWithLocation = {
      r: 7,
      c: 0,
      type: "value",
      value: 5,
    };
    const conflictingGiven: ValueCellWithLocation = {
      r: 2,
      c: 0,
      type: "given",
      value: 5,
    };
    const puzzle = withValues(valuesToPuzzle(BASE_PUZZLE), [wrongValue]);
    const expectedHint = expectedDirectConflictHint(
      wrongValue,
      conflictingGiven,
      "column",
      columnLocations(wrongValue.c, puzzle.length)
    );

    expectHintWithoutMutation(
      getWrongValueHint,
      puzzle,
      SOLUTION,
      wrongValue,
      expectedHint
    );
  });

  it("returns a box-conflict hint with row-major box locations", () => {
    const wrongValue: ValueCellWithLocation = {
      r: 1,
      c: 1,
      type: "value",
      value: 3,
    };
    const conflictingGiven: ValueCellWithLocation = {
      r: 0,
      c: 0,
      type: "given",
      value: 3,
    };
    const puzzle = withValues(valuesToPuzzle(BASE_PUZZLE), [wrongValue]);
    const expectedHint = expectedDirectConflictHint(
      wrongValue,
      conflictingGiven,
      "box",
      boxLocations(wrongValue, 3, 3)
    );

    expectHintWithoutMutation(
      getWrongValueHint,
      puzzle,
      SOLUTION,
      wrongValue,
      expectedHint
    );
  });

  it("uses the first conflicting cell in unit traversal order", () => {
    const wrongValue: ValueCellWithLocation = {
      r: 4,
      c: 7,
      type: "value",
      value: 6,
    };
    const firstConflict: ValueCellWithLocation = {
      r: 4,
      c: 1,
      type: "given",
      value: 6,
    };
    const laterConflict: ValueCellWithLocation = {
      r: 4,
      c: 2,
      type: "value",
      value: 6,
    };
    const puzzle = withValues(valuesToPuzzle(BASE_PUZZLE), [
      laterConflict,
      wrongValue,
    ]);
    const expectedHint = expectedDirectConflictHint(
      wrongValue,
      firstConflict,
      "row",
      rowLocations(wrongValue.r, puzzle.length)
    );

    expectHintWithoutMutation(
      getWrongValueHint,
      puzzle,
      SOLUTION,
      wrongValue,
      expectedHint
    );
  });

  it.each(NO_DIRECT_CONFLICT_CASES)(
    "returns the generic no-direct-conflict hint for $label",
    ({ wrongValue }) => {
      const puzzle = withValues(valuesToPuzzle(BASE_PUZZLE), [wrongValue]);
      const expectedHint: Hint = {
        strategy: "WRONG_VALUE",
        stages: [
          {
            highlightCells: [{ location: wrongValue, highlightType: "removal" }],
            text: `The ${wrongValue.value} in row ${wrongValue.r + 1}, column ${
              wrongValue.c + 1
            } is the wrong value for this cell.`,
          },
          {
            removeValues: [wrongValue],
            highlightCells: [{ location: wrongValue, highlightType: "focus" }],
            text: `Remove the ${wrongValue.value} in row ${wrongValue.r + 1}, column ${
              wrongValue.c + 1
            }.`,
          },
        ],
      };

      expectHintWithoutMutation(
        getWrongValueHint,
        puzzle,
        SOLUTION,
        wrongValue,
        expectedHint
      );
    }
  );

  it("returns null when the targeted cell contains notes", () => {
    const puzzle = valuesToPuzzle(BASE_PUZZLE);

    expectHintWithoutMutation(
      getWrongValueHint,
      puzzle,
      SOLUTION,
      { r: 0, c: 2 },
      null
    );
  });

  it("returns null when the targeted cell is a given", () => {
    const wrongGiven: ValueCellWithLocation = {
      r: 1,
      c: 1,
      type: "given",
      value: 4,
    };
    const puzzle = withValues(valuesToPuzzle(BASE_PUZZLE), [wrongGiven]);

    expectHintWithoutMutation(getWrongValueHint, puzzle, SOLUTION, wrongGiven, null);
  });

  it("returns null when the targeted user value matches the solution", () => {
    const correctValue: ValueCellWithLocation = {
      r: 0,
      c: 2,
      type: "value",
      value: 6,
    };
    const puzzle = withValues(valuesToPuzzle(BASE_PUZZLE), [correctValue]);

    expectHintWithoutMutation(getWrongValueHint, puzzle, SOLUTION, correctValue, null);
  });

  it("checks only the targeted cell when another user value is wrong", () => {
    const correctValue: ValueCellWithLocation = {
      r: 0,
      c: 2,
      type: "value",
      value: 6,
    };
    const otherWrongValue: ValueCellWithLocation = {
      r: 1,
      c: 1,
      type: "value",
      value: 4,
    };
    const puzzle = withValues(valuesToPuzzle(BASE_PUZZLE), [
      correctValue,
      otherWrongValue,
    ]);

    expectHintWithoutMutation(getWrongValueHint, puzzle, SOLUTION, correctValue, null);
  });
});
