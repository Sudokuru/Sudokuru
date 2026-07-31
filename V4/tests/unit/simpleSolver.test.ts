import { clonePuzzle } from "../../puzzles";
import { solveSimpleStep } from "../../simpleSolver";
import type { CellProps } from "../../Types";

const ALL_NOTES: CellProps[][] = [
  [
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
  ],
  [
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
  ],
  [
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
  ],
  [
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
  ],
];

const PLACED_ONE_AT_ORIGIN: CellProps[][] = [
  [
    { type: "value", value: 1 },
    { type: "note", notes: [2, 3, 4] },
    { type: "note", notes: [2, 3, 4] },
    { type: "note", notes: [2, 3, 4] },
  ],
  [
    { type: "note", notes: [2, 3, 4] },
    { type: "note", notes: [2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
  ],
  [
    { type: "note", notes: [2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
  ],
  [
    { type: "note", notes: [2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
  ],
];

const ROW_HIDDEN_SINGLE: CellProps[][] = [
  [
    { type: "note", notes: [1, 2] },
    { type: "note", notes: [2, 3, 4] },
    { type: "note", notes: [2, 3, 4] },
    { type: "note", notes: [2, 3, 4] },
  ],
  [
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
  ],
  [
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
  ],
  [
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
  ],
];

const COLUMN_HIDDEN_SINGLE: CellProps[][] = [
  [
    { type: "note", notes: [1, 2] },
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
  ],
  [
    { type: "note", notes: [2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
  ],
  [
    { type: "note", notes: [2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
  ],
  [
    { type: "note", notes: [2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
  ],
];

const BOX_HIDDEN_SINGLE: CellProps[][] = [
  [
    { type: "note", notes: [1, 2] },
    { type: "note", notes: [2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
  ],
  [
    { type: "note", notes: [2, 3, 4] },
    { type: "note", notes: [2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
  ],
  [
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
  ],
  [
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
  ],
];

const ROW_PRECEDENCE_INPUT: CellProps[][] = [
  [
    { type: "note", notes: [1, 2] },
    { type: "note", notes: [2, 3, 4] },
    { type: "note", notes: [2, 3, 4] },
    { type: "note", notes: [2, 3, 4] },
  ],
  [
    { type: "note", notes: [1, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
  ],
  [
    { type: "note", notes: [1, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
  ],
  [
    { type: "note", notes: [1, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
  ],
];

const ROW_PRECEDENCE_EXPECTED: CellProps[][] = [
  [
    { type: "value", value: 1 },
    { type: "note", notes: [2, 3, 4] },
    { type: "note", notes: [2, 3, 4] },
    { type: "note", notes: [2, 3, 4] },
  ],
  [
    { type: "note", notes: [3, 4] },
    { type: "note", notes: [2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
  ],
  [
    { type: "note", notes: [3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
  ],
  [
    { type: "note", notes: [3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
  ],
];

const TWO_OBVIOUS_SINGLES: CellProps[][] = [
  [
    { type: "note", notes: [1] },
    { type: "note", notes: [2] },
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
  ],
  [
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
  ],
  [
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
  ],
  [
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
  ],
];

const FIRST_SINGLE_EXPECTED: CellProps[][] = [
  [
    { type: "value", value: 1 },
    { type: "note", notes: [2] },
    { type: "note", notes: [2, 3, 4] },
    { type: "note", notes: [2, 3, 4] },
  ],
  [
    { type: "note", notes: [2, 3, 4] },
    { type: "note", notes: [2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
  ],
  [
    { type: "note", notes: [2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
  ],
  [
    { type: "note", notes: [2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
  ],
];

const SECOND_SINGLE_EXPECTED: CellProps[][] = [
  [
    { type: "note", notes: [1] },
    { type: "value", value: 2 },
    { type: "note", notes: [1, 3, 4] },
    { type: "note", notes: [1, 3, 4] },
  ],
  [
    { type: "note", notes: [1, 3, 4] },
    { type: "note", notes: [1, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
  ],
  [
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
  ],
  [
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
    { type: "note", notes: [1, 2, 3, 4] },
  ],
];

const ROW_MAJOR_RANDOM = (): number => 0.999999;
const MOVE_INDEX_ONE_FIRST_RANDOM = (): number => 0;

describe("solveSimpleStep", () => {
  it("returns null when no obvious or hidden single is available", () => {
    expect(
      solveSimpleStep(clonePuzzle(ALL_NOTES), ROW_MAJOR_RANDOM)
    ).toBeNull();
  });

  it("places one obvious single and simplifies all row, column, and box peers", () => {
    const puzzle = clonePuzzle(ALL_NOTES);
    puzzle[0][0] = { type: "note", notes: [1] };

    expect(solveSimpleStep(puzzle, ROW_MAJOR_RANDOM)).toEqual(
      PLACED_ONE_AT_ORIGIN
    );
  });

  it.each([
    ["row", ROW_HIDDEN_SINGLE],
    ["column", COLUMN_HIDDEN_SINGLE],
    ["box", BOX_HIDDEN_SINGLE],
  ] as const)("places a %s hidden single", (_unit, puzzle) => {
    expect(
      solveSimpleStep(clonePuzzle(puzzle), ROW_MAJOR_RANDOM)
    ).toEqual(PLACED_ONE_AT_ORIGIN);
  });

  it("uses row before column and box hidden-single precedence within a cell", () => {
    expect(
      solveSimpleStep(
        clonePuzzle(ROW_PRECEDENCE_INPUT),
        ROW_MAJOR_RANDOM
      )
    ).toEqual(ROW_PRECEDENCE_EXPECTED);
  });

  it.each([
    {
      label: "row-major first",
      nextRandom: ROW_MAJOR_RANDOM,
      expected: FIRST_SINGLE_EXPECTED,
    },
    {
      label: "shuffled first",
      nextRandom: MOVE_INDEX_ONE_FIRST_RANDOM,
      expected: SECOND_SINGLE_EXPECTED,
    },
  ])(
    "uses the supplied random source to select the $label available single",
    ({ nextRandom, expected }) => {
      expect(
        solveSimpleStep(clonePuzzle(TWO_OBVIOUS_SINGLES), nextRandom)
      ).toEqual(expected);
    }
  );

  it("returns the same result for fresh equivalent random sources", () => {
    const firstResult = solveSimpleStep(
      clonePuzzle(TWO_OBVIOUS_SINGLES),
      ROW_MAJOR_RANDOM
    );
    const secondResult = solveSimpleStep(
      clonePuzzle(TWO_OBVIOUS_SINGLES),
      ROW_MAJOR_RANDOM
    );

    expect(firstResult).toEqual(FIRST_SINGLE_EXPECTED);
    expect(secondResult).toEqual(FIRST_SINGLE_EXPECTED);
  });

  it("does not mutate the puzzle", () => {
    const puzzle = clonePuzzle(ROW_HIDDEN_SINGLE);
    const puzzleBefore = clonePuzzle(puzzle);

    solveSimpleStep(puzzle, ROW_MAJOR_RANDOM);

    expect(puzzle).toEqual(puzzleBefore);
  });
});
