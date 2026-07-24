/**
 * Self-contained obvious-single hint demo fixture for quick Frontend testing.
 *
 * This file intentionally imports nothing. Copy/paste it into a Frontend repo,
 * stub getHint() to return the exported hint, and load the puzzle state below.
 */

type SudokuNumber = number;

type CellLocation = {
  r: number;
  c: number;
};

type CellWithValue = {
  type: "given" | "value";
  value: SudokuNumber;
};

type CellWithNotes = {
  type: "note";
  notes: SudokuNumber[];
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
  value: SudokuNumber;
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
  id:
    | "single-obvious-single"
    | "obvious-single-with-note-simplification";
  label: string;
  puzzle: CellProps[][];
  hint: ObviousSingleHint;
};

const PLACEMENT_ONLY_SOURCE_PUZZLE_NUMBERS: SudokuNumber[][] = [
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

const SIMPLIFYING_SOURCE_PUZZLE_NUMBERS: SudokuNumber[][] = [
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

const simplifyingObviousSingleNoteCell: NoteCellWithLocation = {
  r: 5,
  c: 1,
  type: "note",
  notes: [8],
};

const simplifyingObviousSingleValueCell: ValueCellWithLocation = {
  r: 5,
  c: 1,
  type: "value",
  value: 8,
};

const simplifyingRowRemovalNotes: NoteCellWithLocation[] = [
  { r: 5, c: 0, type: "note", notes: [8] },
  { r: 5, c: 6, type: "note", notes: [8] },
  { r: 5, c: 8, type: "note", notes: [8] },
];

const simplifyingColumnRemovalNotes: NoteCellWithLocation[] = [
  { r: 1, c: 1, type: "note", notes: [8] },
  { r: 7, c: 1, type: "note", notes: [8] },
  { r: 8, c: 1, type: "note", notes: [8] },
];

const simplifyingBoxRemovalNotes: NoteCellWithLocation[] = [
  { r: 4, c: 2, type: "note", notes: [8] },
];

type ObviousSingleGroup = "row" | "column" | "box";

function getObviousSingleGroupCells(
  target: CellLocation,
  group: ObviousSingleGroup
): CellLocation[] {
  if (group === "row") {
    return Array.from({ length: 9 }, (_, c) => ({ r: target.r, c }));
  }

  if (group === "column") {
    return Array.from({ length: 9 }, (_, r) => ({ r, c: target.c }));
  }

  const boxTop = Math.floor(target.r / 3) * 3;
  const boxLeft = Math.floor(target.c / 3) * 3;

  return Array.from({ length: 9 }, (_, index) => ({
    r: boxTop + Math.floor(index / 3),
    c: boxLeft + (index % 3),
  }));
}

function getObviousSingleGroupHighlights(
  target: CellLocation,
  group: ObviousSingleGroup
): HighlightedCell[] {
  return [
    ...getObviousSingleGroupCells(target, group)
      .filter((location) =>
        location.r !== target.r || location.c !== target.c
      )
      .map((location) => ({
        location,
        highlightType: "focus" as const,
      })),
    { location: target, highlightType: "basis" },
  ];
}

function getCandidateNotes(
  numbers: SudokuNumber[][],
  targetRow: number,
  targetColumn: number
): SudokuNumber[] {
  const usedValues = new Set<SudokuNumber>();

  numbers[targetRow].forEach((value) => usedValues.add(value));
  numbers.forEach((row) => usedValues.add(row[targetColumn]));

  const boxTop = Math.floor(targetRow / 3) * 3;
  const boxLeft = Math.floor(targetColumn / 3) * 3;

  for (let r = boxTop; r < boxTop + 3; r += 1) {
    for (let c = boxLeft; c < boxLeft + 3; c += 1) {
      usedValues.add(numbers[r][c]);
    }
  }

  return Array.from({ length: 9 }, (_, index) => index + 1).filter(
    (value) => !usedValues.has(value)
  );
}

function numbersToPuzzleWithCandidateNotes(
  numbers: SudokuNumber[][]
): CellProps[][] {
  return numbers.map((row, r) =>
    row.map((value, c): CellProps => {
      if (value === 0) {
        return {
          type: "note",
          notes: getCandidateNotes(numbers, r, c),
        };
      }

      return { type: "given", value };
    })
  );
}

export const obviousSinglePuzzle: CellProps[][] =
  numbersToPuzzleWithCandidateNotes(
    PLACEMENT_ONLY_SOURCE_PUZZLE_NUMBERS
  );

export const simplifyingObviousSinglePuzzle: CellProps[][] =
  numbersToPuzzleWithCandidateNotes(
    SIMPLIFYING_SOURCE_PUZZLE_NUMBERS
  );

export const obviousSingleHint: ObviousSingleHint = {
  strategy: "OBVIOUS_SINGLE",
  stages: [
    {
      text: "An obvious single is a cell with only one note remaining.",
    },
    {
      highlightCells: [
        { location: obviousSingleNoteCell, highlightType: "focus" },
      ],
      text: "Row 2, column 1 has only one note remaining: 2.",
    },
    {
      placeValues: [obviousSingleValueCell],
      highlightCells: [
        { location: obviousSingleValueCell, highlightType: "placement" },
      ],
      text: "Place 2 in row 2, column 1.",
    },
  ],
};

export const simplifyingObviousSingleHint: ObviousSingleHint = {
  strategy: "OBVIOUS_SINGLE",
  stages: [
    {
      text: "An obvious single is a cell with only one note remaining.",
    },
    {
      highlightCells: [
        {
          location: simplifyingObviousSingleNoteCell,
          highlightType: "focus",
        },
      ],
      text: "Row 6, column 2 has only one note remaining: 8.",
    },
    {
      placeValues: [simplifyingObviousSingleValueCell],
      highlightCells: [
        {
          location: simplifyingObviousSingleValueCell,
          highlightType: "placement",
        },
      ],
      text: "Place 8 in row 6, column 2.",
    },
    {
      removeNotes: simplifyingRowRemovalNotes,
      highlightCells: getObviousSingleGroupHighlights(
        simplifyingObviousSingleValueCell,
        "row"
      ),
      highlightNotes: simplifyingRowRemovalNotes.map(({ r, c }) => ({
        location: { r, c },
        value: 8,
        highlightType: "removal" as const,
      })),
      text: "Remove note 8 from the other cells in row 6.",
    },
    {
      removeNotes: simplifyingColumnRemovalNotes,
      highlightCells: getObviousSingleGroupHighlights(
        simplifyingObviousSingleValueCell,
        "column"
      ),
      highlightNotes: simplifyingColumnRemovalNotes.map(({ r, c }) => ({
        location: { r, c },
        value: 8,
        highlightType: "removal" as const,
      })),
      text: "Remove note 8 from the other cells in column 2.",
    },
    {
      removeNotes: simplifyingBoxRemovalNotes,
      highlightCells: getObviousSingleGroupHighlights(
        simplifyingObviousSingleValueCell,
        "box"
      ),
      highlightNotes: simplifyingBoxRemovalNotes.map(({ r, c }) => ({
        location: { r, c },
        value: 8,
        highlightType: "removal" as const,
      })),
      text: "Remove note 8 from the other cells in the same box.",
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
  {
    id: "obvious-single-with-note-simplification",
    label: "Obvious single with note simplification",
    puzzle: simplifyingObviousSinglePuzzle,
    hint: simplifyingObviousSingleHint,
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
