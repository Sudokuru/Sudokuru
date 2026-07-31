# Pointing Pair Hint

This is the docs-first fixture for the V4 pointing pair strategy. A pointing
pair occurs when a candidate appears in exactly two cells of a box and both
cells share a row or column. That candidate can be removed from the rest of
the shared row or column outside the box.

## Source Fixture

The prepared fixture is exported by `POINTING_SETS_FRONTEND_DEMO.ts`.

- Box: top-left
- Candidate: `7`
- Basis cells: `{ r: 1, c: 0 }` and `{ r: 1, c: 2 }`
- Shared unit: row 2
- The basis cells contain `[2, 7, 9]` and `[4, 7]`; they are not an obvious pair
- Removals:
  - `{ r: 1, c: 4 }`: remove `7` from `[1, 7]`
  - `{ r: 1, c: 7 }`: remove `7` from `[3, 7, 8]`

Cell locations are zero-indexed. User-facing row and column labels are
one-indexed.

## Frontend Demo

The self-contained fixture is
[`POINTING_SETS_FRONTEND_DEMO.ts`](POINTING_SETS_FRONTEND_DEMO.ts).

## TypeScript Fixture

```ts
import type { Hint, HintStage, NoteCellWithLocation } from "../Types";

const basis: NoteCellWithLocation[] = [
  { r: 1, c: 0, type: "note", notes: [2, 7, 9] },
  { r: 1, c: 2, type: "note", notes: [4, 7] },
];

const removals: NoteCellWithLocation[] = [
  { r: 1, c: 4, type: "note", notes: [7] },
  { r: 1, c: 7, type: "note", notes: [7] },
];

const stages: HintStage[] = [
  {
    text: "A pointing pair is two cells in one box that contain every occurrence of a note in that box and share a row or column.",
  },
  {
    highlightCells: basis.map((location) => ({
      location,
      highlightType: "basis" as const,
    })),
    highlightNotes: basis.map((location) => ({
      location,
      value: 7,
      highlightType: "basis" as const,
    })),
    text: "In the top-left box, note 7 appears only in row 2, columns 1 and 3.",
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
      value: 7,
      highlightType: "removal" as const,
    })),
    text: "Remove note 7 from the rest of row 2 outside the top-left box.",
  },
];

export const pointingPairHint: Hint = {
  strategy: "POINTING_PAIR",
  stages,
};
```

## Expected Application

```ts
const before: NoteCellWithLocation[] = [
  { r: 1, c: 4, type: "note", notes: [1, 7] },
  { r: 1, c: 7, type: "note", notes: [3, 7, 8] },
];

const after: NoteCellWithLocation[] = [
  { r: 1, c: 4, type: "note", notes: [1] },
  { r: 1, c: 7, type: "note", notes: [3, 8] },
];
```

The basis cells remain unchanged. A pointing pair that is also an obvious set
is rejected so the simpler strategy takes precedence. Scan boxes in row-major
order, candidates in ascending order, and row alignments before column
alignments.
