# Simplify Notes Hint

This is the docs-first fixture for the V4 simplify notes strategy. Simplify
notes removes a candidate when the same value is already placed in the
candidate cell's row, column, or box.

Unlike amend notes, this strategy removes only candidates that are known to
conflict. It does not rebuild the target cell's complete candidate list.

## Source Fixture

The example uses a prepared version of
`ADDITIONAL_TEST_BOARDS_BY_NAME.ONLY_OBVIOUS_SINGLES`.

- Target cell: `{ r: 1, c: 2 }`, which is row 2, column 3
- Starting notes: `[2, 4, 8]`
- Conflicting value: the given `2` at `{ r: 1, c: 0 }`
- Removed notes: `[2]`
- Remaining notes: `[4, 8]`
- Conflict unit: row 2

Cell locations use the V4 zero-indexed `{ r, c }` shape. User-facing text uses
one-indexed row and column labels.

## Frontend Demo

The self-contained fixture is
[`SIMPLIFY_NOTES_FRONTEND_DEMO.ts`](SIMPLIFY_NOTES_FRONTEND_DEMO.ts). It exports
the prepared puzzle and exact hint below for Frontend review.

## TypeScript Fixture

```ts
import type {
  CellLocation,
  Hint,
  HintStage,
  NoteCellWithLocation,
  ValueCellWithLocation,
} from "../Types";

const target: NoteCellWithLocation = {
  r: 1,
  c: 2,
  type: "note",
  notes: [2, 4, 8],
};

const conflictingValue: ValueCellWithLocation = {
  r: 1,
  c: 0,
  type: "given",
  value: 2,
};

const removal: NoteCellWithLocation = {
  r: 1,
  c: 2,
  type: "note",
  notes: [2],
};

const rowFocus: CellLocation[] = [
  { r: 1, c: 1 },
  { r: 1, c: 3 },
  { r: 1, c: 4 },
  { r: 1, c: 5 },
  { r: 1, c: 6 },
  { r: 1, c: 7 },
  { r: 1, c: 8 },
];

const stages: HintStage[] = [
  {
    text: "Simplify notes removes candidates that conflict with a value already placed in the same row, column, or box.",
  },
  {
    removeNotes: [removal],
    highlightCells: [
      ...rowFocus.map((location) => ({
        location,
        highlightType: "focus" as const,
      })),
      { location: conflictingValue, highlightType: "basis" },
      { location: target, highlightType: "focus" },
    ],
    highlightNotes: [
      { location: target, value: 2, highlightType: "removal" },
    ],
    text: "Remove note 2 from row 2, column 3 because 2 is already in row 2.",
  },
];

export const simplifyNotesHint: Hint = {
  strategy: "SIMPLIFY_NOTES",
  stages,
};
```

## Expected Application

Applying the hint should make exactly this change:

```ts
const before: NoteCellWithLocation = {
  r: 1,
  c: 2,
  type: "note",
  notes: [2, 4, 8],
};

const after: NoteCellWithLocation = {
  r: 1,
  c: 2,
  type: "note",
  notes: [4, 8],
};
```

The strategy returns `null` when the targeted cell is not a note cell or none
of its notes conflict with a placed value. When more than one unit explains a
conflict, emit stages in row, column, then box order and do not remove the same
note twice.
