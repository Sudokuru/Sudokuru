# Hidden Pair Hint

This is the docs-first fixture for the V4 hidden pair strategy. A hidden pair
is two candidates that occur in exactly the same two cells of one unit. Other
notes can be removed from those two cells.

## Source Fixture

The prepared row fixture is exported by
`HIDDEN_SETS_FRONTEND_DEMO.ts`.

- Unit: row 4
- Hidden numbers: `[4, 8]`
- Basis cells:
  - `{ r: 3, c: 1 }`: `[1, 4, 8]`
  - `{ r: 3, c: 7 }`: `[4, 8, 9]`
- No other unresolved cell in row 4 contains `4` or `8`
- Removals: note `1` from the first basis cell and note `9` from the second

## Frontend Demo

The self-contained fixture is
[`HIDDEN_SETS_FRONTEND_DEMO.ts`](HIDDEN_SETS_FRONTEND_DEMO.ts).

## TypeScript Fixture

```ts
import type { Hint, HintStage, NoteCellWithLocation } from "../Types";

const basis: NoteCellWithLocation[] = [
  { r: 3, c: 1, type: "note", notes: [1, 4, 8] },
  { r: 3, c: 7, type: "note", notes: [4, 8, 9] },
];

const removals: NoteCellWithLocation[] = [
  { r: 3, c: 1, type: "note", notes: [1] },
  { r: 3, c: 7, type: "note", notes: [9] },
];

const stages: HintStage[] = [
  {
    text: "A hidden pair is two notes that appear in only the same two cells of one row, column, or box.",
  },
  {
    highlightCells: basis.map((location) => ({
      location,
      highlightType: "basis" as const,
    })),
    highlightNotes: basis.flatMap((location) =>
      [4, 8].map((value) => ({
        location,
        value,
        highlightType: "basis" as const,
      }))
    ),
    text: "In row 4, notes 4 and 8 appear only in columns 2 and 8.",
  },
  {
    removeNotes: removals,
    highlightCells: basis.map((location) => ({
      location,
      highlightType: "basis" as const,
    })),
    highlightNotes: [
      { location: basis[0], value: 1, highlightType: "removal" },
      { location: basis[0], value: 4, highlightType: "basis" },
      { location: basis[0], value: 8, highlightType: "basis" },
      { location: basis[1], value: 4, highlightType: "basis" },
      { location: basis[1], value: 8, highlightType: "basis" },
      { location: basis[1], value: 9, highlightType: "removal" },
    ],
    text: "Keep 4 and 8 in those cells and remove their other notes.",
  },
];

export const hiddenPairHint: Hint = {
  strategy: "HIDDEN_PAIR",
  stages,
};
```

## Expected Application

```ts
const before: NoteCellWithLocation[] = [
  { r: 3, c: 1, type: "note", notes: [1, 4, 8] },
  { r: 3, c: 7, type: "note", notes: [4, 8, 9] },
];

const after: NoteCellWithLocation[] = [
  { r: 3, c: 1, type: "note", notes: [4, 8] },
  { r: 3, c: 7, type: "note", notes: [4, 8] },
];
```

The strategy rejects a candidate pair that is actually two independent hidden
singles. It returns `null` unless at least one non-pair note can be removed
from a basis cell.
