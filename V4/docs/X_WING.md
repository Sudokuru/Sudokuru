# X-Wing Hint

This is the docs-first fixture for the V4 X-Wing strategy. A row-based X-Wing
exists when one candidate occurs in exactly the same two columns of two rows.
That candidate can be removed from those columns in every other row. The
column-based form is the transpose of the same rule.

## Source Fixture

The self-contained prepared fixture is exported by
`X_WING_FRONTEND_DEMO.ts`.

- Candidate: `7`
- Base rows: rows 2 and 6
- Cover columns: columns 2 and 7
- Basis cells:
  - `{ r: 1, c: 1 }`
  - `{ r: 1, c: 6 }`
  - `{ r: 5, c: 1 }`
  - `{ r: 5, c: 6 }`
- Each base row contains note `7` in exactly those two columns
- Removals:
  - `{ r: 0, c: 1 }`
  - `{ r: 3, c: 1 }`
  - `{ r: 2, c: 6 }`
  - `{ r: 8, c: 6 }`

## Frontend Demo

The self-contained fixture is
[`X_WING_FRONTEND_DEMO.ts`](X_WING_FRONTEND_DEMO.ts).

## TypeScript Fixture

```ts
import type { Hint, HintStage, NoteCellWithLocation } from "../Types";

const basis: NoteCellWithLocation[] = [
  { r: 1, c: 1, type: "note", notes: [2, 7] },
  { r: 1, c: 6, type: "note", notes: [4, 7, 9] },
  { r: 5, c: 1, type: "note", notes: [1, 7, 8] },
  { r: 5, c: 6, type: "note", notes: [3, 7] },
];

const removals: NoteCellWithLocation[] = [
  { r: 0, c: 1, type: "note", notes: [7] },
  { r: 2, c: 6, type: "note", notes: [7] },
  { r: 3, c: 1, type: "note", notes: [7] },
  { r: 8, c: 6, type: "note", notes: [7] },
];

const stages: HintStage[] = [
  {
    text: "An X-Wing uses two rows and two columns where one note can occupy only the four corner cells.",
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
    text: "In rows 2 and 6, note 7 appears only in columns 2 and 7, forming an X-Wing.",
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
    text: "Remove note 7 from the other cells in columns 2 and 7.",
  },
];

export const xWingHint: Hint = {
  strategy: "X_WING",
  stages,
};
```

## Expected Application

```ts
const before: NoteCellWithLocation[] = [
  { r: 0, c: 1, type: "note", notes: [5, 7] },
  { r: 2, c: 6, type: "note", notes: [1, 7] },
  { r: 3, c: 1, type: "note", notes: [3, 7, 9] },
  { r: 8, c: 6, type: "note", notes: [2, 6, 7] },
];

const after: NoteCellWithLocation[] = [
  { r: 0, c: 1, type: "note", notes: [5] },
  { r: 2, c: 6, type: "note", notes: [1] },
  { r: 3, c: 1, type: "note", notes: [3, 9] },
  { r: 8, c: 6, type: "note", notes: [2, 6] },
];
```

The four basis cells do not change. Every other note in the removal cells is
preserved.

Search row-based patterns before column-based patterns. Within an orientation,
search candidate values, base-unit combinations, and cover-unit combinations
in ascending lexicographic order. A rectangle with no candidate to remove
returns `null`.
