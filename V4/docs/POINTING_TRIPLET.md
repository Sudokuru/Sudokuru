# Pointing Triplet Hint

This is the docs-first fixture for the V4 pointing triplet strategy. A
pointing triplet occurs when a candidate appears in exactly three cells of a
box and all three cells share a row or column. That candidate can be removed
from the rest of the shared unit outside the box.

## Source Fixture

The prepared fixture is exported by `POINTING_SETS_FRONTEND_DEMO.ts`.

- Box: middle-left
- Candidate: `5`
- Basis cells: `{ r: 3, c: 1 }`, `{ r: 4, c: 1 }`, and `{ r: 5, c: 1 }`
- Shared unit: column 2
- Basis notes: `[2, 5]`, `[1, 5, 8]`, and `[3, 5, 9]`
- Removals:
  - `{ r: 0, c: 1 }`: remove `5` from `[4, 5]`
  - `{ r: 7, c: 1 }`: remove `5` from `[2, 5, 6]`

## Frontend Demo

The self-contained fixture is
[`POINTING_SETS_FRONTEND_DEMO.ts`](POINTING_SETS_FRONTEND_DEMO.ts).

## TypeScript Fixture

```ts
import type { Hint, HintStage, NoteCellWithLocation } from "../Types";

const basis: NoteCellWithLocation[] = [
  { r: 3, c: 1, type: "note", notes: [2, 5] },
  { r: 4, c: 1, type: "note", notes: [1, 5, 8] },
  { r: 5, c: 1, type: "note", notes: [3, 5, 9] },
];

const removals: NoteCellWithLocation[] = [
  { r: 0, c: 1, type: "note", notes: [5] },
  { r: 7, c: 1, type: "note", notes: [5] },
];

const stages: HintStage[] = [
  {
    text: "A pointing triplet is three cells in one box that contain every occurrence of a note in that box and share a row or column.",
  },
  {
    highlightCells: basis.map((location) => ({
      location,
      highlightType: "basis" as const,
    })),
    highlightNotes: basis.map((location) => ({
      location,
      value: 5,
      highlightType: "basis" as const,
    })),
    text: "In the middle-left box, note 5 appears only in column 2, rows 4, 5, and 6.",
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
      value: 5,
      highlightType: "removal" as const,
    })),
    text: "Remove note 5 from the rest of column 2 outside the middle-left box.",
  },
];

export const pointingTripletHint: Hint = {
  strategy: "POINTING_TRIPLET",
  stages,
};
```

## Expected Application

```ts
const before: NoteCellWithLocation[] = [
  { r: 0, c: 1, type: "note", notes: [4, 5] },
  { r: 7, c: 1, type: "note", notes: [2, 5, 6] },
];

const after: NoteCellWithLocation[] = [
  { r: 0, c: 1, type: "note", notes: [4] },
  { r: 7, c: 1, type: "note", notes: [2, 6] },
];
```

The basis cells remain unchanged. Reject a pointing triplet containing an
obvious single, pair, or triplet. Return `null` when no matching note exists
outside the box.
