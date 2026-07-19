import type {
  Hint,
  HintStage,
  NoteCellWithLocation,
  SudokuValue,
  ValueCellWithLocation,
} from "../../Types";
import { getAmendNotesHint } from "../../amendNotes";
import { ADDITIONAL_TEST_BOARDS_BY_NAME } from "../utils/additionalBoards";
import { expectHintWithoutMutation } from "../utils/assertions";
import { createEmptyPuzzle } from "../utils/puzzleFactories";
import { withNotes, withValues } from "../utils/withCells";

const BOARD_SIZE = 9;
const ALL_NOTES: SudokuValue[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

/**
 * Every placed value in the synthetic fixtures matches this solved board, so
 * the tests vary only the note state and amend-notes context.
 */
const SOLUTION =
  ADDITIONAL_TEST_BOARDS_BY_NAME.ONLY_OBVIOUS_SINGLES_SOLUTION;

// The central target keeps row, column, and box expectations easy to audit.
const TARGET: NoteCellWithLocation = {
  r: 4,
  c: 4,
  type: "note",
  notes: [],
};

const TARGET_WITH_EXISTING_NOTE: NoteCellWithLocation = {
  r: 4,
  c: 4,
  type: "note",
  notes: [3],
};

const TARGET_WITH_ALL_NOTES: NoteCellWithLocation = {
  r: 4,
  c: 4,
  type: "note",
  notes: ALL_NOTES,
};

const INTRODUCTION_STAGE: HintStage = {
  text: "Amend notes makes a cell contain every note that does not conflict with its row, column, or box.",
};

const EMPTY_TARGET_PLACEMENT_STAGE: HintStage = {
  placeNotes: [{ r: 4, c: 4, type: "note", notes: ALL_NOTES }],
  highlightCells: [{ location: TARGET, highlightType: "focus" }],
  highlightNotes: [
    { location: TARGET, value: 1, highlightType: "placement" },
    { location: TARGET, value: 2, highlightType: "placement" },
    { location: TARGET, value: 3, highlightType: "placement" },
    { location: TARGET, value: 4, highlightType: "placement" },
    { location: TARGET, value: 5, highlightType: "placement" },
    { location: TARGET, value: 6, highlightType: "placement" },
    { location: TARGET, value: 7, highlightType: "placement" },
    { location: TARGET, value: 8, highlightType: "placement" },
    { location: TARGET, value: 9, highlightType: "placement" },
  ],
  text: "Add all notes not already present to the cell in row 5, column 5.",
};

const ROW_REMOVAL_STAGE: HintStage = {
  removeNotes: [{ r: 4, c: 4, type: "note", notes: [7] }],
  highlightCells: [
    { location: TARGET, highlightType: "focus" },
    { location: { r: 4, c: 1 }, highlightType: "focus" },
    { location: { r: 4, c: 2 }, highlightType: "focus" },
    { location: { r: 4, c: 3 }, highlightType: "focus" },
    { location: { r: 4, c: 5 }, highlightType: "focus" },
    { location: { r: 4, c: 6 }, highlightType: "focus" },
    { location: { r: 4, c: 7 }, highlightType: "focus" },
    { location: { r: 4, c: 8 }, highlightType: "focus" },
    { location: { r: 4, c: 0 }, highlightType: "basis" },
  ],
  highlightNotes: [
    { location: TARGET, value: 7, highlightType: "removal" },
  ],
  text: "Remove note 7 because that number is already in row 5.",
};

const COLUMN_REMOVAL_STAGE: HintStage = {
  removeNotes: [{ r: 4, c: 4, type: "note", notes: [8] }],
  highlightCells: [
    { location: TARGET, highlightType: "focus" },
    { location: { r: 1, c: 4 }, highlightType: "focus" },
    { location: { r: 2, c: 4 }, highlightType: "focus" },
    { location: { r: 3, c: 4 }, highlightType: "focus" },
    { location: { r: 5, c: 4 }, highlightType: "focus" },
    { location: { r: 6, c: 4 }, highlightType: "focus" },
    { location: { r: 7, c: 4 }, highlightType: "focus" },
    { location: { r: 8, c: 4 }, highlightType: "focus" },
    { location: { r: 0, c: 4 }, highlightType: "basis" },
  ],
  highlightNotes: [
    { location: TARGET, value: 8, highlightType: "removal" },
  ],
  text: "Remove note 8 because that number is already in column 5.",
};

const BOX_REMOVAL_STAGE: HintStage = {
  removeNotes: [{ r: 4, c: 4, type: "note", notes: [5] }],
  highlightCells: [
    { location: TARGET, highlightType: "focus" },
    { location: { r: 3, c: 3 }, highlightType: "focus" },
    { location: { r: 3, c: 4 }, highlightType: "focus" },
    { location: { r: 3, c: 5 }, highlightType: "focus" },
    { location: { r: 4, c: 3 }, highlightType: "focus" },
    { location: { r: 4, c: 5 }, highlightType: "focus" },
    { location: { r: 5, c: 4 }, highlightType: "focus" },
    { location: { r: 5, c: 5 }, highlightType: "focus" },
    { location: { r: 5, c: 3 }, highlightType: "basis" },
  ],
  highlightNotes: [
    { location: TARGET, value: 5, highlightType: "removal" },
  ],
  text: "Remove note 5 because that number is already in the same box.",
};

const PLACEMENT_ONLY_HINT: Hint = {
  strategy: "AMEND_NOTES",
  stages: [INTRODUCTION_STAGE, EMPTY_TARGET_PLACEMENT_STAGE],
};

const ROW_REMOVAL_HINT: Hint = {
  strategy: "AMEND_NOTES",
  stages: [INTRODUCTION_STAGE, EMPTY_TARGET_PLACEMENT_STAGE, ROW_REMOVAL_STAGE],
};

const COLUMN_REMOVAL_HINT: Hint = {
  strategy: "AMEND_NOTES",
  stages: [
    INTRODUCTION_STAGE,
    EMPTY_TARGET_PLACEMENT_STAGE,
    COLUMN_REMOVAL_STAGE,
  ],
};

const BOX_REMOVAL_HINT: Hint = {
  strategy: "AMEND_NOTES",
  stages: [INTRODUCTION_STAGE, EMPTY_TARGET_PLACEMENT_STAGE, BOX_REMOVAL_STAGE],
};

const PRECEDENCE_HINT: Hint = {
  strategy: "AMEND_NOTES",
  stages: [
    INTRODUCTION_STAGE,
    {
      placeNotes: [{ r: 4, c: 4, type: "note", notes: ALL_NOTES }],
      highlightCells: [
        { location: TARGET_WITH_EXISTING_NOTE, highlightType: "focus" },
      ],
      highlightNotes: [
        { location: TARGET_WITH_EXISTING_NOTE, value: 1, highlightType: "placement" },
        { location: TARGET_WITH_EXISTING_NOTE, value: 2, highlightType: "placement" },
        { location: TARGET_WITH_EXISTING_NOTE, value: 3, highlightType: "placement" },
        { location: TARGET_WITH_EXISTING_NOTE, value: 4, highlightType: "placement" },
        { location: TARGET_WITH_EXISTING_NOTE, value: 5, highlightType: "placement" },
        { location: TARGET_WITH_EXISTING_NOTE, value: 6, highlightType: "placement" },
        { location: TARGET_WITH_EXISTING_NOTE, value: 7, highlightType: "placement" },
        { location: TARGET_WITH_EXISTING_NOTE, value: 8, highlightType: "placement" },
        { location: TARGET_WITH_EXISTING_NOTE, value: 9, highlightType: "placement" },
      ],
      text: "Add all notes not already present to the cell in row 5, column 5.",
    },
    {
      removeNotes: [{ r: 4, c: 4, type: "note", notes: [1, 6, 7] }],
      highlightCells: [
        { location: TARGET_WITH_EXISTING_NOTE, highlightType: "focus" },
        { location: { r: 4, c: 2 }, highlightType: "focus" },
        { location: { r: 4, c: 3 }, highlightType: "focus" },
        { location: { r: 4, c: 5 }, highlightType: "focus" },
        { location: { r: 4, c: 7 }, highlightType: "focus" },
        { location: { r: 4, c: 8 }, highlightType: "focus" },
        { location: { r: 4, c: 6 }, highlightType: "basis" },
        { location: { r: 4, c: 1 }, highlightType: "basis" },
        { location: { r: 4, c: 0 }, highlightType: "basis" },
      ],
      highlightNotes: [
        { location: TARGET_WITH_EXISTING_NOTE, value: 1, highlightType: "removal" },
        { location: TARGET_WITH_EXISTING_NOTE, value: 6, highlightType: "removal" },
        { location: TARGET_WITH_EXISTING_NOTE, value: 7, highlightType: "removal" },
      ],
      text: "Remove notes 1, 6, and 7 because those numbers are already in row 5.",
    },
    {
      removeNotes: [{ r: 4, c: 4, type: "note", notes: [2, 4, 8] }],
      highlightCells: [
        { location: TARGET_WITH_EXISTING_NOTE, highlightType: "focus" },
        { location: { r: 1, c: 4 }, highlightType: "focus" },
        { location: { r: 3, c: 4 }, highlightType: "focus" },
        { location: { r: 5, c: 4 }, highlightType: "focus" },
        { location: { r: 6, c: 4 }, highlightType: "focus" },
        { location: { r: 8, c: 4 }, highlightType: "focus" },
        { location: { r: 2, c: 4 }, highlightType: "basis" },
        { location: { r: 7, c: 4 }, highlightType: "basis" },
        { location: { r: 0, c: 4 }, highlightType: "basis" },
      ],
      highlightNotes: [
        { location: TARGET_WITH_EXISTING_NOTE, value: 2, highlightType: "removal" },
        { location: TARGET_WITH_EXISTING_NOTE, value: 4, highlightType: "removal" },
        { location: TARGET_WITH_EXISTING_NOTE, value: 8, highlightType: "removal" },
      ],
      text: "Remove notes 2, 4, and 8 because those numbers are already in column 5.",
    },
    {
      removeNotes: [{ r: 4, c: 4, type: "note", notes: [5] }],
      highlightCells: [
        { location: TARGET_WITH_EXISTING_NOTE, highlightType: "focus" },
        { location: { r: 3, c: 3 }, highlightType: "focus" },
        { location: { r: 3, c: 4 }, highlightType: "focus" },
        { location: { r: 3, c: 5 }, highlightType: "focus" },
        { location: { r: 4, c: 3 }, highlightType: "focus" },
        { location: { r: 4, c: 5 }, highlightType: "focus" },
        { location: { r: 5, c: 4 }, highlightType: "focus" },
        { location: { r: 5, c: 5 }, highlightType: "focus" },
        { location: { r: 5, c: 3 }, highlightType: "basis" },
      ],
      highlightNotes: [
        { location: TARGET_WITH_EXISTING_NOTE, value: 5, highlightType: "removal" },
      ],
      text: "Remove note 5 because that number is already in the same box.",
    },
  ],
};

const ALL_NOTES_ROW_REMOVAL_HINT: Hint = {
  strategy: "AMEND_NOTES",
  stages: [
    INTRODUCTION_STAGE,
    {
      placeNotes: [{ r: 4, c: 4, type: "note", notes: ALL_NOTES }],
      highlightCells: [
        { location: TARGET_WITH_ALL_NOTES, highlightType: "focus" },
      ],
      highlightNotes: [
        { location: TARGET_WITH_ALL_NOTES, value: 1, highlightType: "placement" },
        { location: TARGET_WITH_ALL_NOTES, value: 2, highlightType: "placement" },
        { location: TARGET_WITH_ALL_NOTES, value: 3, highlightType: "placement" },
        { location: TARGET_WITH_ALL_NOTES, value: 4, highlightType: "placement" },
        { location: TARGET_WITH_ALL_NOTES, value: 5, highlightType: "placement" },
        { location: TARGET_WITH_ALL_NOTES, value: 6, highlightType: "placement" },
        { location: TARGET_WITH_ALL_NOTES, value: 7, highlightType: "placement" },
        { location: TARGET_WITH_ALL_NOTES, value: 8, highlightType: "placement" },
        { location: TARGET_WITH_ALL_NOTES, value: 9, highlightType: "placement" },
      ],
      text: "Add all notes not already present to the cell in row 5, column 5.",
    },
    {
      removeNotes: [{ r: 4, c: 4, type: "note", notes: [7] }],
      highlightCells: [
        { location: TARGET_WITH_ALL_NOTES, highlightType: "focus" },
        { location: { r: 4, c: 1 }, highlightType: "focus" },
        { location: { r: 4, c: 2 }, highlightType: "focus" },
        { location: { r: 4, c: 3 }, highlightType: "focus" },
        { location: { r: 4, c: 5 }, highlightType: "focus" },
        { location: { r: 4, c: 6 }, highlightType: "focus" },
        { location: { r: 4, c: 7 }, highlightType: "focus" },
        { location: { r: 4, c: 8 }, highlightType: "focus" },
        { location: { r: 4, c: 0 }, highlightType: "basis" },
      ],
      highlightNotes: [
        { location: TARGET_WITH_ALL_NOTES, value: 7, highlightType: "removal" },
      ],
      text: "Remove note 7 because that number is already in row 5.",
    },
  ],
};

describe("getAmendNotesHint", () => {
  it.each<{
    label: string;
    basisCell: ValueCellWithLocation;
    expectedHint: Hint;
  }>([
    {
      label: "row with a given",
      basisCell: { r: 4, c: 0, type: "given", value: 7 },
      expectedHint: ROW_REMOVAL_HINT,
    },
    {
      label: "column with a user-entered value",
      basisCell: { r: 0, c: 4, type: "value", value: 8 },
      expectedHint: COLUMN_REMOVAL_HINT,
    },
    {
      label: "box with a given",
      basisCell: { r: 5, c: 3, type: "given", value: 5 },
      expectedHint: BOX_REMOVAL_HINT,
    },
  ])(
    "returns the exact isolated $label removal stage",
    ({ basisCell, expectedHint }) => {
      // One placed value isolates the requested unit stage.
      const puzzle = withNotes(
        withValues(createEmptyPuzzle(BOARD_SIZE), [basisCell]),
        [TARGET]
      );

      expectHintWithoutMutation(
        getAmendNotesHint,
        puzzle,
        SOLUTION,
        TARGET,
        expectedHint
      );
    }
  );

  it("uses row, column, then box precedence with deterministic note and location ordering", () => {
    const basisCells: ValueCellWithLocation[] = [
      { r: 4, c: 6, type: "given", value: 1 },
      { r: 4, c: 1, type: "given", value: 6 },
      { r: 4, c: 0, type: "given", value: 7 },
      { r: 2, c: 4, type: "given", value: 2 },
      { r: 7, c: 4, type: "given", value: 4 },
      { r: 0, c: 4, type: "given", value: 8 },
      { r: 5, c: 3, type: "given", value: 5 },
    ];
    const puzzle = withNotes(
      withValues(createEmptyPuzzle(BOARD_SIZE), basisCells),
      [TARGET_WITH_EXISTING_NOTE]
    );

    expectHintWithoutMutation(
      getAmendNotesHint,
      puzzle,
      SOLUTION,
      TARGET_WITH_EXISTING_NOTE,
      PRECEDENCE_HINT
    );
  });

  it("omits later unit stages when their conflicts were already removed", () => {
    const rowBasis: ValueCellWithLocation = {
      r: 4,
      c: 0,
      type: "given",
      value: 7,
    };
    const duplicateColumnBasis: ValueCellWithLocation = {
      r: 8,
      c: 4,
      type: "given",
      value: 7,
    };
    const duplicateBoxBasis: ValueCellWithLocation = {
      r: 3,
      c: 3,
      type: "given",
      value: 7,
    };

    // These three 7s occupy different rows, columns, and boxes and all match
    // the solution. Row precedence removes 7 once, leaving no later work.
    const puzzle = withNotes(
      withValues(createEmptyPuzzle(BOARD_SIZE), [
        duplicateBoxBasis,
        duplicateColumnBasis,
        rowBasis,
      ]),
      [TARGET]
    );

    expectHintWithoutMutation(
      getAmendNotesHint,
      puzzle,
      SOLUTION,
      TARGET,
      ROW_REMOVAL_HINT
    );
  });

  it("returns a placement-only hint when no placed values conflict", () => {
    const puzzle = withNotes(createEmptyPuzzle(BOARD_SIZE), [TARGET]);

    expectHintWithoutMutation(
      getAmendNotesHint,
      puzzle,
      SOLUTION,
      TARGET,
      PLACEMENT_ONLY_HINT
    );
  });

  it("ignores notes in neighboring cells when finding basis values", () => {
    const neighboringNoteCell: NoteCellWithLocation = {
      r: 4,
      c: 0,
      type: "note",
      notes: [7],
    };
    const puzzle = withNotes(createEmptyPuzzle(BOARD_SIZE), [
      TARGET,
      neighboringNoteCell,
    ]);

    expectHintWithoutMutation(
      getAmendNotesHint,
      puzzle,
      SOLUTION,
      TARGET,
      PLACEMENT_ONLY_HINT
    );
  });

  it("still emits the all-notes stage when every note is already present but conflicts remain", () => {
    const basisCell: ValueCellWithLocation = {
      r: 4,
      c: 0,
      type: "given",
      value: 7,
    };
    const puzzle = withNotes(
      withValues(createEmptyPuzzle(BOARD_SIZE), [basisCell]),
      [TARGET_WITH_ALL_NOTES]
    );

    expectHintWithoutMutation(
      getAmendNotesHint,
      puzzle,
      SOLUTION,
      TARGET_WITH_ALL_NOTES,
      ALL_NOTES_ROW_REMOVAL_HINT
    );
  });

  it.each([
    { label: "given", type: "given" as const },
    { label: "user-entered value", type: "value" as const },
  ])("returns null when the targeted cell is a $label", ({ type }) => {
    const valueCell: ValueCellWithLocation = {
      r: TARGET.r,
      c: TARGET.c,
      type,
      value: 3,
    };
    const puzzle = withValues(createEmptyPuzzle(BOARD_SIZE), [valueCell]);

    expectHintWithoutMutation(
      getAmendNotesHint,
      puzzle,
      SOLUTION,
      valueCell,
      null
    );
  });

  it.each([
    { label: "ascending order", notes: [3, 9] },
    { label: "different order", notes: [9, 3] },
  ])(
    "returns null when the target already has the complete candidate set in $label",
    ({ notes }) => {
      const correctTarget: NoteCellWithLocation = {
        ...TARGET,
        notes,
      };
      const basisCells: ValueCellWithLocation[] = [
        { r: 4, c: 6, type: "given", value: 1 },
        { r: 2, c: 4, type: "given", value: 2 },
        { r: 7, c: 4, type: "given", value: 4 },
        { r: 5, c: 3, type: "given", value: 5 },
        { r: 4, c: 1, type: "given", value: 6 },
        { r: 4, c: 0, type: "given", value: 7 },
        { r: 0, c: 4, type: "given", value: 8 },
      ];

      // The placed values exclude exactly 3 and 9, making those the complete
      // candidate set regardless of their order in the target notes array.
      const puzzle = withNotes(
        withValues(createEmptyPuzzle(BOARD_SIZE), basisCells),
        [correctTarget]
      );

      expectHintWithoutMutation(
        getAmendNotesHint,
        puzzle,
        SOLUTION,
        correctTarget,
        null
      );
    }
  );

  it("checks only the targeted note cell when other note cells need amendment", () => {
    const correctTarget: NoteCellWithLocation = {
      ...TARGET,
      notes: [...ALL_NOTES],
    };
    const otherIncompleteCell: NoteCellWithLocation = {
      r: 0,
      c: 0,
      type: "note",
      notes: [],
    };

    // On an otherwise empty puzzle, every other cell also needs all notes.
    // A null result therefore proves the strategy evaluates only the target.
    const puzzle = withNotes(createEmptyPuzzle(BOARD_SIZE), [
      correctTarget,
      otherIncompleteCell,
    ]);

    expectHintWithoutMutation(
      getAmendNotesHint,
      puzzle,
      SOLUTION,
      correctTarget,
      null
    );
  });
});
