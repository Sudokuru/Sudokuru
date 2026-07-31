import { createSudokuVision } from "../../sudokuVision";
import type { CellProps, SudokuNumber } from "../../Types";
import { clonePuzzle } from "../../puzzles";

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

function createObviousSinglePuzzle(): CellProps[][] {
  const puzzle: CellProps[][] = SOLUTION.map((row) =>
    row.map((value) => ({
      type: "note",
      notes: [value, value === 4 ? 1 : value + 1],
    }))
  );

  puzzle[0][0] = { type: "note", notes: [] };
  puzzle[0][2] = { type: "note", notes: [3] };
  puzzle[1][1] = { type: "note", notes: [2] };
  puzzle[2][0] = { type: "note", notes: [4] };
  puzzle[3][3] = { type: "note", notes: [1] };

  return puzzle;
}

function createDefaultPriorityObviousSinglePuzzle(): CellProps[][] {
  const puzzle = createObviousSinglePuzzle();

  puzzle[0][0] = { type: "note", notes: [1, 2] };
  puzzle[1][1] = { type: "note", notes: [4, 1] };

  return puzzle;
}

describe("createSudokuVision", () => {
  it("yields wrong user values from top to bottom and left to right", () => {
    const vision = createSudokuVision(
      createWrongValuePuzzle(),
      SOLUTION,
      ["WRONG_VALUE"]
    );

    expect(vision.next()).toEqual({
      value: ["WRONG_VALUE", { r: 0, c: 3 }],
      done: false,
    });
    expect(vision.next()).toEqual({
      value: ["WRONG_VALUE", { r: 2, c: 0 }],
      done: false,
    });
    expect(vision.next()).toEqual({
      value: ["WRONG_VALUE", { r: 3, c: 3 }],
      done: false,
    });
    expect(vision.next()).toEqual({ value: undefined, done: true });
  });

  it("does not yield wrong values when the strategy is excluded", () => {
    const vision = createSudokuVision(createWrongValuePuzzle(), SOLUTION, [
      "AMEND_NOTES",
    ]);

    expect(vision.next()).toEqual({ value: undefined, done: true });
  });

  it("yields higher-priority amend notes before wrong values", () => {
    const puzzle = createWrongValuePuzzle();
    puzzle[0][0] = { type: "note", notes: [] };
    const vision = createSudokuVision(puzzle, SOLUTION, [
      "AMEND_NOTES",
      "WRONG_VALUE",
    ]);

    expect(vision.next()).toEqual({
      value: ["AMEND_NOTES", { r: 0, c: 0 }],
      done: false,
    });
    expect(vision.next()).toEqual({
      value: ["WRONG_VALUE", { r: 0, c: 3 }],
      done: false,
    });
  });

  it("advances from an empty wrong-value generator to amend notes", () => {
    const vision = createSudokuVision(createAmendNotesPuzzle(), SOLUTION, [
      "WRONG_VALUE",
      "AMEND_NOTES",
    ]);

    expect(vision.next()).toEqual({
      value: ["AMEND_NOTES", { r: 0, c: 3 }],
      done: false,
    });
  });

  it("advances from an empty amend-notes generator to wrong values", () => {
    const vision = createSudokuVision(createWrongValuePuzzle(), SOLUTION, [
      "AMEND_NOTES",
      "WRONG_VALUE",
    ]);

    expect(vision.next()).toEqual({
      value: ["WRONG_VALUE", { r: 0, c: 3 }],
      done: false,
    });
  });

  it("yields cells missing the correct note from top to bottom and left to right", () => {
    const vision = createSudokuVision(createAmendNotesPuzzle(), SOLUTION, [
      "AMEND_NOTES",
    ]);

    expect(vision.next()).toEqual({
      value: ["AMEND_NOTES", { r: 0, c: 3 }],
      done: false,
    });
    expect(vision.next()).toEqual({
      value: ["AMEND_NOTES", { r: 2, c: 0 }],
      done: false,
    });
    expect(vision.next()).toEqual({
      value: ["AMEND_NOTES", { r: 3, c: 3 }],
      done: false,
    });
    expect(vision.next()).toEqual({ value: undefined, done: true });
  });

  it("yields valid obvious singles from the note-count scan order", () => {
    const vision = createSudokuVision(
      createObviousSinglePuzzle(),
      SOLUTION,
      ["OBVIOUS_SINGLE"]
    );

    expect(vision.next()).toEqual({
      value: ["OBVIOUS_SINGLE", { r: 0, c: 2 }],
      done: false,
    });
    expect(vision.next()).toEqual({
      value: ["OBVIOUS_SINGLE", { r: 2, c: 0 }],
      done: false,
    });
    expect(vision.next()).toEqual({
      value: ["OBVIOUS_SINGLE", { r: 3, c: 3 }],
      done: false,
    });
    expect(vision.next()).toEqual({ value: undefined, done: true });
  });

  it("advances from an empty earlier generator to obvious singles", () => {
    const vision = createSudokuVision(
      createObviousSinglePuzzle(),
      SOLUTION,
      ["WRONG_VALUE", "OBVIOUS_SINGLE"]
    );

    expect(vision.next()).toEqual({
      value: ["OBVIOUS_SINGLE", { r: 0, c: 2 }],
      done: false,
    });
  });

  it("advances through earlier default strategies to obvious singles", () => {
    const vision = createSudokuVision(
      createDefaultPriorityObviousSinglePuzzle(),
      SOLUTION
    );

    expect(vision.next()).toEqual({
      value: ["OBVIOUS_SINGLE", { r: 0, c: 2 }],
      done: false,
    });
  });

  it("does not mutate the puzzle or solution while consuming the generator", () => {
    const puzzle = createWrongValuePuzzle();
    const puzzleBefore = clonePuzzle(puzzle);
    const solutionBefore = SOLUTION.map((row) => [...row]);
    const vision = createSudokuVision(puzzle, SOLUTION);

    while (vision.next().done !== true) {
      // Consume every generated location.
    }

    expect(puzzle).toEqual(puzzleBefore);
    expect(SOLUTION).toEqual(solutionBefore);
  });
});
