/**
 * Self-contained wrong-value hint demo fixture for quick Frontend testing.
 *
 * This file intentionally imports nothing. Copy/paste it into a Frontend repo,
 * stub getHint() to return one of the exported hints, and load the matching
 * puzzle state below.
 */

type SudokuValue = number;

type CellLocation = {
  r: number;
  c: number;
};

type CellWithValue = {
  type: "given" | "value";
  value: SudokuValue;
};

type CellWithNotes = {
  type: "note";
  notes: SudokuValue[];
};

type CellProps = CellWithValue | CellWithNotes;
type ValueCellWithLocation = CellWithValue & CellLocation;
type NoteCellWithLocation = CellWithNotes & CellLocation;

type HighlightType = "removal" | "placement" | "focus";

type HighlightedCell = {
  location: CellLocation;
  highlightType: HighlightType;
};

type HighlightedValue = {
  location: CellLocation;
  highlightType: HighlightType;
};

type HighlightedNote = {
  location: CellLocation;
  value: SudokuValue;
  highlightType: HighlightType;
};

type HintStage = {
  removeValues?: ValueCellWithLocation[];
  removeNotes?: NoteCellWithLocation[];
  placeValues?: ValueCellWithLocation[];
  placeNotes?: NoteCellWithLocation[];
  highlightCells?: HighlightedCell[];
  highlightValues?: HighlightedValue[];
  highlightNotes?: HighlightedNote[];
  text?: string;
};

type WrongValueHint = {
  strategy: "WRONG_VALUE";
  stages: HintStage[];
};

type WrongValueDemoCase = {
  id: "direct-row-conflict" | "no-direct-conflict";
  label: string;
  puzzle: CellProps[][];
  solution: SudokuValue[][];
  hint: WrongValueHint;
};

const BASE_PUZZLE_NUMBERS: SudokuValue[][] = [
  [3, 1, 0, 0, 8, 4, 0, 0, 2],
  [2, 0, 0, 1, 5, 0, 0, 0, 6],
  [5, 7, 0, 0, 0, 3, 0, 1, 0],
  [4, 2, 3, 7, 0, 8, 0, 9, 5],
  [7, 6, 0, 0, 3, 0, 0, 0, 0],
  [0, 0, 9, 5, 6, 2, 0, 3, 0],
  [0, 5, 0, 0, 0, 6, 0, 7, 0],
  [0, 0, 7, 0, 0, 0, 9, 0, 0],
  [0, 0, 0, 0, 0, 1, 5, 0, 0],
];

const PUZZLE_SOLUTION_NUMBERS: SudokuValue[][] = [
  [3, 1, 6, 9, 8, 4, 7, 5, 2],
  [2, 9, 8, 1, 5, 7, 3, 4, 6],
  [5, 7, 4, 6, 2, 3, 8, 1, 9],
  [4, 2, 3, 7, 1, 8, 6, 9, 5],
  [7, 6, 5, 4, 3, 9, 1, 2, 8],
  [1, 8, 9, 5, 6, 2, 4, 3, 7],
  [8, 5, 1, 3, 9, 6, 2, 7, 4],
  [6, 3, 7, 2, 4, 5, 9, 8, 1],
  [9, 4, 2, 8, 7, 1, 5, 6, 3],
];

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

function numbersToPuzzle(numbers: SudokuValue[][]): CellProps[][] {
  return numbers.map((row) =>
    row.map((value): CellProps => {
      if (value === 0) {
        return { type: "note", notes: [] };
      }

      return { type: "given", value };
    })
  );
}

function withWrongValue(
  numbers: SudokuValue[][],
  wrongValue: ValueCellWithLocation
): CellProps[][] {
  return numbers.map((row, r) =>
    row.map((value, c): CellProps => {
      if (r === wrongValue.r && c === wrongValue.c) {
        return {
          type: "value",
          value: wrongValue.value,
        };
      }

      if (value === 0) {
        return { type: "note", notes: [] };
      }

      return { type: "given", value };
    })
  );
}

export const wrongValueBasePuzzle: CellProps[][] =
  numbersToPuzzle(BASE_PUZZLE_NUMBERS);

export const wrongValuePuzzleSolution: SudokuValue[][] =
  PUZZLE_SOLUTION_NUMBERS;

export const directConflictWrongValuePuzzle: CellProps[][] = withWrongValue(
  BASE_PUZZLE_NUMBERS,
  directConflictWrongValue
);

export const noDirectConflictWrongValuePuzzle: CellProps[][] = withWrongValue(
  BASE_PUZZLE_NUMBERS,
  noDirectConflictWrongValue
);

export const directConflictWrongValueHint: WrongValueHint = {
  strategy: "WRONG_VALUE",
  stages: [
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
  ],
};

export const noDirectConflictWrongValueHint: WrongValueHint = {
  strategy: "WRONG_VALUE",
  stages: [
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
  ],
};

export const wrongValueDemoCases: WrongValueDemoCase[] = [
  {
    id: "direct-row-conflict",
    label: "Wrong value with direct row conflict",
    puzzle: directConflictWrongValuePuzzle,
    solution: wrongValuePuzzleSolution,
    hint: directConflictWrongValueHint,
  },
  {
    id: "no-direct-conflict",
    label: "Wrong value with no direct conflict",
    puzzle: noDirectConflictWrongValuePuzzle,
    solution: wrongValuePuzzleSolution,
    hint: noDirectConflictWrongValueHint,
  },
];

export function getWrongValueDemoCase(
  id: WrongValueDemoCase["id"]
): WrongValueDemoCase {
  const demoCase = wrongValueDemoCases.find((candidate) => candidate.id === id);

  if (!demoCase) {
    throw new Error(`Unknown wrong value demo case: ${id}`);
  }

  return demoCase;
}
