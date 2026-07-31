# Hidden Single Hint

This is the docs-first fixture for the V4 hidden single strategy. A hidden
single is a candidate that appears in only one unresolved cell of a row,
column, or box, even though that cell currently contains other notes.

The hidden-single hint removes the other notes from the target. The resulting
one-note cell is placed by the obvious single strategy on a later hint.

## Source Fixture

The prepared row fixture is exported by
`HIDDEN_SETS_FRONTEND_DEMO.ts`.

- Unit: row 5
- Hidden number: `7`
- Target: `{ r: 4, c: 6 }`
- Target notes before: `[2, 7, 9]`
- Notes removed: `[2, 9]`
- Target notes after: `[7]`
- No other unresolved cell in row 5 contains note `7`

Cell locations are zero-indexed. User-facing row and column labels are
one-indexed.

## Frontend Demo

The self-contained fixture is
[`HIDDEN_SETS_FRONTEND_DEMO.ts`](HIDDEN_SETS_FRONTEND_DEMO.ts).

## TypeScript Fixture

```ts
import type {
  CellLocation,
  Hint,
  HintStage,
  NoteCellWithLocation,
} from "../Types";

const target: NoteCellWithLocation = {
  r: 4,
  c: 6,
  type: "note",
  notes: [2, 7, 9],
};

const removal: NoteCellWithLocation = {
  r: 4,
  c: 6,
  type: "note",
  notes: [2, 9],
};

const otherRowCells: CellLocation[] = [
  { r: 4, c: 0 },
  { r: 4, c: 1 },
  { r: 4, c: 2 },
  { r: 4, c: 3 },
  { r: 4, c: 4 },
  { r: 4, c: 5 },
  { r: 4, c: 7 },
  { r: 4, c: 8 },
];

const stages: HintStage[] = [
  {
    text: "A hidden single is a note that appears in only one cell of a row, column, or box.",
  },
  {
    highlightCells: [
      ...otherRowCells.map((location) => ({
        location,
        highlightType: "focus" as const,
      })),
      { location: target, highlightType: "basis" },
    ],
    highlightNotes: [
      { location: target, value: 7, highlightType: "basis" },
    ],
    text: "In row 5, note 7 appears only in column 7.",
  },
  {
    removeNotes: [removal],
    highlightCells: [{ location: target, highlightType: "basis" }],
    highlightNotes: [
      { location: target, value: 2, highlightType: "removal" },
      { location: target, value: 9, highlightType: "removal" },
      { location: target, value: 7, highlightType: "basis" },
    ],
    text: "Remove the other notes from row 5, column 7, leaving only 7.",
  },
];

export const hiddenSingleHint: Hint = {
  strategy: "HIDDEN_SINGLE",
  stages,
};
```

## Expected Application

```ts
const before: NoteCellWithLocation = {
  r: 4,
  c: 6,
  type: "note",
  notes: [2, 7, 9],
};

const after: NoteCellWithLocation = {
  r: 4,
  c: 6,
  type: "note",
  notes: [7],
};
```

The strategy does not place `7`, alter another cell, or simplify peer notes.
The target must contain at least one extra note; a target already containing
only `7` belongs to obvious single and returns `null` here.
