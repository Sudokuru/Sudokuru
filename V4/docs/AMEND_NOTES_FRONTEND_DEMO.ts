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

const basicAllNotesCell: NoteCellWithLocation = {
  r: 1,
  c: 2,
  type: "note",
  notes: [1, 2, 3, 4, 5, 6, 7, 8, 9],
};

const basicRowRemovalNotes: NoteCellWithLocation = {
  r: 1,
  c: 2,
  type: "note",
  notes: [1, 2, 5, 6],
};

const basicColumnRemovalNotes: NoteCellWithLocation = {
  r: 1,
  c: 2,
  type: "note",
  notes: [3, 7, 9],
};

const basicRowBasisCells: CellLocation[] = [
  { r: 1, c: 3 },
  { r: 1, c: 0 },
  { r: 1, c: 4 },
  { r: 1, c: 8 },
];

const basicColumnBasisCells: CellLocation[] = [
  { r: 3, c: 2 },
  { r: 7, c: 2 },
  { r: 5, c: 2 },
];

const correctiveTargetCell: NoteCellWithLocation = {
  r: 1,
  c: 6,
  type: "note",
  notes: [4, 7, 8],
};

const correctiveAllNotesCell: NoteCellWithLocation = {
  r: 1,
  c: 6,
  type: "note",
  notes: [1, 2, 3, 4, 5, 6, 7, 8, 9],
};

const correctiveRowRemovalNotes: NoteCellWithLocation = {
  r: 1,
  c: 6,
  type: "note",
  notes: [1, 2, 5, 6],
};

const correctiveColumnRemovalNotes: NoteCellWithLocation = {
  r: 1,
  c: 6,
  type: "note",
  notes: [9],
};

const correctiveRowBasisCells: CellLocation[] = [
  { r: 1, c: 3 },
  { r: 1, c: 0 },
  { r: 1, c: 4 },
  { r: 1, c: 8 },
];

const correctiveColumnBasisCells: CellLocation[] = [
  { r: 7, c: 6 },
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
      text:
        "Amend notes makes a cell contain every note that does not conflict with its row, column, or box.",
    },
    {
      placeNotes: [basicAllNotesCell],
      highlightCells: [
        { location: basicTargetCell, highlightType: "focus" },
      ],
      highlightNotes: basicAllNotesCell.notes.map((value) => ({
        location: basicTargetCell,
        value,
        highlightType: "placement" as const,
      })),
      text: "Add notes 1 through 9 to row 2, column 3.",
    },
    {
      removeNotes: [basicRowRemovalNotes],
      highlightCells: [
        { location: basicTargetCell, highlightType: "focus" },
        ...basicRowBasisCells.map((location) => ({
          location,
          highlightType: "basis" as const,
        })),
      ],
      highlightNotes: basicRowRemovalNotes.notes.map((value) => ({
        location: basicTargetCell,
        value,
        highlightType: "removal" as const,
      })),
      text:
        "Remove notes 1, 2, 5, and 6 because those numbers are already in row 2.",
    },
    {
      removeNotes: [basicColumnRemovalNotes],
      highlightCells: [
        { location: basicTargetCell, highlightType: "focus" },
        ...basicColumnBasisCells.map((location) => ({
          location,
          highlightType: "basis" as const,
        })),
      ],
      highlightNotes: basicColumnRemovalNotes.notes.map((value) => ({
        location: basicTargetCell,
        value,
        highlightType: "removal" as const,
      })),
      text:
        "Remove notes 3, 7, and 9 because those numbers are already in column 3.",
    },
  ],
};

export const correctiveAmendNotesHint: AmendNotesHint = {
  strategy: "AMEND_NOTES",
  stages: [
    {
      text:
        "Amend notes makes a cell contain every note that does not conflict with its row, column, or box.",
    },
    {
      placeNotes: [correctiveAllNotesCell],
      highlightCells: [
        { location: correctiveTargetCell, highlightType: "focus" },
      ],
      highlightNotes: correctiveAllNotesCell.notes.map((value) => ({
        location: correctiveTargetCell,
        value,
        highlightType: "placement" as const,
      })),
      text: "Add notes 1 through 9 to row 2, column 7.",
    },
    {
      removeNotes: [correctiveRowRemovalNotes],
      highlightCells: [
        { location: correctiveTargetCell, highlightType: "focus" },
        ...correctiveRowBasisCells.map((location) => ({
          location,
          highlightType: "basis" as const,
        })),
      ],
      highlightNotes: correctiveRowRemovalNotes.notes.map((value) => ({
        location: correctiveTargetCell,
        value,
        highlightType: "removal" as const,
      })),
      text:
        "Remove notes 1, 2, 5, and 6 because those numbers are already in row 2.",
    },
    {
      removeNotes: [correctiveColumnRemovalNotes],
      highlightCells: [
        { location: correctiveTargetCell, highlightType: "focus" },
        ...correctiveColumnBasisCells.map((location) => ({
          location,
          highlightType: "basis" as const,
        })),
      ],
      highlightNotes: correctiveColumnRemovalNotes.notes.map((value) => ({
        location: correctiveTargetCell,
        value,
        highlightType: "removal" as const,
      })),
      text: "Remove note 9 because that number is already in column 7.",
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
