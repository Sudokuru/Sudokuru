# Wrong Value Hint

This is the docs-first fixture for the V4 wrong value strategy. The
strategy should identify a user-entered value that contradicts the puzzle
state and return a staged hint that the Frontend can render directly.

## Source Fixture

The example uses a standard 9x9 board from V4 test data:

- Source: `ADDITIONAL_TEST_BOARDS_BY_NAME.ONLY_OBVIOUS_SINGLES`
- User mistake: place `8` at `{ r: 0, c: 3 }`, which is row 1, column 4
- Obvious conflict: the given `8` at `{ r: 0, c: 4 }`, in the same row

Cell locations use the V4 zero-indexed `{ r, c }` shape. User-facing text
uses one-indexed row and column labels.

## TypeScript Fixture

The current `SudokuStrategy` union in `V4/Types.ts` does not yet include
`"WRONG_VALUE"`. This fixture uses a local `WrongValueHint` type so the
documented behavior is explicit before the public strategy type is updated.

```ts
import type {
  Hint,
  HintStage,
  ValueCellWithLocation,
} from "../Types";

type WrongValueHint = Omit<Hint, "strategy"> & {
  strategy: "WRONG_VALUE";
};

const userWrongValue: ValueCellWithLocation = {
  r: 0,
  c: 3,
  type: "value",
  value: 8,
};

const conflictingGiven: ValueCellWithLocation = {
  r: 0,
  c: 4,
  type: "given",
  value: 8,
};

const wrongValueHintStages: HintStage[] = [
  {
    highlightCells: [
      { location: userWrongValue, highlightType: "removal" },
      { location: conflictingGiven, highlightType: "focus" },
    ],
    highlightValues: [
      { location: userWrongValue, highlightType: "removal" },
      { location: conflictingGiven, highlightType: "focus" },
    ],
    text:
      "The 8 in row 1, column 4 conflicts with another 8 in the same row.",
  },
  {
    removeValues: [userWrongValue],
    highlightCells: [
      { location: userWrongValue, highlightType: "removal" },
    ],
    highlightValues: [
      { location: userWrongValue, highlightType: "removal" },
    ],
    text: "Remove the user-entered 8 from row 1, column 4.",
  },
];

export const wrongValueHint: WrongValueHint = {
  strategy: "WRONG_VALUE",
  stages: wrongValueHintStages,
};
```

## Expected Application

Applying this hint should make exactly one board change:

```ts
const before: ValueCellWithLocation = {
  r: 0,
  c: 3,
  type: "value",
  value: 8,
};

const after: NoteCellWithLocation = {
  r: 0,
  c: 3,
  type: "note",
  notes: [],
};
```

Removing the value from a cell that was empty before the user move should
restore that location to an unresolved empty cell. It should not place notes or
reveal the correct value. The wrong value strategy is a correction hint, not a
solving hint.

## Frontend Screenshot Slots

When the Frontend renders this static hint, save the screenshots under:

`V4/docs/screenshots/wrong-values/`

| Stage | File | Expected capture |
| ----- | ---- | ---------------- |
| 1 | `stage-1-conflict.png` | Wrong `8` highlighted for removal, conflicting given `8` highlighted as focus |
| 2 | `stage-2-remove-value.png` | User-entered `8` highlighted while the hint removes it |
