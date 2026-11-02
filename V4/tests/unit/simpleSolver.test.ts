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

const FIRST_SINGLE_RANDOM = (): number => 0;
const LAST_SINGLE_RANDOM = (): number => 0.999999;

describe("solveSimpleStep", () => {
  it.each([
    ["no singles", ALL_NOTES],
    ["one single", ROW_HIDDEN_SINGLE],
  ] as const)("does not draw randomness with %s", (_label, puzzle) => {
    solveSimpleStep(clonePuzzle(puzzle), () => {
      throw new Error("No random choice is needed");
    });
  });

  it.each([
    [0, FIRST_SINGLE_EXPECTED],
    [0.499999, FIRST_SINGLE_EXPECTED],
    [0.5, SECOND_SINGLE_EXPECTED],
    [0.999999, SECOND_SINGLE_EXPECTED],
  ] as const)("uses exactly one draw at the selection boundary %s", (draw, expected) => {
    let drawCount = 0;
    const result = solveSimpleStep(clonePuzzle(TWO_OBVIOUS_SINGLES), () => {
      drawCount += 1;
      return draw;
    });

    expect(result).toEqual(expected);
    expect(drawCount).toBe(1);
  });

  it.each([
    [0.499999, 0, 0, 1],
    [0.5, 3, 3, 2],
  ] as const)(
    "counts a cell hidden in three units only once when drawing %s",
    (draw, row, column, value) => {
      const puzzle = clonePuzzle(ROW_HIDDEN_SINGLE);
      puzzle[1][0] = { type: "note", notes: [2, 3, 4] };
      puzzle[1][1] = { type: "note", notes: [2, 3, 4] };
      puzzle[2][0] = { type: "note", notes: [2, 3, 4] };
      puzzle[3][0] = { type: "note", notes: [2, 3, 4] };
      puzzle[3][3] = { type: "note", notes: [2] };

      const result = solveSimpleStep(puzzle, () => draw);

      expect(result?.[row][column]).toEqual({ type: "value", value });
    }
  );

  it("returns null when no obvious or hidden single is available", () => {
    expect(
      solveSimpleStep(clonePuzzle(ALL_NOTES), FIRST_SINGLE_RANDOM)
    ).toBeNull();
  });

  it("places one obvious single and simplifies all row, column, and box peers", () => {
    const puzzle = clonePuzzle(ALL_NOTES);
    puzzle[0][0] = { type: "note", notes: [1] };

    expect(solveSimpleStep(puzzle, FIRST_SINGLE_RANDOM)).toEqual(
      PLACED_ONE_AT_ORIGIN
    );
  });

  it.each([
    ["row", ROW_HIDDEN_SINGLE],
    ["column", COLUMN_HIDDEN_SINGLE],
    ["box", BOX_HIDDEN_SINGLE],
  ] as const)("places a %s hidden single", (_unit, puzzle) => {
    expect(
      solveSimpleStep(clonePuzzle(puzzle), FIRST_SINGLE_RANDOM)
    ).toEqual(PLACED_ONE_AT_ORIGIN);
  });

  it("uses row before column and box hidden-single precedence within a cell", () => {
    expect(
      solveSimpleStep(
        clonePuzzle(ROW_PRECEDENCE_INPUT),
        FIRST_SINGLE_RANDOM
      )
    ).toEqual(ROW_PRECEDENCE_EXPECTED);
  });

  it.each([
    {
      label: "row-major first",
      nextRandom: FIRST_SINGLE_RANDOM,
      expected: FIRST_SINGLE_EXPECTED,
    },
    {
      label: "row-major last",
      nextRandom: LAST_SINGLE_RANDOM,
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
      FIRST_SINGLE_RANDOM
    );
    const secondResult = solveSimpleStep(
      clonePuzzle(TWO_OBVIOUS_SINGLES),
      FIRST_SINGLE_RANDOM
    );

    expect(firstResult).toEqual(FIRST_SINGLE_EXPECTED);
    expect(secondResult).toEqual(FIRST_SINGLE_EXPECTED);
  });

  it("does not mutate the puzzle", () => {
    const puzzle = clonePuzzle(ROW_HIDDEN_SINGLE);
    const puzzleBefore = clonePuzzle(puzzle);

    solveSimpleStep(puzzle, FIRST_SINGLE_RANDOM);

    expect(puzzle).toEqual(puzzleBefore);
  });
});
