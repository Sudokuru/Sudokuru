# Wrong Value Hint

This is the docs-first fixture for the V4 wrong value strategy. The
strategy should identify a user-entered value that contradicts the puzzle
state and return a staged hint that the Frontend can render directly.

## Source Fixture

The examples use a standard 9x9 board from V4 test data:

- Source: `ADDITIONAL_TEST_BOARDS_BY_NAME.ONLY_OBVIOUS_SINGLES`

### Direct Row Conflict

- User mistake: place `8` at `{ r: 0, c: 3 }`, which is row 1, column 4
- Obvious conflict: the given `8` at `{ r: 0, c: 4 }`, in the same row

### No Direct Conflict

- User mistake: place `4` at `{ r: 1, c: 1 }`, which is row 2, column 2
- No givens conflict: `4` is not currently present in that cell's row, column, or box
- Verified against `ADDITIONAL_TEST_BOARDS_BY_NAME.ONLY_OBVIOUS_SINGLES_SOLUTION`; the correct value is intentionally omitted from this doc and hint text

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

const directConflictWrongValue: ValueCellWithLocation = {
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

const noDirectConflictWrongValue: ValueCellWithLocation = {
  r: 1,
  c: 1,
  type: "value",
  value: 4,
};

const directConflictWrongValueHintStages: HintStage[] = [
  {
    highlightCells: [
      { location: directConflictWrongValue, highlightType: "removal" },
      { location: conflictingGiven, highlightType: "focus" },
    ],
    highlightValues: [
      { location: directConflictWrongValue, highlightType: "removal" },
      { location: conflictingGiven, highlightType: "focus" },
    ],
    text:
      "The 8 in row 1, column 4 conflicts with another 8 in the same row.",
  },
  {
    removeValues: [directConflictWrongValue],
    highlightCells: [
      { location: directConflictWrongValue, highlightType: "removal" },
    ],
    highlightValues: [
      { location: directConflictWrongValue, highlightType: "removal" },
    ],
    text: "Remove the user-entered 8 from row 1, column 4.",
  },
];

const noDirectConflictWrongValueHintStages: HintStage[] = [
  {
    highlightCells: [
      { location: noDirectConflictWrongValue, highlightType: "removal" },
    ],
    highlightValues: [
      { location: noDirectConflictWrongValue, highlightType: "removal" },
    ],
    text: "The 4 in row 2, column 2 is not the right value for this cell.",
  },
  {
    removeValues: [noDirectConflictWrongValue],
    highlightCells: [
      { location: noDirectConflictWrongValue, highlightType: "removal" },
    ],
    highlightValues: [
      { location: noDirectConflictWrongValue, highlightType: "removal" },
    ],
    text: "Remove the user-entered 4 from row 2, column 2.",
  },
];

export const directConflictWrongValueHint: WrongValueHint = {
  strategy: "WRONG_VALUE",
  stages: directConflictWrongValueHintStages,
};

export const noDirectConflictWrongValueHint: WrongValueHint = {
  strategy: "WRONG_VALUE",
  stages: noDirectConflictWrongValueHintStages,
};
```

## Expected Application

Applying either hint should make exactly one board change:

```ts
const directConflictBefore: ValueCellWithLocation = {
  r: 0,
  c: 3,
  type: "value",
  value: 8,
};

const directConflictAfter: NoteCellWithLocation = {
  r: 0,
  c: 3,
  type: "note",
  notes: [],
};

const noDirectConflictBefore: ValueCellWithLocation = {
  r: 1,
  c: 1,
  type: "value",
  value: 4,
};

const noDirectConflictAfter: NoteCellWithLocation = {
  r: 1,
  c: 1,
  type: "note",
  notes: [],
};
```

Removing the value from a cell that was empty before the user move should
restore that location to an unresolved empty cell. It should not place notes or
reveal the correct value. The wrong value strategy is a correction hint, not a
solving hint.

## Frontend Screenshots

Screenshots are saved under:

`V4/docs/screenshots/wrong-values/`

### Direct Row Conflict

Initial board with the wrong `8` in row 1, column 4:

![Direct conflict initial board](screenshots/wrong-values/1_direct_conflict.png)

Stage 1 highlights the wrong `8` and the conflicting given `8` in the same row:

![Direct conflict stage 1](screenshots/wrong-values/2_direct_conflict.png)

Stage 2 removes the user-entered `8`:

![Direct conflict stage 2](screenshots/wrong-values/3_direct_conflict.png)

### No Direct Conflict

Initial board with the wrong `4` in row 2, column 2:

![No direct conflict initial board](screenshots/wrong-values/1_no_direct_conflict.png)

Stage 1 highlights the wrong `4` without highlighting another conflicting cell:

![No direct conflict stage 1](screenshots/wrong-values/2_no_direct_conflict.png)

Stage 2 removes the user-entered `4`:

![No direct conflict stage 2](screenshots/wrong-values/3_no_direct_conflict.png)
