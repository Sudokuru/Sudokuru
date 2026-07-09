/**
 * Self-contained obvious-single hint demo fixture for quick Frontend testing.
 *
 * This file intentionally imports nothing. Copy/paste it into a Frontend repo,
 * stub getHint() to return the exported hint, and load the puzzle state below.
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

type HighlightType = "removal" | "placement" | "focus" | "basis";

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

type ObviousSingleHint = {
  strategy: "OBVIOUS_SINGLE";
  stages: HintStage[];
};

type ObviousSingleDemoCase = {
  id: "single-obvious-single";
  label: string;
  puzzle: CellProps[][];
  hint: ObviousSingleHint;
};

const SOURCE_PUZZLE_NUMBERS: SudokuValue[][] = [
  [4, 3, 9, 2, 7, 5, 6, 1, 8],
  [0, 5, 1, 8, 9, 6, 4, 3, 7],
  [8, 7, 6, 1, 4, 3, 5, 9, 2],
  [3, 4, 2, 6, 8, 7, 9, 5, 1],
  [1, 8, 5, 3, 2, 9, 7, 4, 6],
  [6, 9, 7, 4, 5, 1, 2, 8, 3],
  [9, 2, 8, 7, 3, 4, 1, 6, 5],
  [5, 6, 3, 9, 1, 2, 8, 7, 4],
  [7, 1, 4, 5, 6, 8, 3, 2, 9],
];

const obviousSingleNoteCell: NoteCellWithLocation = {
  r: 1,
  c: 0,
  type: "note",
  notes: [2],
};

const obviousSingleValueCell: ValueCellWithLocation = {
  r: 1,
  c: 0,
  type: "value",
  value: 2,
};

function numbersToPuzzleWithTargetNotes(
  numbers: SudokuValue[][],
  target: NoteCellWithLocation
): CellProps[][] {
  return numbers.map((row, r) =>
    row.map((value, c): CellProps => {
      if (r === target.r && c === target.c) {
        return { type: "note", notes: [...target.notes] };
      }

      if (value === 0) {
        return { type: "note", notes: [] };
      }

      return { type: "given", value };
    })
  );
}

export const obviousSinglePuzzle: CellProps[][] =
  numbersToPuzzleWithTargetNotes(
    SOURCE_PUZZLE_NUMBERS,
    obviousSingleNoteCell
  );

export const obviousSingleHint: ObviousSingleHint = {
  strategy: "OBVIOUS_SINGLE",
  stages: [
    {
      highlightCells: [
        { location: obviousSingleNoteCell, highlightType: "focus" },
      ],
      highlightNotes: [
        {
          location: obviousSingleNoteCell,
          value: 2,
          highlightType: "basis",
        },
      ],
      text: "Row 2, column 1 has only one note remaining: 2.",
    },
    {
      placeValues: [obviousSingleValueCell],
      highlightCells: [
        { location: obviousSingleValueCell, highlightType: "placement" },
      ],
      highlightValues: [
        { location: obviousSingleValueCell, highlightType: "placement" },
      ],
      text: "Place 2 in row 2, column 1.",
    },
  ],
};

export const obviousSingleDemoCases: ObviousSingleDemoCase[] = [
  {
    id: "single-obvious-single",
    label: "Obvious single",
    puzzle: obviousSinglePuzzle,
    hint: obviousSingleHint,
  },
];

export function getObviousSingleDemoCase(
  id: ObviousSingleDemoCase["id"]
): ObviousSingleDemoCase {
  const demoCase = obviousSingleDemoCases.find(
    (candidate) => candidate.id === id
  );

  if (!demoCase) {
    throw new Error(`Unknown obvious single demo case: ${id}`);
  }

  return demoCase;
}
