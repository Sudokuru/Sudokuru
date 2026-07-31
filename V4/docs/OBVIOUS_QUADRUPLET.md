# Obvious Quadruplet Hint

This is the docs-first fixture for the V4 obvious quadruplet strategy. An
obvious quadruplet is four cells in one unit whose combined candidates are
exactly four numbers. Those numbers can be removed from every other cell in
the unit.

## Source Fixture

The prepared box fixture is exported by
`OBVIOUS_SETS_FRONTEND_DEMO.ts`.

- Unit: the top-left box
- Basis cells and notes:
  - `{ r: 0, c: 0 }`: `[1, 2]`
  - `{ r: 0, c: 1 }`: `[2, 3]`
  - `{ r: 1, c: 0 }`: `[1, 4]`
  - `{ r: 1, c: 1 }`: `[3, 4]`
- Basis numbers: `[1, 2, 3, 4]`
- Removals:
  - `{ r: 2, c: 0 }`: `[1]`
  - `{ r: 2, c: 1 }`: `[2]`
  - `{ r: 2, c: 2 }`: `[3, 4]`

## Frontend Demo

The self-contained fixture is
[`OBVIOUS_SETS_FRONTEND_DEMO.ts`](OBVIOUS_SETS_FRONTEND_DEMO.ts).

## TypeScript Fixture

```ts
import type { Hint, HintStage, NoteCellWithLocation } from "../Types";

const basis: NoteCellWithLocation[] = [
  { r: 0, c: 0, type: "note", notes: [1, 2] },
  { r: 0, c: 1, type: "note", notes: [2, 3] },
  { r: 1, c: 0, type: "note", notes: [1, 4] },
  { r: 1, c: 1, type: "note", notes: [3, 4] },
];

const removals: NoteCellWithLocation[] = [
  { r: 2, c: 0, type: "note", notes: [1] },
  { r: 2, c: 1, type: "note", notes: [2] },
  { r: 2, c: 2, type: "note", notes: [3, 4] },
];

const stages: HintStage[] = [
  {
    text: "An obvious quadruplet is four cells in one row, column, or box whose combined notes are exactly four numbers.",
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
    text: "In the top-left box, four cells are limited to 1, 2, 3, and 4.",
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
    highlightNotes: removals.flatMap(({ r, c, notes }) =>
      notes.map((value) => ({
        location: { r, c },
        value,
        highlightType: "removal" as const,
      }))
    ),
    text: "Remove 1, 2, 3, and 4 from the other cells in the top-left box.",
  },
];

export const obviousQuadrupletHint: Hint = {
  strategy: "OBVIOUS_QUADRUPLET",
  stages,
};
```

## Expected Application

```ts
const before: NoteCellWithLocation[] = [
  { r: 2, c: 0, type: "note", notes: [1, 5] },
  { r: 2, c: 1, type: "note", notes: [2, 6] },
  { r: 2, c: 2, type: "note", notes: [3, 4, 7] },
];

const after: NoteCellWithLocation[] = [
  { r: 2, c: 0, type: "note", notes: [5] },
  { r: 2, c: 1, type: "note", notes: [6] },
  { r: 2, c: 2, type: "note", notes: [7] },
];
```

The strategy rejects quadruplets containing a smaller obvious set. Basis
cells never change, and a hint is emitted only when at least one other note can
be removed.
