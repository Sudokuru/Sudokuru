# Hidden Quadruplet Hint

This is the docs-first fixture for the V4 hidden quadruplet strategy. A hidden
quadruplet is four candidates that occur only within the same four cells of
one unit. All other notes can be removed from those four cells.

## Source Fixture

The prepared bottom-right-box fixture is exported by
`HIDDEN_SETS_FRONTEND_DEMO.ts`.

- Unit: the bottom-right box
- Hidden numbers: `[1, 2, 4, 6]`
- Basis cells:
  - `{ r: 6, c: 6 }`: `[1, 4, 5]`
  - `{ r: 6, c: 8 }`: `[2, 5, 8]`
  - `{ r: 8, c: 6 }`: `[1, 2, 6]`
  - `{ r: 8, c: 8 }`: `[4, 6, 9]`
- Removals: `[5]`, `[5, 8]`, none, and `[9]`, respectively
- No other unresolved cell in the box contains `1`, `2`, `4`, or `6`

## Frontend Demo

The self-contained fixture is
[`HIDDEN_SETS_FRONTEND_DEMO.ts`](HIDDEN_SETS_FRONTEND_DEMO.ts).

## TypeScript Fixture

```ts
import type { Hint, HintStage, NoteCellWithLocation } from "../Types";

const basis: NoteCellWithLocation[] = [
  { r: 6, c: 6, type: "note", notes: [1, 4, 5] },
  { r: 6, c: 8, type: "note", notes: [2, 5, 8] },
  { r: 8, c: 6, type: "note", notes: [1, 2, 6] },
  { r: 8, c: 8, type: "note", notes: [4, 6, 9] },
];

const removals: NoteCellWithLocation[] = [
  { r: 6, c: 6, type: "note", notes: [5] },
  { r: 6, c: 8, type: "note", notes: [5, 8] },
  { r: 8, c: 8, type: "note", notes: [9] },
];

const stages: HintStage[] = [
  {
    text: "A hidden quadruplet is four notes that appear only within the same four cells of one row, column, or box.",
  },
  {
    highlightCells: basis.map((location) => ({
      location,
      highlightType: "basis" as const,
    })),
    highlightNotes: basis.flatMap(({ r, c, notes }) =>
      notes
        .filter((value) => [1, 2, 4, 6].includes(value))
        .map((value) => ({
          location: { r, c },
          value,
          highlightType: "basis" as const,
        }))
    ),
    text: "In the bottom-right box, notes 1, 2, 4, and 6 appear only in four cells.",
  },
  {
    removeNotes: removals,
    highlightCells: basis.map((location) => ({
      location,
      highlightType: "basis" as const,
    })),
    highlightNotes: removals.flatMap(({ r, c, notes }) =>
      notes.map((value) => ({
        location: { r, c },
        value,
        highlightType: "removal" as const,
      }))
    ),
    text: "Keep 1, 2, 4, and 6 in those cells and remove their other notes.",
  },
];

export const hiddenQuadrupletHint: Hint = {
  strategy: "HIDDEN_QUADRUPLET",
  stages,
};
```

## Expected Application

```ts
const before: NoteCellWithLocation[] = [
  { r: 6, c: 6, type: "note", notes: [1, 4, 5] },
  { r: 6, c: 8, type: "note", notes: [2, 5, 8] },
  { r: 8, c: 6, type: "note", notes: [1, 2, 6] },
  { r: 8, c: 8, type: "note", notes: [4, 6, 9] },
];

const after: NoteCellWithLocation[] = [
  { r: 6, c: 6, type: "note", notes: [1, 4] },
  { r: 6, c: 8, type: "note", notes: [2] },
  { r: 8, c: 6, type: "note", notes: [1, 2, 6] },
  { r: 8, c: 8, type: "note", notes: [4, 6] },
];
```

The third basis cell is unchanged because it already contains only hidden-set
notes. The strategy rejects patterns containing a smaller hidden set and
returns `null` when no basis-cell note can be removed.
