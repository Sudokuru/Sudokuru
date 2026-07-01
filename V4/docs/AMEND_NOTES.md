# Amend Notes Hint

This is the docs-first fixture for the V4 amend notes strategy. The strategy
should reset a note cell, then rebuild it with every note that does not
conflict with placed values in the same row, column, or box.

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

const filledTargetCell: NoteCellWithLocation = {
  r: 1,
  c: 6,
  type: "note",
  notes: [4, 7, 8],
};

const filledClearedCell: NoteCellWithLocation = {
  r: 1,
  c: 6,
  type: "note",
  notes: [4, 7, 8],
};

const filledAmendedCell: NoteCellWithLocation = {
  r: 1,
  c: 6,
  type: "note",
  notes: [3, 4, 7, 8],
};

const filledBasisCells: CellLocation[] = [
  { r: 1, c: 0 },
  { r: 1, c: 3 },
  { r: 1, c: 4 },
  { r: 1, c: 8 },
  { r: 7, c: 6 },
  { r: 8, c: 6 },
  { r: 0, c: 8 },
  { r: 2, c: 7 },
];

const basicAmendNotesHintStages: HintStage[] = [
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
];

const filledAmendNotesHintStages: HintStage[] = [
  {
    highlightCells: [
      { location: filledTargetCell, highlightType: "focus" },
      ...filledBasisCells.map((location) => ({
        location,
        highlightType: "basis" as const,
      })),
    ],
    text:
      "Row 2, column 7 should contain every note that does not conflict with its row, column, or box.",
  },
  {
    removeNotes: [filledClearedCell],
    highlightCells: [
      { location: filledTargetCell, highlightType: "focus" },
    ],
    highlightNotes: [
      { location: filledTargetCell, value: 4, highlightType: "removal" },
      { location: filledTargetCell, value: 7, highlightType: "removal" },
      { location: filledTargetCell, value: 8, highlightType: "removal" },
    ],
    text: "Clear the notes from row 2, column 7.",
  },
  {
    placeNotes: [filledAmendedCell],
    highlightCells: [
      { location: filledTargetCell, highlightType: "focus" },
    ],
    highlightNotes: [
      { location: filledTargetCell, value: 3, highlightType: "placement" },
      { location: filledTargetCell, value: 4, highlightType: "placement" },
      { location: filledTargetCell, value: 7, highlightType: "placement" },
      { location: filledTargetCell, value: 8, highlightType: "placement" },
    ],
    text: "Set row 2, column 7 to notes 3, 4, 7, and 8.",
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

Amend notes resets the target note cell, then rebuilds it with all
nonconflicting notes. It does not place a value.

## Frontend Screenshots

When the Frontend renders these static hints, save the screenshots under:

`V4/docs/screenshots/amend-notes/`

| Example | File | Expected capture |
| ------- | ---- | ---------------- |
| Basic amend notes, stage 1 | `basic_amend_notes_1.png` | Target highlighted as focus; row, column, and box basis cells highlighted as basis |
| Basic amend notes, stage 2 | `basic_amend_notes_2.png` | Target cell cleared before notes are rebuilt |
| Basic amend notes, stage 3 | `basic_amend_notes_3.png` | Target cell set to notes 4 and 8 |
| Filled-cell amend notes, stage 1 | `corrective_amend_notes_1.png` | Target highlighted as focus; row, column, and box basis cells highlighted as basis |
| Filled-cell amend notes, stage 2 | `corrective_amend_notes_2.png` | Existing target notes highlighted for removal |
| Filled-cell amend notes, stage 3 | `corrective_amend_notes_3.png` | Target cell set to notes 3, 4, 7, and 8 |
