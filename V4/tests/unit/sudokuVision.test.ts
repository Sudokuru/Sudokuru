import { createSudokuVision } from "../../sudokuVision";
import type { CellProps, SudokuNumber } from "../../Types";
import { clonePuzzle } from "../utils/clonePuzzle";

const SOLUTION: readonly (readonly SudokuNumber[])[] = [
  [1, 2, 3, 4],
  [3, 4, 1, 2],
  [4, 1, 2, 3],
  [2, 3, 4, 1],
];

function createWrongValuePuzzle(): CellProps[][] {
  return [
    [
      { type: "note", notes: [1] },
      { type: "value", value: 2 },
      { type: "note", notes: [3] },
      { type: "value", value: 2 },
    ],
    [
      { type: "given", value: 1 },
      { type: "note", notes: [4] },
      { type: "note", notes: [1] },
      { type: "note", notes: [2] },
    ],
    [
      { type: "value", value: 1 },
      { type: "note", notes: [1] },
      { type: "note", notes: [2] },
      { type: "note", notes: [3] },
    ],
    [
      { type: "note", notes: [2] },
      { type: "note", notes: [3] },
      { type: "note", notes: [4] },
      { type: "value", value: 2 },
    ],
  ];
}

function createAmendNotesPuzzle(): CellProps[][] {
  const puzzle: CellProps[][] = SOLUTION.map((row) =>
    row.map((value) => ({ type: "note", notes: [value] }))
  );

  puzzle[0][3] = { type: "note", notes: [1, 2] };
  puzzle[2][0] = { type: "note", notes: [1] };
  puzzle[3][3] = { type: "note", notes: [] };

  return puzzle;
}

describe("createSudokuVision", () => {
  it("pops wrong user values from top to bottom and left to right", () => {
    const vision = createSudokuVision(createWrongValuePuzzle(), SOLUTION);

    expect(vision.pop()).toEqual(["WRONG_VALUE", { r: 0, c: 3 }]);
    expect(vision.pop()).toEqual(["WRONG_VALUE", { r: 2, c: 0 }]);
    expect(vision.pop()).toEqual(["WRONG_VALUE", { r: 3, c: 3 }]);
    expect(vision.pop()).toBeNull();
  });

  it("does not queue wrong values when the strategy is excluded", () => {
    const vision = createSudokuVision(createWrongValuePuzzle(), SOLUTION, [
      "AMEND_NOTES",
    ]);

    expect(vision.pop()).toBeNull();
  });

  it("pops higher-priority amend notes before wrong values", () => {
    const puzzle = createWrongValuePuzzle();
    puzzle[0][0] = { type: "note", notes: [] };
    const vision = createSudokuVision(puzzle, SOLUTION, [
      "AMEND_NOTES",
      "WRONG_VALUE",
    ]);

    expect(vision.pop()).toEqual(["AMEND_NOTES", { r: 0, c: 0 }]);
  });

  it("pops cells missing the correct note from top to bottom and left to right", () => {
    const vision = createSudokuVision(createAmendNotesPuzzle(), SOLUTION, [
      "AMEND_NOTES",
    ]);

    expect(vision.pop()).toEqual(["AMEND_NOTES", { r: 0, c: 3 }]);
    expect(vision.pop()).toEqual(["AMEND_NOTES", { r: 2, c: 0 }]);
    expect(vision.pop()).toEqual(["AMEND_NOTES", { r: 3, c: 3 }]);
    expect(vision.pop()).toBeNull();
  });

  it("does not mutate the puzzle or solution while building or consuming the queue", () => {
    const puzzle = createWrongValuePuzzle();
    const puzzleBefore = clonePuzzle(puzzle);
    const solutionBefore = SOLUTION.map((row) => [...row]);
    const vision = createSudokuVision(puzzle, SOLUTION);

    while (vision.pop() !== null) {
      // Consume every queued location.
    }

    expect(puzzle).toEqual(puzzleBefore);
    expect(SOLUTION).toEqual(solutionBefore);
  });
});
