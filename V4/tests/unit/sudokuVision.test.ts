import { createSudokuVision } from "../../sudokuVision";
import type { CellProps, SudokuNumber } from "../../Types";
import { clonePuzzle } from "../utils/clonePuzzle";

const SOLUTION: readonly (readonly SudokuNumber[])[] = [
  [1, 2, 3, 4],
  [3, 4, 1, 2],
  [4, 1, 2, 3],
  [2, 3, 4, 1],
];

function createPuzzle(): CellProps[][] {
  return [
    [
      { type: "note", notes: [] },
      { type: "value", value: 2 },
      { type: "note", notes: [3] },
      { type: "value", value: 2 },
    ],
    [
      { type: "given", value: 1 },
      { type: "note", notes: [] },
      { type: "note", notes: [] },
      { type: "note", notes: [] },
    ],
    [
      { type: "value", value: 1 },
      { type: "note", notes: [] },
      { type: "note", notes: [] },
      { type: "note", notes: [] },
    ],
    [
      { type: "note", notes: [] },
      { type: "note", notes: [] },
      { type: "note", notes: [] },
      { type: "value", value: 2 },
    ],
  ];
}

describe("createSudokuVision", () => {
  it("pops wrong user values from top to bottom and left to right", () => {
    const vision = createSudokuVision(createPuzzle(), SOLUTION);

    expect(vision.pop()).toEqual(["WRONG_VALUE", { r: 0, c: 3 }]);
    expect(vision.pop()).toEqual(["WRONG_VALUE", { r: 2, c: 0 }]);
    expect(vision.pop()).toEqual(["WRONG_VALUE", { r: 3, c: 3 }]);
    expect(vision.pop()).toBeNull();
  });

  it("does not queue wrong values when the strategy is excluded", () => {
    const vision = createSudokuVision(createPuzzle(), SOLUTION, [
      "AMEND_NOTES",
    ]);

    expect(vision.pop()).toBeNull();
  });

  it("does not pop wrong values before they become the highest-priority strategy", () => {
    const vision = createSudokuVision(createPuzzle(), SOLUTION, [
      "AMEND_NOTES",
      "WRONG_VALUE",
    ]);

    expect(vision.pop()).toBeNull();
  });

  it("does not mutate the puzzle or solution while building or consuming the queue", () => {
    const puzzle = createPuzzle();
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
