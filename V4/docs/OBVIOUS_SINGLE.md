# Obvious Single Hint

This is the docs-first fixture for the V4 obvious single strategy. An obvious
single is an unresolved cell with exactly one candidate note remaining, so that
note can be placed as the cell's value.

## Source Fixture

The example uses a standard 9x9 board from V4 test data:

- Source: `ADDITIONAL_TEST_BOARDS_BY_NAME.SINGLE_OBVIOUS_SINGLE`
- Target cell: `{ r: 1, c: 0 }`, which is row 2, column 1
- Note cell used by the hint: `{ r: 1, c: 0, type: "note", notes: [2] }`
- Value placed by the hint: `{ r: 1, c: 0, type: "value", value: 2 }`

The source fixture has exactly one unresolved location. After its notes have
been prepared, the target contains only note `2`. Cell locations use the V4
zero-indexed `{ r, c }` shape. User-facing text uses one-indexed row and column
labels.

## Frontend Demo

Frontend demo PR: TBD

Add the Frontend PR link here when the demo is available, and note whether the
PR has a comment linking to a live dev site.

## TypeScript Fixture

```ts
import type {
  Hint,
  HintStage,
  NoteCellWithLocation,
  ValueCellWithLocation,
} from "../Types";

const obviousSingleNoteCell: NoteCellWithLocation = {
  r: 1,
  c: 0,
  type: "note",
  notes: [2],
};

const obviousSingleValueCell: ValueCellWithLocation = {
  r: 1,
  c: 0,
  type: "value",
  value: 2,
};

const obviousSingleHintStages: HintStage[] = [
  {
    text: "An obvious single is a cell with only one note remaining.",
  },
  {
    highlightCells: [
      { location: obviousSingleNoteCell, highlightType: "focus" },
    ],
    text: "Row 2, column 1 has only one note remaining: 2.",
  },
  {
    placeValues: [obviousSingleValueCell],
    highlightCells: [
      { location: obviousSingleValueCell, highlightType: "placement" },
    ],
    text: "Place 2 in row 2, column 1.",
  },
];

export const obviousSingleHint: Hint = {
  strategy: "OBVIOUS_SINGLE",
  stages: obviousSingleHintStages,
};
```

## Expected Application

Applying the hint should make exactly this cell change:

```ts
const before: NoteCellWithLocation = {
  r: 1,
  c: 0,
  type: "note",
  notes: [2],
};

const after: ValueCellWithLocation = {
  r: 1,
  c: 0,
  type: "value",
  value: 2,
};
```

The application replaces the target note cell with the placed value. It should
not change any other cell.

## Frontend Screenshots

Screenshots should be saved under:

`V4/docs/screenshots/obvious-single/`

No screenshots exist yet. Add them in hint order using these filenames:

| Filename | Screenshot |
| --- | --- |
| `obvious_single_1.png` | Initial board with note `2` in row 2, column 1 |
| `obvious_single_2.png` | Stage 1 showing the strategy overview without highlights |
| `obvious_single_3.png` | Stage 2 focusing the target cell |
| `obvious_single_4.png` | Stage 3 placing `2` in the target cell |
