# Amend Notes Hint

This is the docs-first fixture for the V4 amend notes strategy. The strategy
adds all notes to the target cell, then removes the notes that conflict with
placed values in the same row, column, or box.

## Source Fixture

The examples use a standard 9x9 board from V4 test data:

- Source: `ADDITIONAL_TEST_BOARDS_BY_NAME.ONLY_OBVIOUS_SINGLES`

### Basic Amend Notes

- Target cell: `{ r: 1, c: 2 }`, which is row 2, column 3
- Starting notes: `[]`
- Amended notes: `[4, 8]`

### Filled-Cell Amend Notes

- Target cell: `{ r: 1, c: 6 }`, which is row 2, column 7
- Starting notes: `[4, 7, 8]`
- Amended notes: `[3, 4, 7, 8]`
- This example should be presented as ordinary amend-notes behavior; do not
  describe why the starting notes are incomplete or identify any solved value.

Cell locations use the V4 zero-indexed `{ r, c }` shape. User-facing text uses
one-indexed row and column labels.

## Frontend Demo

Frontend demo PR: TBD

Add the Frontend demo PR link here when available, along with a note about the
live dev-site comment once the demo is hosted.

## TypeScript Fixture

```ts
import type {
  CellLocation,
  Hint,
  HintStage,
  NoteCellWithLocation,
} from "../Types";

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

const filledTargetCell: NoteCellWithLocation = {
  r: 1,
  c: 6,
  type: "note",
  notes: [4, 7, 8],
};

const filledAllNotesCell: NoteCellWithLocation = {
  r: 1,
  c: 6,
  type: "note",
  notes: [1, 2, 3, 4, 5, 6, 7, 8, 9],
};

const filledRowRemovalNotes: NoteCellWithLocation = {
  r: 1,
  c: 6,
  type: "note",
  notes: [1, 2, 5, 6],
};

const filledColumnRemovalNotes: NoteCellWithLocation = {
  r: 1,
  c: 6,
  type: "note",
  notes: [9],
};

const filledRowBasisCells: CellLocation[] = [
  { r: 1, c: 3 },
  { r: 1, c: 0 },
  { r: 1, c: 4 },
  { r: 1, c: 8 },
];

const filledColumnBasisCells: CellLocation[] = [
  { r: 7, c: 6 },
];

const basicAmendNotesHintStages: HintStage[] = [
  {
    text: "Amend notes makes a cell contain every note that does not conflict with its row, column, or box.",
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
    text: "Add all notes not already present to the cell in row 2, column 3.",
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
    text: "Remove notes 1, 2, 5, and 6 because those numbers are already in row 2.",
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
    text: "Remove notes 3, 7, and 9 because those numbers are already in column 3.",
  },
];

const filledAmendNotesHintStages: HintStage[] = [
  {
    text: "Amend notes makes a cell contain every note that does not conflict with its row, column, or box.",
  },
  {
    placeNotes: [filledAllNotesCell],
    highlightCells: [
      { location: filledTargetCell, highlightType: "focus" },
    ],
    highlightNotes: filledAllNotesCell.notes.map((value) => ({
      location: filledTargetCell,
      value,
      highlightType: "placement" as const,
    })),
    text: "Add all notes not already present to the cell in row 2, column 7.",
  },
  {
    removeNotes: [filledRowRemovalNotes],
    highlightCells: [
      { location: filledTargetCell, highlightType: "focus" },
      ...filledRowBasisCells.map((location) => ({
        location,
        highlightType: "basis" as const,
      })),
    ],
    highlightNotes: filledRowRemovalNotes.notes.map((value) => ({
      location: filledTargetCell,
      value,
      highlightType: "removal" as const,
    })),
    text: "Remove notes 1, 2, 5, and 6 because those numbers are already in row 2.",
  },
  {
    removeNotes: [filledColumnRemovalNotes],
    highlightCells: [
      { location: filledTargetCell, highlightType: "focus" },
      ...filledColumnBasisCells.map((location) => ({
        location,
        highlightType: "basis" as const,
      })),
    ],
    highlightNotes: filledColumnRemovalNotes.notes.map((value) => ({
      location: filledTargetCell,
      value,
      highlightType: "removal" as const,
    })),
    text: "Remove note 9 because that number is already in column 7.",
  },
];

export const basicAmendNotesHint: Hint = {
  strategy: "AMEND_NOTES",
  stages: basicAmendNotesHintStages,
};

export const filledAmendNotesHint: Hint = {
  strategy: "AMEND_NOTES",
  stages: filledAmendNotesHintStages,
};
```

## Expected Application

Applying the basic amend-notes hint should make exactly this note-cell change:

```ts
const basicBefore: NoteCellWithLocation = {
  r: 1,
  c: 2,
  type: "note",
  notes: [],
};

const basicAfter: NoteCellWithLocation = {
  r: 1,
  c: 2,
  type: "note",
  notes: [4, 8],
};
```

Applying the filled-cell amend-notes hint should make exactly this note-cell
change:

```ts
const filledBefore: NoteCellWithLocation = {
  r: 1,
  c: 6,
  type: "note",
  notes: [4, 7, 8],
};

const filledAfter: NoteCellWithLocation = {
  r: 1,
  c: 6,
  type: "note",
  notes: [3, 4, 7, 8],
};
```

Amend notes adds all notes to the target note cell, then removes row, column,
and box conflicts. It does not place a value. Omit any row, column, or box
stage that would not remove notes.

## Frontend Screenshots

When the Frontend renders these static hints, save the screenshots under:

`V4/docs/screenshots/amend-notes/`

| Example | File | Expected capture |
| ------- | ---- | ---------------- |
| Basic amend notes, stage 1 | `basic_amend_notes_1.png` | No highlighting; text only says what amend notes is |
| Basic amend notes, stage 2 | `basic_amend_notes_2.png` | Target focused; target contains notes 1 through 9 with placement highlighting |
| Basic amend notes, stage 3 | `basic_amend_notes_3.png` | Target focused; row basis cells highlighted; notes 1, 2, 5, and 6 highlighted for removal |
| Basic amend notes, stage 4 | `basic_amend_notes_4.png` | Target focused; column basis cells highlighted; notes 3, 7, and 9 highlighted for removal |
| Filled-cell amend notes, stage 1 | `corrective_amend_notes_1.png` | No highlighting; text only says what amend notes is |
| Filled-cell amend notes, stage 2 | `corrective_amend_notes_2.png` | Target focused; target contains notes 1 through 9 with placement highlighting |
| Filled-cell amend notes, stage 3 | `corrective_amend_notes_3.png` | Target focused; row basis cells highlighted; notes 1, 2, 5, and 6 highlighted for removal |
| Filled-cell amend notes, stage 4 | `corrective_amend_notes_4.png` | Target focused; column basis cell highlighted; note 9 highlighted for removal |
