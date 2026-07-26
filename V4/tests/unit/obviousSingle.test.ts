import type {
  CellWithLocation,
  Hint,
  HintStage,
  NoteCellWithLocation,
  ValueCellWithLocation,
} from "../../Types";
import { getObviousSingleHint } from "../../obviousSingle";
import { expectHintWithoutMutation } from "../utils/assertions";
import { createEmptyPuzzle } from "../utils/puzzleFactories";
import { SOLVED_TEST_BOARDS } from "../utils/testBoards";
import { withNotes, withValues } from "../utils/withCells";

const BOARD_SIZE = 6;
const SOLUTION = SOLVED_TEST_BOARDS[BOARD_SIZE];

// A 6x6 board exercises the supported rectangular 2x3 box layout while
// keeping every expected row, column, and box location easy to audit.
const TARGET: NoteCellWithLocation = {
  r: 1,
  c: 1,
  type: "note",
  notes: [5],
};

const TARGET_VALUE = {
  r: 1,
  c: 1,
  type: "value" as const,
  value: 5,
};

const INTRODUCTION_STAGE: HintStage = {
  text: "An obvious single is a cell with only one note remaining.",
};

const IDENTIFICATION_STAGE: HintStage = {
  highlightCells: [{ location: TARGET, highlightType: "focus" }],
  text: "Row 2, column 2 has only one note remaining: 5.",
};

const PLACEMENT_STAGE: HintStage = {
  placeValues: [TARGET_VALUE],
  highlightCells: [{ location: TARGET_VALUE, highlightType: "placement" }],
  text: "Place 5 in row 2, column 2.",
};

const ROW_REMOVAL_STAGE: HintStage = {
  removeNotes: [
    { r: 1, c: 0, type: "note", notes: [5] },
    { r: 1, c: 5, type: "note", notes: [5] },
  ],
  highlightCells: [
    { location: { r: 1, c: 0 }, highlightType: "focus" },
    { location: { r: 1, c: 2 }, highlightType: "focus" },
    { location: { r: 1, c: 3 }, highlightType: "focus" },
    { location: { r: 1, c: 4 }, highlightType: "focus" },
    { location: { r: 1, c: 5 }, highlightType: "focus" },
    { location: TARGET_VALUE, highlightType: "basis" },
  ],
  highlightNotes: [
    {
      location: { r: 1, c: 0 },
      value: 5,
      highlightType: "removal",
    },
    {
      location: { r: 1, c: 5 },
      value: 5,
      highlightType: "removal",
    },
  ],
  text: "Remove note 5 from the other cells in row 2.",
};

const COLUMN_REMOVAL_STAGE: HintStage = {
  removeNotes: [
    { r: 0, c: 1, type: "note", notes: [5] },
    { r: 5, c: 1, type: "note", notes: [5] },
  ],
  highlightCells: [
    { location: { r: 0, c: 1 }, highlightType: "focus" },
    { location: { r: 2, c: 1 }, highlightType: "focus" },
    { location: { r: 3, c: 1 }, highlightType: "focus" },
    { location: { r: 4, c: 1 }, highlightType: "focus" },
    { location: { r: 5, c: 1 }, highlightType: "focus" },
    { location: TARGET_VALUE, highlightType: "basis" },
  ],
  highlightNotes: [
    {
      location: { r: 0, c: 1 },
      value: 5,
      highlightType: "removal",
    },
    {
      location: { r: 5, c: 1 },
      value: 5,
      highlightType: "removal",
    },
  ],
  text: "Remove note 5 from the other cells in column 2.",
};

const BOX_REMOVAL_STAGE: HintStage = {
  removeNotes: [
    { r: 0, c: 0, type: "note", notes: [5] },
    { r: 0, c: 2, type: "note", notes: [5] },
  ],
  highlightCells: [
    { location: { r: 0, c: 0 }, highlightType: "focus" },
    { location: { r: 0, c: 1 }, highlightType: "focus" },
    { location: { r: 0, c: 2 }, highlightType: "focus" },
    { location: { r: 1, c: 0 }, highlightType: "focus" },
    { location: { r: 1, c: 2 }, highlightType: "focus" },
    { location: TARGET_VALUE, highlightType: "basis" },
  ],
  highlightNotes: [
    {
      location: { r: 0, c: 0 },
      value: 5,
      highlightType: "removal",
    },
    {
      location: { r: 0, c: 2 },
      value: 5,
      highlightType: "removal",
    },
  ],
  text: "Remove note 5 from the other cells in the same box.",
};

const PLACEMENT_ONLY_HINT: Hint = {
  strategy: "OBVIOUS_SINGLE",
  stages: [INTRODUCTION_STAGE, IDENTIFICATION_STAGE, PLACEMENT_STAGE],
};

const ROW_REMOVAL_HINT: Hint = {
  strategy: "OBVIOUS_SINGLE",
  stages: [
    INTRODUCTION_STAGE,
    IDENTIFICATION_STAGE,
    PLACEMENT_STAGE,
    ROW_REMOVAL_STAGE,
  ],
};

const COLUMN_REMOVAL_HINT: Hint = {
  strategy: "OBVIOUS_SINGLE",
  stages: [
    INTRODUCTION_STAGE,
    IDENTIFICATION_STAGE,
    PLACEMENT_STAGE,
    COLUMN_REMOVAL_STAGE,
  ],
};

const BOX_REMOVAL_HINT: Hint = {
  strategy: "OBVIOUS_SINGLE",
  stages: [
    INTRODUCTION_STAGE,
    IDENTIFICATION_STAGE,
    PLACEMENT_STAGE,
    BOX_REMOVAL_STAGE,
  ],
};

const PRECEDENCE_HINT: Hint = {
  strategy: "OBVIOUS_SINGLE",
  stages: [
    INTRODUCTION_STAGE,
    IDENTIFICATION_STAGE,
    PLACEMENT_STAGE,
    ROW_REMOVAL_STAGE,
    COLUMN_REMOVAL_STAGE,
    BOX_REMOVAL_STAGE,
  ],
};

const ROW_REMOVAL_INPUTS: readonly NoteCellWithLocation[] = [
  { r: 1, c: 0, type: "note", notes: [1, 5] },
  { r: 1, c: 5, type: "note", notes: [5, 6] },
];

const COLUMN_REMOVAL_INPUTS: readonly NoteCellWithLocation[] = [
  { r: 0, c: 1, type: "note", notes: [2, 5] },
  { r: 5, c: 1, type: "note", notes: [3, 5] },
];

const BOX_REMOVAL_INPUTS: readonly NoteCellWithLocation[] = [
  { r: 0, c: 0, type: "note", notes: [4, 5] },
  { r: 0, c: 2, type: "note", notes: [5, 6] },
];

describe("getObviousSingleHint", () => {
  it.each<{
    label: string;
    peerNotes: readonly NoteCellWithLocation[];
    expectedHint: Hint;
  }>([
    {
      label: "row",
      peerNotes: ROW_REMOVAL_INPUTS,
      expectedHint: ROW_REMOVAL_HINT,
    },
    {
      label: "column",
      peerNotes: COLUMN_REMOVAL_INPUTS,
      expectedHint: COLUMN_REMOVAL_HINT,
    },
    {
      label: "rectangular box",
      peerNotes: BOX_REMOVAL_INPUTS,
      expectedHint: BOX_REMOVAL_HINT,
    },
  ])(
    "returns the exact isolated $label note-removal stage",
    ({ peerNotes, expectedHint }) => {
      const puzzle = withNotes(createEmptyPuzzle(BOARD_SIZE), [
        TARGET,
        ...peerNotes,
      ]);

      expectHintWithoutMutation(
        getObviousSingleHint,
        puzzle,
        SOLUTION,
        TARGET,
        expectedHint
      );
    }
  );

  it("uses row, column, then box precedence without removing overlapping notes twice", () => {
    const puzzle = withNotes(createEmptyPuzzle(BOARD_SIZE), [
      TARGET,
      ...BOX_REMOVAL_INPUTS,
      ...COLUMN_REMOVAL_INPUTS,
      ...ROW_REMOVAL_INPUTS,
    ]);

    expectHintWithoutMutation(
      getObviousSingleHint,
      puzzle,
      SOLUTION,
      TARGET,
      PRECEDENCE_HINT
    );
  });

  it("returns a placement-only hint when peer notes do not contain the placed value", () => {
    const puzzle = withNotes(createEmptyPuzzle(BOARD_SIZE), [
      TARGET,
      { r: 1, c: 2, type: "note", notes: [1, 6] },
      { r: 5, c: 5, type: "note", notes: [5] },
    ]);

    expectHintWithoutMutation(
      getObviousSingleHint,
      puzzle,
      SOLUTION,
      TARGET,
      PLACEMENT_ONLY_HINT
    );
  });

  it("returns null when the sole candidate does not match the solution", () => {
    const incorrectTarget: NoteCellWithLocation = {
      r: TARGET.r,
      c: TARGET.c,
      type: "note",
      notes: [4],
    };
    const puzzle = withNotes(createEmptyPuzzle(BOARD_SIZE), [
      incorrectTarget,
    ]);

    expectHintWithoutMutation(
      getObviousSingleHint,
      puzzle,
      SOLUTION,
      incorrectTarget,
      null
    );
  });

  it.each<{
    label: string;
    target: CellWithLocation;
  }>([
    {
      label: "note cell with no candidates",
      target: { r: 1, c: 1, type: "note", notes: [] },
    },
    {
      label: "note cell with multiple candidates",
      target: { r: 1, c: 1, type: "note", notes: [4, 5] },
    },
    {
      label: "given",
      target: { r: 1, c: 1, type: "given", value: 5 },
    },
    {
      label: "user-entered value",
      target: { r: 1, c: 1, type: "value", value: 5 },
    },
  ])("returns null when the targeted cell is a $label", ({ target }) => {
    const puzzle =
      target.type === "note"
        ? withNotes(createEmptyPuzzle(BOARD_SIZE), [target])
        : withValues(createEmptyPuzzle(BOARD_SIZE), [target]);

    expectHintWithoutMutation(
      getObviousSingleHint,
      puzzle,
      SOLUTION,
      target,
      null
    );
  });

  it("checks only the targeted cell when another cell is an obvious single", () => {
    const targetWithMultipleNotes: NoteCellWithLocation = {
      r: 1,
      c: 1,
      type: "note",
      notes: [4, 5],
    };
    const otherObviousSingle: NoteCellWithLocation = {
      r: 0,
      c: 0,
      type: "note",
      notes: [1],
    };
    const puzzle = withNotes(createEmptyPuzzle(BOARD_SIZE), [
      targetWithMultipleNotes,
      otherObviousSingle,
    ]);

    expectHintWithoutMutation(
      getObviousSingleHint,
      puzzle,
      SOLUTION,
      targetWithMultipleNotes,
      null
    );
  });

  it("uses the targeted obvious single when another one appears earlier on the board", () => {
    const earlierObviousSingle: NoteCellWithLocation = {
      r: 0,
      c: 0,
      type: "note",
      notes: [1],
    };
    const targetedObviousSingle: NoteCellWithLocation = {
      r: 2,
      c: 3,
      type: "note",
      notes: [2],
    };
    const targetedValue: ValueCellWithLocation = {
      r: 2,
      c: 3,
      type: "value",
      value: 2,
    };
    const puzzle = withNotes(createEmptyPuzzle(BOARD_SIZE), [
      earlierObviousSingle,
      targetedObviousSingle,
    ]);
    const expectedHint: Hint = {
      strategy: "OBVIOUS_SINGLE",
      stages: [
        {
          text: "An obvious single is a cell with only one note remaining.",
        },
        {
          highlightCells: [
            { location: targetedObviousSingle, highlightType: "focus" },
          ],
          text: "Row 3, column 4 has only one note remaining: 2.",
        },
        {
          placeValues: [targetedValue],
          highlightCells: [
            {
              location: targetedValue,
              highlightType: "placement",
            },
          ],
          text: "Place 2 in row 3, column 4.",
        },
      ],
    };

    expectHintWithoutMutation(
      getObviousSingleHint,
      puzzle,
      SOLUTION,
      targetedObviousSingle,
      expectedHint
    );
  });
});
