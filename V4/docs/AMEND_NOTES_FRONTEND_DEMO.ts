/**
 * Self-contained amend-notes hint demo fixture for quick Frontend testing.
 *
 * This file intentionally imports nothing. Copy/paste it into a Frontend repo,
 * stub getHint() to return one of the exported hints, and load the matching
 * puzzle state below.
 */

type SudokuValue = number;

type CellLocation = {
  r: number;
  c: number;
};

type CellWithValue = {
  type: "given" | "value";
  value: SudokuValue;
};

type CellWithNotes = {
  type: "note";
  notes: SudokuValue[];
};

type CellProps = CellWithValue | CellWithNotes;
type ValueCellWithLocation = CellWithValue & CellLocation;
type NoteCellWithLocation = CellWithNotes & CellLocation;

type HighlightType = "removal" | "placement" | "focus" | "basis";

type HighlightedCell = {
  location: CellLocation;
  highlightType: HighlightType;
};

type HighlightedValue = {
  location: CellLocation;
  highlightType: HighlightType;
};

type HighlightedNote = {
  location: CellLocation;
  value: SudokuValue;
  highlightType: HighlightType;
};

type HintStage = {
  removeValues?: ValueCellWithLocation[];
  removeNotes?: NoteCellWithLocation[];
  placeValues?: ValueCellWithLocation[];
  placeNotes?: NoteCellWithLocation[];
  highlightCells?: HighlightedCell[];
  highlightValues?: HighlightedValue[];
  highlightNotes?: HighlightedNote[];
  text?: string;
};

type AmendNotesHint = {
  strategy: "AMEND_NOTES";
  stages: HintStage[];
};

type AmendNotesDemoCase = {
  id: "basic-amend-notes" | "corrective-amend-notes";
  label: string;
  puzzle: CellProps[][];
  hint: AmendNotesHint;
};

const BASE_PUZZLE_NUMBERS: SudokuValue[][] = [
  [3, 1, 0, 0, 8, 4, 0, 0, 2],
  [2, 0, 0, 1, 5, 0, 0, 0, 6],
  [5, 7, 0, 0, 0, 3, 0, 1, 0],
  [4, 2, 3, 7, 0, 8, 0, 9, 5],
  [7, 6, 0, 0, 3, 0, 0, 0, 0],
  [0, 0, 9, 5, 6, 2, 0, 3, 0],
  [0, 5, 0, 0, 0, 6, 0, 7, 0],
  [0, 0, 7, 0, 0, 0, 9, 0, 0],
  [0, 0, 0, 0, 0, 1, 5, 0, 0],
];

const basicTargetCell: NoteCellWithLocation = {
  r: 1,
  c: 2,
  type: "note",
  notes: [],
};

const basicClearedCell: NoteCellWithLocation = {
  r: 1,
  c: 2,
  type: "note",
  notes: [],
};

const basicAmendedCell: NoteCellWithLocation = {
  r: 1,
  c: 2,
  type: "note",
  notes: [4, 8],
};

const basicBasisCells: CellLocation[] = [
  { r: 1, c: 0 },
  { r: 1, c: 3 },
  { r: 1, c: 4 },
  { r: 1, c: 8 },
  { r: 3, c: 2 },
  { r: 5, c: 2 },
  { r: 7, c: 2 },
  { r: 0, c: 0 },
  { r: 0, c: 1 },
  { r: 2, c: 0 },
  { r: 2, c: 1 },
];

const correctiveTargetCell: NoteCellWithLocation = {
  r: 1,
  c: 6,
  type: "note",
  notes: [4, 7, 8],
};

const correctiveClearedCell: NoteCellWithLocation = {
  r: 1,
  c: 6,
  type: "note",
  notes: [4, 7, 8],
};

const correctiveAmendedCell: NoteCellWithLocation = {
  r: 1,
  c: 6,
  type: "note",
  notes: [3, 4, 7, 8],
};

const correctiveBasisCells: CellLocation[] = [
  { r: 1, c: 0 },
  { r: 1, c: 3 },
  { r: 1, c: 4 },
  { r: 1, c: 8 },
  { r: 7, c: 6 },
  { r: 8, c: 6 },
  { r: 0, c: 8 },
  { r: 2, c: 7 },
];

function numbersToPuzzle(numbers: SudokuValue[][]): CellProps[][] {
  return numbers.map((row) =>
    row.map((value): CellProps => {
      if (value === 0) {
        return { type: "note", notes: [] };
      }

      return { type: "given", value };
    })
  );
}

function withNoteCell(
  numbers: SudokuValue[][],
  noteCell: NoteCellWithLocation
): CellProps[][] {
  return numbers.map((row, r) =>
    row.map((value, c): CellProps => {
      if (r === noteCell.r && c === noteCell.c) {
        return {
          type: "note",
          notes: noteCell.notes,
        };
      }

      if (value === 0) {
        return { type: "note", notes: [] };
      }

      return { type: "given", value };
    })
  );
}

export const amendNotesBasePuzzle: CellProps[][] =
  numbersToPuzzle(BASE_PUZZLE_NUMBERS);

export const basicAmendNotesPuzzle: CellProps[][] = withNoteCell(
  BASE_PUZZLE_NUMBERS,
  basicTargetCell
);

export const correctiveAmendNotesPuzzle: CellProps[][] = withNoteCell(
  BASE_PUZZLE_NUMBERS,
  correctiveTargetCell
);

export const basicAmendNotesHint: AmendNotesHint = {
  strategy: "AMEND_NOTES",
  stages: [
    {
      highlightCells: [
        { location: basicTargetCell, highlightType: "focus" },
        ...basicBasisCells.map((location) => ({
          location,
          highlightType: "basis" as const,
        })),
      ],
      text:
        "Row 2, column 3 should contain every note that does not conflict with its row, column, or box.",
    },
    {
      removeNotes: [basicClearedCell],
      highlightCells: [
        { location: basicTargetCell, highlightType: "focus" },
      ],
      text: "Clear the notes from row 2, column 3.",
    },
    {
      placeNotes: [basicAmendedCell],
      highlightCells: [
        { location: basicTargetCell, highlightType: "focus" },
      ],
      highlightNotes: [
        { location: basicTargetCell, value: 4, highlightType: "placement" },
        { location: basicTargetCell, value: 8, highlightType: "placement" },
      ],
      text: "Set row 2, column 3 to notes 4 and 8.",
    },
  ],
};

export const correctiveAmendNotesHint: AmendNotesHint = {
  strategy: "AMEND_NOTES",
  stages: [
    {
      highlightCells: [
        { location: correctiveTargetCell, highlightType: "focus" },
        ...correctiveBasisCells.map((location) => ({
          location,
          highlightType: "basis" as const,
        })),
      ],
      text:
        "Row 2, column 7 should contain every note that does not conflict with its row, column, or box.",
    },
    {
      removeNotes: [correctiveClearedCell],
      highlightCells: [
        { location: correctiveTargetCell, highlightType: "focus" },
      ],
      highlightNotes: [
        { location: correctiveTargetCell, value: 4, highlightType: "removal" },
        { location: correctiveTargetCell, value: 7, highlightType: "removal" },
        { location: correctiveTargetCell, value: 8, highlightType: "removal" },
      ],
      text: "Clear the notes from row 2, column 7.",
    },
    {
      placeNotes: [correctiveAmendedCell],
      highlightCells: [
        { location: correctiveTargetCell, highlightType: "focus" },
      ],
      highlightNotes: [
        { location: correctiveTargetCell, value: 3, highlightType: "placement" },
        { location: correctiveTargetCell, value: 4, highlightType: "placement" },
        { location: correctiveTargetCell, value: 7, highlightType: "placement" },
        { location: correctiveTargetCell, value: 8, highlightType: "placement" },
      ],
      text: "Set row 2, column 7 to notes 3, 4, 7, and 8.",
    },
  ],
};

export const amendNotesDemoCases: AmendNotesDemoCase[] = [
  {
    id: "basic-amend-notes",
    label: "Basic amend notes",
    puzzle: basicAmendNotesPuzzle,
    hint: basicAmendNotesHint,
  },
  {
    id: "corrective-amend-notes",
    label: "Amend notes with existing notes",
    puzzle: correctiveAmendNotesPuzzle,
    hint: correctiveAmendNotesHint,
  },
];

export function getAmendNotesDemoCase(
  id: AmendNotesDemoCase["id"]
): AmendNotesDemoCase {
  const demoCase = amendNotesDemoCases.find((candidate) => candidate.id === id);

  if (!demoCase) {
    throw new Error(`Unknown amend notes demo case: ${id}`);
  }

  return demoCase;
}
