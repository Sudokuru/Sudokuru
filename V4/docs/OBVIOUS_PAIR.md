# Obvious Pair Hint

This is the docs-first fixture for the V4 obvious pair strategy. An obvious
pair is two cells in one unit whose combined candidates are exactly two
numbers. Those numbers can be removed from every other cell in that unit.

## Source Fixture

The example uses the prepared row fixture exported by
`OBVIOUS_SETS_FRONTEND_DEMO.ts`.

- Unit: row 1
- Basis cells: `{ r: 0, c: 0 }` and `{ r: 0, c: 3 }`
- Basis notes: `[2, 7]`
- Removals:
  - `{ r: 0, c: 5 }`: remove `[2, 7]` from `[2, 4, 7]`
  - `{ r: 0, c: 8 }`: remove `[7]` from `[1, 7]`

Cell locations are zero-indexed. User-facing row and column labels are
one-indexed.

## Frontend Demo

The self-contained fixture is
[`OBVIOUS_SETS_FRONTEND_DEMO.ts`](OBVIOUS_SETS_FRONTEND_DEMO.ts).

## TypeScript Fixture

```ts
import type {
  Hint,
  HintStage,
  NoteCellWithLocation,
} from "../Types";

const basis: NoteCellWithLocation[] = [
  { r: 0, c: 0, type: "note", notes: [2, 7] },
  { r: 0, c: 3, type: "note", notes: [2, 7] },
];

const removals: NoteCellWithLocation[] = [
  { r: 0, c: 5, type: "note", notes: [2, 7] },
  { r: 0, c: 8, type: "note", notes: [7] },
];

const stages: HintStage[] = [
  {
    text: "An obvious pair is two cells in one row, column, or box whose combined notes are exactly two numbers.",
  },
  {
    highlightCells: basis.map((location) => ({
      location,
      highlightType: "basis" as const,
    })),
    highlightNotes: basis.flatMap((location) =>
      [2, 7].map((value) => ({
        location,
        value,
        highlightType: "basis" as const,
      }))
    ),
    text: "In row 1, the cells in columns 1 and 4 are limited to 2 and 7.",
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
      { location: removals[0], value: 2, highlightType: "removal" },
      { location: removals[0], value: 7, highlightType: "removal" },
      { location: removals[1], value: 7, highlightType: "removal" },
    ],
    text: "Remove 2 and 7 from the other cells in row 1.",
  },
];

export const obviousPairHint: Hint = {
  strategy: "OBVIOUS_PAIR",
  stages,
};
```

## Expected Application

```ts
const before: NoteCellWithLocation[] = [
  { r: 0, c: 0, type: "note", notes: [2, 7] },
  { r: 0, c: 3, type: "note", notes: [2, 7] },
  { r: 0, c: 5, type: "note", notes: [2, 4, 7] },
  { r: 0, c: 8, type: "note", notes: [1, 7] },
];

const after: NoteCellWithLocation[] = [
  { r: 0, c: 0, type: "note", notes: [2, 7] },
  { r: 0, c: 3, type: "note", notes: [2, 7] },
  { r: 0, c: 5, type: "note", notes: [4] },
  { r: 0, c: 8, type: "note", notes: [1] },
];
```

The basis cells remain unchanged. The strategy returns `null` unless at least
one note can be removed. Unit traversal follows `UNIT_PRECEDENCE`; cells and
notes are emitted in row-major and ascending numeric order.
