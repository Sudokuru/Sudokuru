# Box-Line Reduction Hint

This is the docs-first fixture for the V4 box-line reduction strategy, also
called a claiming pair or claiming triplet. When every occurrence of a
candidate in a row or column lies in one box, that candidate can be removed
from the rest of the box.

## Source Fixture

The self-contained prepared fixture is exported by
`BOX_LINE_REDUCTION_FRONTEND_DEMO.ts`.

- Source unit: row 3
- Candidate: `6`
- Basis cells: `{ r: 2, c: 3 }` and `{ r: 2, c: 5 }`
- Shared box: top-middle
- No other unresolved cell in row 3 contains note `6`
- Removals:
  - `{ r: 0, c: 4 }`: remove `6` from `[2, 6, 8]`
  - `{ r: 1, c: 3 }`: remove `6` from `[1, 6, 9]`

Cell locations are zero-indexed. User-facing row and column labels are
one-indexed.

## Frontend Demo

The self-contained fixture is
[`BOX_LINE_REDUCTION_FRONTEND_DEMO.ts`](BOX_LINE_REDUCTION_FRONTEND_DEMO.ts).

## TypeScript Fixture

```ts
import type { Hint, HintStage, NoteCellWithLocation } from "../Types";

const basis: NoteCellWithLocation[] = [
  { r: 2, c: 3, type: "note", notes: [4, 6] },
  { r: 2, c: 5, type: "note", notes: [1, 6, 7] },
];

const removals: NoteCellWithLocation[] = [
  { r: 0, c: 4, type: "note", notes: [6] },
  { r: 1, c: 3, type: "note", notes: [6] },
];

const stages: HintStage[] = [
  {
    text: "Box-line reduction applies when every occurrence of a note in one row or column lies inside the same box.",
  },
  {
    highlightCells: basis.map((location) => ({
      location,
      highlightType: "basis" as const,
    })),
    highlightNotes: basis.map((location) => ({
      location,
      value: 6,
      highlightType: "basis" as const,
    })),
    text: "In row 3, note 6 appears only in columns 4 and 6, both inside the top-middle box.",
  },
  {
    removeNotes: removals,
    highlightCells: [
      ...basis.map((location) => ({
        location,
        highlightType: "basis" as const,
      })),
      ...removals.map((location) => ({
        location,
        highlightType: "focus" as const,
      })),
    ],
    highlightNotes: removals.map((location) => ({
      location,
      value: 6,
      highlightType: "removal" as const,
    })),
    text: "Remove note 6 from the other cells in the top-middle box.",
  },
];

export const boxLineReductionHint: Hint = {
  strategy: "BOX_LINE_REDUCTION",
  stages,
};
```

## Expected Application

```ts
const before: NoteCellWithLocation[] = [
  { r: 0, c: 4, type: "note", notes: [2, 6, 8] },
  { r: 1, c: 3, type: "note", notes: [1, 6, 9] },
];

const after: NoteCellWithLocation[] = [
  { r: 0, c: 4, type: "note", notes: [2, 8] },
  { r: 1, c: 3, type: "note", notes: [1, 9] },
];
```

The basis cells remain unchanged. Search rows before columns, then unit
indexes and candidate values in ascending order. A valid confinement with no
box note to remove returns `null`.
