# Hidden Triplet Hint

This is the docs-first fixture for the V4 hidden triplet strategy. A hidden
triplet is three candidates that occur only within the same three cells of one
unit. Notes outside that three-number set can be removed from those cells.

## Source Fixture

The prepared column fixture is exported by
`HIDDEN_SETS_FRONTEND_DEMO.ts`.

- Unit: column 6
- Hidden numbers: `[1, 2, 3]`
- Basis cells:
  - `{ r: 0, c: 5 }`: `[1, 3, 7]`
  - `{ r: 4, c: 5 }`: `[2, 3, 8]`
  - `{ r: 8, c: 5 }`: `[1, 2, 3, 9]`
- Removals: `[7]`, `[8]`, and `[9]`, respectively
- No other unresolved cell in column 6 contains `1`, `2`, or `3`

## Frontend Demo

The self-contained fixture is
[`HIDDEN_SETS_FRONTEND_DEMO.ts`](HIDDEN_SETS_FRONTEND_DEMO.ts).

## TypeScript Fixture

```ts
import type { Hint, HintStage, NoteCellWithLocation } from "../Types";

const basis: NoteCellWithLocation[] = [
  { r: 0, c: 5, type: "note", notes: [1, 3, 7] },
  { r: 4, c: 5, type: "note", notes: [2, 3, 8] },
  { r: 8, c: 5, type: "note", notes: [1, 2, 3, 9] },
];

const removals: NoteCellWithLocation[] = [
  { r: 0, c: 5, type: "note", notes: [7] },
  { r: 4, c: 5, type: "note", notes: [8] },
  { r: 8, c: 5, type: "note", notes: [9] },
];

const stages: HintStage[] = [
  {
    text: "A hidden triplet is three notes that appear only within the same three cells of one row, column, or box.",
  },
  {
    highlightCells: basis.map((location) => ({
      location,
      highlightType: "basis" as const,
    })),
    highlightNotes: basis.flatMap(({ r, c, notes }) =>
      notes
        .filter((value) => [1, 2, 3].includes(value))
        .map((value) => ({
          location: { r, c },
          value,
          highlightType: "basis" as const,
        }))
    ),
    text: "In column 6, notes 1, 2, and 3 appear only in rows 1, 5, and 9.",
  },
  {
    removeNotes: removals,
    highlightCells: basis.map((location) => ({
      location,
      highlightType: "basis" as const,
    })),
    highlightNotes: removals.map(({ r, c, notes }) => ({
      location: { r, c },
      value: notes[0],
      highlightType: "removal" as const,
    })),
    text: "Keep 1, 2, and 3 in those cells and remove their other notes.",
  },
];

export const hiddenTripletHint: Hint = {
  strategy: "HIDDEN_TRIPLET",
  stages,
};
```

## Expected Application

```ts
const before: NoteCellWithLocation[] = [
  { r: 0, c: 5, type: "note", notes: [1, 3, 7] },
  { r: 4, c: 5, type: "note", notes: [2, 3, 8] },
  { r: 8, c: 5, type: "note", notes: [1, 2, 3, 9] },
];

const after: NoteCellWithLocation[] = [
  { r: 0, c: 5, type: "note", notes: [1, 3] },
  { r: 4, c: 5, type: "note", notes: [2, 3] },
  { r: 8, c: 5, type: "note", notes: [1, 2, 3] },
];
```

Only the three basis cells change. The strategy rejects patterns that contain
a smaller hidden single or pair and emits notes in ascending order.
