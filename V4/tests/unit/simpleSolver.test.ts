import { clonePuzzle } from "../../puzzles";
import {
  getAvailableSingles,
  placeSimpleValue,
  prepareSimplePuzzle,
  solveSimpleStep,
} from "../../simpleSolver";
import { SUPPORTED_BOARD_SIZES, type CellProps } from "../../Types";
import { getPuzzle } from "../../validate";
import { SOLVED_TEST_BOARDS } from "../utils/testBoards";

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

describe("prepareSimplePuzzle", () => {
  it("rebuilds legal notes from both givens and user values without changing the input", () => {
    const puzzle = getPuzzle("1000000000000004");
    puzzle[3][3] = { type: "value", value: 4 };
    puzzle[0][1] = { type: "note", notes: [1, 4] };
    const before = clonePuzzle(puzzle);

    const prepared = prepareSimplePuzzle(puzzle);

    expect(prepared).toEqual([
      [{ type: "given", value: 1 }, { type: "note", notes: [2, 3, 4] },
        { type: "note", notes: [2, 3, 4] }, { type: "note", notes: [2, 3] }],
      [{ type: "note", notes: [2, 3, 4] }, { type: "note", notes: [2, 3, 4] },
        { type: "note", notes: [1, 2, 3, 4] }, { type: "note", notes: [1, 2, 3] }],
      [{ type: "note", notes: [2, 3, 4] }, { type: "note", notes: [1, 2, 3, 4] },
        { type: "note", notes: [1, 2, 3] }, { type: "note", notes: [1, 2, 3] }],
      [{ type: "note", notes: [2, 3] }, { type: "note", notes: [1, 2, 3] },
        { type: "note", notes: [1, 2, 3] }, { type: "value", value: 4 }],
    ]);
    expect(puzzle).toEqual(before);
    expect(prepared[0][0]).not.toBe(puzzle[0][0]);
    expect(prepared[0][1]).not.toBe(prepared[0][2]);
    if (prepared[0][1].type === "note" && prepared[0][2].type === "note") {
      expect(prepared[0][1].notes).not.toBe(prepared[0][2].notes);
    }
  });

  it.each(SUPPORTED_BOARD_SIZES)(
    "initializes the sole missing candidate on a size-%i board",
    (size) => {
      const puzzle = getPuzzle(SOLVED_TEST_BOARDS[size].flat().join(""));
      puzzle[0][0] = { type: "note", notes: [] };
      expect(prepareSimplePuzzle(puzzle)[0][0]).toEqual({
        type: "note",
        notes: [1],
      });
    }
  );
});

describe("placeSimpleValue", () => {
  it("places a value, simplifies all peers, and preserves the original puzzle", () => {
    const puzzle = clonePuzzle(ALL_NOTES);
    const before = clonePuzzle(puzzle);
    const updated = placeSimpleValue(puzzle, { r: 0, c: 0 }, 1);
    expect(updated).toEqual(PLACED_ONE_AT_ORIGIN);
    expect(puzzle).toEqual(before);
    expect(updated[3][3]).not.toBe(puzzle[3][3]);
    if (updated[3][3].type === "note" && puzzle[3][3].type === "note") {
      expect(updated[3][3].notes).not.toBe(puzzle[3][3].notes);
    }
  });

  it("leaves an empty note list when an assumption contradicts a peer", () => {
    const puzzle = clonePuzzle(ALL_NOTES);
    puzzle[0][1] = { type: "note", notes: [1] };
    expect(placeSimpleValue(puzzle, { r: 0, c: 0 }, 1)[0][1]).toEqual({
      type: "note",
      notes: [],
    });
    expect(puzzle[0][1]).toEqual({ type: "note", notes: [1] });
  });
});

describe("getAvailableSingles", () => {
  it("returns one move per eligible cell in row-major order", () => {
    const puzzle = clonePuzzle(TWO_OBVIOUS_SINGLES);
    const before = clonePuzzle(puzzle);

    expect(getAvailableSingles(puzzle)).toEqual([
      { location: { r: 0, c: 0 }, value: 1 },
      { location: { r: 0, c: 1 }, value: 2 },
    ]);
    expect(puzzle).toEqual(before);
  });

  it("returns no moves when no cell has an obvious or hidden single", () => {
    expect(getAvailableSingles(ALL_NOTES)).toEqual([]);
  });

  it("counts a cell hidden in its row, column, and box only once", () => {
    const puzzle = clonePuzzle(ROW_HIDDEN_SINGLE);
    puzzle[1][0] = { type: "note", notes: [2, 3, 4] };
    puzzle[1][1] = { type: "note", notes: [2, 3, 4] };
    puzzle[2][0] = { type: "note", notes: [2, 3, 4] };
    puzzle[3][0] = { type: "note", notes: [2, 3, 4] };
    puzzle[3][3] = { type: "note", notes: [2] };

    expect(getAvailableSingles(puzzle)).toEqual([
      { location: { r: 0, c: 0 }, value: 1 },
      { location: { r: 3, c: 3 }, value: 2 },
    ]);
  });

  it("chooses row before column and box when a cell has competing hidden singles", () => {
    expect(getAvailableSingles(ROW_PRECEDENCE_INPUT)[0]).toEqual({
      location: { r: 0, c: 0 },
      value: 1,
    });
  });

  it("chooses column before box when a cell has competing hidden singles", () => {
    const puzzle = clonePuzzle(COLUMN_HIDDEN_SINGLE);
    puzzle[0][1] = { type: "note", notes: [1, 3, 4] };
    puzzle[1][0] = { type: "note", notes: [3, 4] };
    puzzle[1][1] = { type: "note", notes: [1, 3, 4] };

    expect(getAvailableSingles(puzzle)[0]).toEqual({
      location: { r: 0, c: 0 },
      value: 1,
    });
  });
});

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
