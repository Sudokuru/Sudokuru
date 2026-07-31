# Obvious Triplet Hint

This is the docs-first fixture for the V4 obvious triplet strategy. An obvious
triplet is three cells in one unit whose combined candidates are exactly three
numbers. Those numbers can be removed from every other cell in the unit.

## Source Fixture

The prepared row fixture is exported by
`OBVIOUS_SETS_FRONTEND_DEMO.ts`.

- Unit: row 3
- Basis cells and notes:
  - `{ r: 2, c: 0 }`: `[1, 4]`
  - `{ r: 2, c: 3 }`: `[1, 6]`
  - `{ r: 2, c: 7 }`: `[4, 6]`
- Basis numbers: `[1, 4, 6]`
- Removals:
  - `{ r: 2, c: 4 }`: remove `[1, 6]` from `[1, 2, 6]`
  - `{ r: 2, c: 8 }`: remove `[4]` from `[3, 4]`

## Frontend Demo

The self-contained fixture is
[`OBVIOUS_SETS_FRONTEND_DEMO.ts`](OBVIOUS_SETS_FRONTEND_DEMO.ts).

## TypeScript Fixture

```ts
import type { Hint, HintStage, NoteCellWithLocation } from "../Types";

const basis: NoteCellWithLocation[] = [
  { r: 2, c: 0, type: "note", notes: [1, 4] },
  { r: 2, c: 3, type: "note", notes: [1, 6] },
  { r: 2, c: 7, type: "note", notes: [4, 6] },
];

const removals: NoteCellWithLocation[] = [
  { r: 2, c: 4, type: "note", notes: [1, 6] },
  { r: 2, c: 8, type: "note", notes: [4] },
];

const stages: HintStage[] = [
  {
    text: "An obvious triplet is three cells in one row, column, or box whose combined notes are exactly three numbers.",
  },
  {
    highlightCells: basis.map((location) => ({
      location,
      highlightType: "basis" as const,
    })),
    highlightNotes: basis.flatMap(({ r, c, notes }) =>
      notes.map((value) => ({
        location: { r, c },
        value,
        highlightType: "basis" as const,
      }))
    ),
    text: "In row 3, the cells in columns 1, 4, and 8 are limited to 1, 4, and 6.",
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
    highlightNotes: [
      { location: removals[0], value: 1, highlightType: "removal" },
      { location: removals[0], value: 6, highlightType: "removal" },
      { location: removals[1], value: 4, highlightType: "removal" },
    ],
    text: "Remove 1, 4, and 6 from the other cells in row 3.",
  },
];

export const obviousTripletHint: Hint = {
  strategy: "OBVIOUS_TRIPLET",
  stages,
};
```

## Expected Application

Only the two removal cells change:

```ts
const before: NoteCellWithLocation[] = [
  { r: 2, c: 4, type: "note", notes: [1, 2, 6] },
  { r: 2, c: 8, type: "note", notes: [3, 4] },
];

const after: NoteCellWithLocation[] = [
  { r: 2, c: 4, type: "note", notes: [2] },
  { r: 2, c: 8, type: "note", notes: [3] },
];
```

The strategy rejects subsets that contain an obvious single or pair. It
returns `null` when the three basis cells produce no removal.
