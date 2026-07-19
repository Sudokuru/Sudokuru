import type {
  CellLocation,
  Hint,
  HintStage,
  NoteCellWithLocation,
  SudokuValue,
  Unit,
  ValueCellWithLocation,
} from "../../Types";
import { locationsEqual } from "../../cellLocations";
import { getAmendNotesHint } from "../../amendNotes";
import { formatNumbers } from "../../format";
import { getUnitLocations } from "../../units";
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

/**
 * Describes one expected removal stage. Stage order comes from the containing
 * array, while basis-cell order defines both removed-note and basis-highlight order.
 */
interface RemovalExpectation {
  /** The constraint unit responsible for this stage's removals. */
  unit: Unit;

  /**
   * Cells responsible for notes newly removed in this stage, ordered by value.
   * Values already removed by an earlier unit must not appear again.
   */
  basisCells: ValueCellWithLocation[];
}

/**
 * Returns the user-facing row, column, or box description for a removal stage.
 */
function unitDescription(target: CellLocation, unit: Unit): string {
  switch (unit) {
    case "row":
      return `row ${target.r + 1}`;
    case "column":
      return `column ${target.c + 1}`;
    case "box":
      return "the same box";
  }
}

/**
 * Builds one exact removal stage from its explicitly ordered basis cells.
 */
function expectedRemovalStage(
  target: NoteCellWithLocation,
  expectation: RemovalExpectation
): HintStage {
  const { basisCells, unit } = expectation;
  const removedNotes = basisCells.map(({ value }) => value);
  const basisLocations = basisCells.map(({ r, c }) => ({ r, c }));
  const excludedFocusLocations = [target, ...basisLocations];
  const focusLocations = getUnitLocations(target, unit, BOARD_SIZE).filter(
    (location) =>
      !excludedFocusLocations.some((excludedLocation) =>
        locationsEqual(location, excludedLocation)
      )
  );
  const isSingular = removedNotes.length === 1;
  const noteLabel = isSingular ? "note" : "notes";
  const conflictExplanation = isSingular
    ? "that number is"
    : "those numbers are";
  const formattedNotes = formatNumbers(removedNotes);
  const unitLabel = unitDescription(target, unit);
  const focusHighlights = focusLocations.map((location) => ({
    location,
    highlightType: "focus" as const,
  }));
  const basisHighlights = basisLocations.map((location) => ({
    location,
    highlightType: "basis" as const,
  }));
  const removalHighlights = removedNotes.map((value) => ({
    location: target,
    value,
    highlightType: "removal" as const,
  }));
  const text = `Remove ${noteLabel} ${formattedNotes} because ${conflictExplanation} already in ${unitLabel}.`;

  return {
    removeNotes: [{ ...target, notes: removedNotes }],
    highlightCells: [
      { location: target, highlightType: "focus" },
      ...focusHighlights,
      ...basisHighlights,
    ],
    highlightNotes: removalHighlights,
    text,
  };
}

/**
 * Builds a complete exact hint while preserving the supplied removal-stage order.
 */
function expectedAmendNotesHint(
  target: NoteCellWithLocation,
  removalExpectations: RemovalExpectation[] = []
): Hint {
  const allNotesCell: NoteCellWithLocation = {
    ...target,
    notes: [...ALL_NOTES],
  };
  const placementHighlights = ALL_NOTES.map((value) => ({
    location: target,
    value,
    highlightType: "placement" as const,
  }));
  const removalStages = removalExpectations.map((expectation) =>
    expectedRemovalStage(target, expectation)
  );
  const row = target.r + 1;
  const column = target.c + 1;

  return {
    strategy: "AMEND_NOTES",
    stages: [
      {
        text:
          "Amend notes makes a cell contain every note that does not conflict with its row, column, or box.",
      },
      {
        placeNotes: [allNotesCell],
        highlightCells: [{ location: target, highlightType: "focus" }],
        highlightNotes: placementHighlights,
        text: `Add all notes not already present to the cell in row ${row}, column ${column}.`,
      },
      ...removalStages,
    ],
  };
}

describe("getAmendNotesHint", () => {
  // A center cell makes each row, column, and box fixture straightforward to audit.
  const target: NoteCellWithLocation = {
    r: 4,
    c: 4,
    type: "note",
    notes: [],
  };

  it.each<{
    label: string;
    unit: Unit;
    basisCell: ValueCellWithLocation;
  }>([
    {
      label: "row with a given",
      unit: "row",
      basisCell: { r: 4, c: 0, type: "given", value: 7 },
    },
    {
      label: "column with a user-entered value",
      unit: "column",
      basisCell: { r: 0, c: 4, type: "value", value: 8 },
    },
    {
      label: "box with a given",
      unit: "box",
      basisCell: { r: 5, c: 3, type: "given", value: 5 },
    },
  ])("returns the exact isolated $label removal stage", ({ unit, basisCell }) => {
    // Each case has exactly one placed value, isolating the requested unit stage.
    const puzzle = withNotes(
      withValues(createEmptyPuzzle(BOARD_SIZE), [basisCell]),
      [target]
    );
    const expectedHint = expectedAmendNotesHint(target, [
      { unit, basisCells: [basisCell] },
    ]);

    expectHintWithoutMutation(
      getAmendNotesHint,
      puzzle,
      SOLUTION,
      target,
      expectedHint
    );
  });

  it("uses row, column, then box precedence with deterministic note and location ordering", () => {
    const targetWithExistingNote: NoteCellWithLocation = {
      ...target,
      notes: [3],
    };

    // Basis arrays are ordered by value because the hint must remove and
    // highlight notes in ascending order, independent of cell traversal order.
    const rowBasisByValue: ValueCellWithLocation[] = [
      { r: 4, c: 6, type: "given", value: 1 },
      { r: 4, c: 1, type: "given", value: 6 },
      { r: 4, c: 0, type: "given", value: 7 },
    ];
    const columnBasisByValue: ValueCellWithLocation[] = [
      { r: 2, c: 4, type: "given", value: 2 },
      { r: 7, c: 4, type: "given", value: 4 },
      { r: 0, c: 4, type: "given", value: 8 },
    ];
    const boxBasisByValue: ValueCellWithLocation[] = [
      { r: 5, c: 3, type: "given", value: 5 },
    ];
    const puzzle = withNotes(
      withValues(createEmptyPuzzle(BOARD_SIZE), [
        ...rowBasisByValue,
        ...columnBasisByValue,
        ...boxBasisByValue,
      ]),
      [targetWithExistingNote]
    );
    const expectedHint = expectedAmendNotesHint(targetWithExistingNote, [
      { unit: "row", basisCells: rowBasisByValue },
      { unit: "column", basisCells: columnBasisByValue },
      { unit: "box", basisCells: boxBasisByValue },
    ]);

    expectHintWithoutMutation(
      getAmendNotesHint,
      puzzle,
      SOLUTION,
      targetWithExistingNote,
      expectedHint
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
      [target]
    );
    const expectedHint = expectedAmendNotesHint(target, [
      { unit: "row", basisCells: [rowBasis] },
    ]);

    expectHintWithoutMutation(
      getAmendNotesHint,
      puzzle,
      SOLUTION,
      target,
      expectedHint
    );
  });

  it("returns a placement-only hint when no placed values conflict", () => {
    const puzzle = withNotes(createEmptyPuzzle(BOARD_SIZE), [target]);

    expectHintWithoutMutation(
      getAmendNotesHint,
      puzzle,
      SOLUTION,
      target,
      expectedAmendNotesHint(target)
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
      target,
      neighboringNoteCell,
    ]);

    expectHintWithoutMutation(
      getAmendNotesHint,
      puzzle,
      SOLUTION,
      target,
      expectedAmendNotesHint(target)
    );
  });

  it("still emits the all-notes stage when every note is already present but conflicts remain", () => {
    const targetWithAllNotes: NoteCellWithLocation = {
      ...target,
      notes: [...ALL_NOTES],
    };
    const basisCell: ValueCellWithLocation = {
      r: 4,
      c: 0,
      type: "given",
      value: 7,
    };
    const puzzle = withNotes(
      withValues(createEmptyPuzzle(BOARD_SIZE), [basisCell]),
      [targetWithAllNotes]
    );
    const expectedHint = expectedAmendNotesHint(targetWithAllNotes, [
      { unit: "row", basisCells: [basisCell] },
    ]);

    expectHintWithoutMutation(
      getAmendNotesHint,
      puzzle,
      SOLUTION,
      targetWithAllNotes,
      expectedHint
    );
  });

  it.each([
    { label: "given", type: "given" as const },
    { label: "user-entered value", type: "value" as const },
  ])("returns null when the targeted cell is a $label", ({ type }) => {
    const valueCell: ValueCellWithLocation = {
      r: target.r,
      c: target.c,
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
        ...target,
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
      ...target,
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
