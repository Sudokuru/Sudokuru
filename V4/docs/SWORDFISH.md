# Swordfish Hint

This is the docs-first fixture for the V4 Swordfish strategy. A row-based
Swordfish exists when one candidate in three rows is confined to the same
three columns, with two or three occurrences in each base row. That candidate
can be removed from the cover columns in every other row. The column-based
form is the transpose of the same rule.

## Source Fixture

The self-contained prepared fixture is exported by
`SWORDFISH_FRONTEND_DEMO.ts`.

- Candidate: `4`
- Base rows: rows 1, 4, and 8
- Cover columns: columns 2, 6, and 8
- Basis cells:
  - row 1: `{ r: 0, c: 1 }`, `{ r: 0, c: 5 }`
  - row 4: `{ r: 3, c: 1 }`, `{ r: 3, c: 7 }`
  - row 8: `{ r: 7, c: 5 }`, `{ r: 7, c: 7 }`
- Removals:
  - `{ r: 1, c: 1 }`
  - `{ r: 2, c: 5 }`
  - `{ r: 8, c: 7 }`

## Frontend Demo

The self-contained fixture is
[`SWORDFISH_FRONTEND_DEMO.ts`](SWORDFISH_FRONTEND_DEMO.ts).

## TypeScript Fixture

```ts
import type { Hint, HintStage, NoteCellWithLocation } from "../Types";

const basis: NoteCellWithLocation[] = [
  { r: 0, c: 1, type: "note", notes: [2, 4] },
  { r: 0, c: 5, type: "note", notes: [4, 7] },
  { r: 3, c: 1, type: "note", notes: [1, 4, 8] },
  { r: 3, c: 7, type: "note", notes: [4, 9] },
  { r: 7, c: 5, type: "note", notes: [3, 4, 6] },
  { r: 7, c: 7, type: "note", notes: [4, 5] },
];

const removals: NoteCellWithLocation[] = [
  { r: 1, c: 1, type: "note", notes: [4] },
  { r: 2, c: 5, type: "note", notes: [4] },
  { r: 8, c: 7, type: "note", notes: [4] },
];

const stages: HintStage[] = [
  {
    text: "A Swordfish uses three rows and three columns that confine every occurrence of one note.",
  },
  {
    highlightCells: basis.map((location) => ({
      location,
      highlightType: "basis" as const,
    })),
    highlightNotes: basis.map((location) => ({
      location,
      value: 4,
      highlightType: "basis" as const,
    })),
    text: "In rows 1, 4, and 8, note 4 is confined to columns 2, 6, and 8, forming a Swordfish.",
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
      value: 4,
      highlightType: "removal" as const,
    })),
    text: "Remove note 4 from the other cells in columns 2, 6, and 8.",
  },
];

export const swordfishHint: Hint = {
  strategy: "SWORDFISH",
  stages,
};
```

## Expected Application

```ts
const before: NoteCellWithLocation[] = [
  { r: 1, c: 1, type: "note", notes: [4, 5] },
  { r: 2, c: 5, type: "note", notes: [1, 4, 8] },
  { r: 8, c: 7, type: "note", notes: [2, 4, 9] },
];

const after: NoteCellWithLocation[] = [
  { r: 1, c: 1, type: "note", notes: [5] },
  { r: 2, c: 5, type: "note", notes: [1, 8] },
  { r: 8, c: 7, type: "note", notes: [2, 9] },
];
```

The six basis cells remain unchanged. Every other note in the removal cells is
preserved.

Search row-based patterns before column-based patterns. Within an orientation,
search candidate values, base-unit combinations, and cover-unit combinations
in ascending lexicographic order. Reject patterns whose cover units collapse
to fewer than three distinct units, because those belong to a simpler fish.
