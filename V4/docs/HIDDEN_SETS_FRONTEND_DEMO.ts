/**
 * Self-contained hidden single, pair, triplet, and quadruplet fixtures for
 * quick Frontend testing.
 */

type CellLocation = { r: number; c: number };
type NoteCellWithLocation = CellLocation & {
  type: "note";
  notes: number[];
};
type CellProps = { type: "note"; notes: number[] };
type HighlightType = "removal" | "placement" | "focus" | "basis";
type HintStage = {
  removeNotes?: NoteCellWithLocation[];
  highlightCells?: Array<{
    location: CellLocation;
    highlightType: HighlightType;
  }>;
  highlightNotes?: Array<{
    location: CellLocation;
    value: number;
    highlightType: HighlightType;
  }>;
  text?: string;
};
type HiddenSetHint = {
  strategy:
    | "HIDDEN_SINGLE"
    | "HIDDEN_PAIR"
    | "HIDDEN_TRIPLET"
    | "HIDDEN_QUADRUPLET";
  stages: HintStage[];
};

function createPreparedPuzzle(
  cells: readonly NoteCellWithLocation[]
): CellProps[][] {
  const byLocation = new Map(
    cells.map((cell) => [`${cell.r},${cell.c}`, cell] as const)
  );

  return Array.from({ length: 9 }, (_, r) =>
    Array.from({ length: 9 }, (_, c): CellProps => {
      const cell = byLocation.get(`${r},${c}`);
      return { type: "note", notes: [...(cell?.notes ?? [])] };
    })
  );
}

const singleTarget: NoteCellWithLocation = {
  r: 4,
  c: 6,
  type: "note",
  notes: [2, 7, 9],
};
const singleRemoval: NoteCellWithLocation = {
  r: 4,
  c: 6,
  type: "note",
  notes: [2, 9],
};
const otherSingleRowCells: NoteCellWithLocation[] = [
  { r: 4, c: 0, type: "note", notes: [1, 2] },
  { r: 4, c: 1, type: "note", notes: [3, 4] },
  { r: 4, c: 2, type: "note", notes: [5, 6] },
  { r: 4, c: 3, type: "note", notes: [1, 8] },
  { r: 4, c: 4, type: "note", notes: [2, 5] },
  { r: 4, c: 5, type: "note", notes: [3, 9] },
  { r: 4, c: 7, type: "note", notes: [4, 6] },
  { r: 4, c: 8, type: "note", notes: [1, 8] },
];
export const hiddenSinglePuzzle = createPreparedPuzzle([
  singleTarget,
  ...otherSingleRowCells,
]);
export const hiddenSingleHint: HiddenSetHint = {
  strategy: "HIDDEN_SINGLE",
  stages: [
    {
      text: "A hidden single is a note that appears in only one cell of a row, column, or box.",
    },
    {
      highlightCells: [
        ...otherSingleRowCells.map(({ r, c }) => ({
          location: { r, c },
          highlightType: "focus" as const,
        })),
        { location: singleTarget, highlightType: "basis" },
      ],
      highlightNotes: [
        { location: singleTarget, value: 7, highlightType: "basis" },
      ],
      text: "In row 5, note 7 appears only in column 7.",
    },
    {
      removeNotes: [singleRemoval],
      highlightCells: [
        { location: singleTarget, highlightType: "basis" },
      ],
      highlightNotes: [
        { location: singleTarget, value: 2, highlightType: "removal" },
        { location: singleTarget, value: 9, highlightType: "removal" },
        { location: singleTarget, value: 7, highlightType: "basis" },
      ],
      text: "Remove the other notes from row 5, column 7, leaving only 7.",
    },
  ],
};

const pairBasis: NoteCellWithLocation[] = [
  { r: 3, c: 1, type: "note", notes: [1, 4, 8] },
  { r: 3, c: 7, type: "note", notes: [4, 8, 9] },
];
const pairOtherCells: NoteCellWithLocation[] = [
  { r: 3, c: 0, type: "note", notes: [1, 2] },
  { r: 3, c: 2, type: "note", notes: [3, 5] },
  { r: 3, c: 3, type: "note", notes: [2, 6] },
  { r: 3, c: 4, type: "note", notes: [5, 7] },
  { r: 3, c: 5, type: "note", notes: [1, 9] },
  { r: 3, c: 6, type: "note", notes: [2, 3] },
  { r: 3, c: 8, type: "note", notes: [6, 7] },
];
const pairRemovals: NoteCellWithLocation[] = [
  { r: 3, c: 1, type: "note", notes: [1] },
  { r: 3, c: 7, type: "note", notes: [9] },
];
export const hiddenPairPuzzle = createPreparedPuzzle([
  ...pairBasis,
  ...pairOtherCells,
]);
export const hiddenPairHint: HiddenSetHint = {
  strategy: "HIDDEN_PAIR",
  stages: [
    {
      text: "A hidden pair is two notes that appear in only the same two cells of one row, column, or box.",
    },
    {
      highlightCells: pairBasis.map((location) => ({
        location,
        highlightType: "basis",
      })),
      highlightNotes: pairBasis.flatMap((location) =>
        [4, 8].map((value) => ({
          location,
          value,
          highlightType: "basis",
        }))
      ),
      text: "In row 4, notes 4 and 8 appear only in columns 2 and 8.",
    },
    {
      removeNotes: pairRemovals,
      highlightCells: pairBasis.map((location) => ({
        location,
        highlightType: "basis",
      })),
      highlightNotes: [
        { location: pairBasis[0], value: 1, highlightType: "removal" },
        { location: pairBasis[0], value: 4, highlightType: "basis" },
        { location: pairBasis[0], value: 8, highlightType: "basis" },
        { location: pairBasis[1], value: 4, highlightType: "basis" },
        { location: pairBasis[1], value: 8, highlightType: "basis" },
        { location: pairBasis[1], value: 9, highlightType: "removal" },
      ],
      text: "Keep 4 and 8 in those cells and remove their other notes.",
    },
  ],
};

const tripletBasis: NoteCellWithLocation[] = [
  { r: 0, c: 5, type: "note", notes: [1, 3, 7] },
  { r: 4, c: 5, type: "note", notes: [2, 3, 8] },
  { r: 8, c: 5, type: "note", notes: [1, 2, 3, 9] },
];
const tripletOtherCells: NoteCellWithLocation[] = [
  { r: 1, c: 5, type: "note", notes: [4, 5] },
  { r: 2, c: 5, type: "note", notes: [6, 7] },
  { r: 3, c: 5, type: "note", notes: [4, 8] },
  { r: 5, c: 5, type: "note", notes: [5, 9] },
  { r: 6, c: 5, type: "note", notes: [4, 6] },
  { r: 7, c: 5, type: "note", notes: [7, 8] },
];
const tripletRemovals: NoteCellWithLocation[] = [
  { r: 0, c: 5, type: "note", notes: [7] },
  { r: 4, c: 5, type: "note", notes: [8] },
  { r: 8, c: 5, type: "note", notes: [9] },
];
export const hiddenTripletPuzzle = createPreparedPuzzle([
  ...tripletBasis,
  ...tripletOtherCells,
]);
export const hiddenTripletHint: HiddenSetHint = {
  strategy: "HIDDEN_TRIPLET",
  stages: [
    {
      text: "A hidden triplet is three notes that appear only within the same three cells of one row, column, or box.",
    },
    {
      highlightCells: tripletBasis.map((location) => ({
        location,
        highlightType: "basis",
      })),
      highlightNotes: tripletBasis.flatMap(({ r, c, notes }) =>
        notes
          .filter((value) => [1, 2, 3].includes(value))
          .map((value) => ({
            location: { r, c },
            value,
            highlightType: "basis",
          }))
      ),
      text: "In column 6, notes 1, 2, and 3 appear only in rows 1, 5, and 9.",
    },
    {
      removeNotes: tripletRemovals,
      highlightCells: tripletBasis.map((location) => ({
        location,
        highlightType: "basis",
      })),
      highlightNotes: tripletRemovals.map(({ r, c, notes }) => ({
        location: { r, c },
        value: notes[0],
        highlightType: "removal",
      })),
      text: "Keep 1, 2, and 3 in those cells and remove their other notes.",
    },
  ],
};

const quadrupletBasis: NoteCellWithLocation[] = [
  { r: 6, c: 6, type: "note", notes: [1, 4, 5] },
  { r: 6, c: 8, type: "note", notes: [2, 5, 8] },
  { r: 8, c: 6, type: "note", notes: [1, 2, 6] },
  { r: 8, c: 8, type: "note", notes: [4, 6, 9] },
];
const quadrupletOtherCells: NoteCellWithLocation[] = [
  { r: 6, c: 7, type: "note", notes: [3, 7] },
  { r: 7, c: 6, type: "note", notes: [3, 5] },
  { r: 7, c: 7, type: "note", notes: [7, 8] },
  { r: 7, c: 8, type: "note", notes: [3, 9] },
  { r: 8, c: 7, type: "note", notes: [5, 7, 8] },
];
const quadrupletRemovals: NoteCellWithLocation[] = [
  { r: 6, c: 6, type: "note", notes: [5] },
  { r: 6, c: 8, type: "note", notes: [5, 8] },
  { r: 8, c: 8, type: "note", notes: [9] },
];
export const hiddenQuadrupletPuzzle = createPreparedPuzzle([
  ...quadrupletBasis,
  ...quadrupletOtherCells,
]);
export const hiddenQuadrupletHint: HiddenSetHint = {
  strategy: "HIDDEN_QUADRUPLET",
  stages: [
    {
      text: "A hidden quadruplet is four notes that appear only within the same four cells of one row, column, or box.",
    },
    {
      highlightCells: quadrupletBasis.map((location) => ({
        location,
        highlightType: "basis",
      })),
      highlightNotes: quadrupletBasis.flatMap(({ r, c, notes }) =>
        notes
          .filter((value) => [1, 2, 4, 6].includes(value))
          .map((value) => ({
            location: { r, c },
            value,
            highlightType: "basis",
          }))
      ),
      text: "In the bottom-right box, notes 1, 2, 4, and 6 appear only in four cells.",
    },
    {
      removeNotes: quadrupletRemovals,
      highlightCells: quadrupletBasis.map((location) => ({
        location,
        highlightType: "basis",
      })),
      highlightNotes: quadrupletRemovals.flatMap(({ r, c, notes }) =>
        notes.map((value) => ({
          location: { r, c },
          value,
          highlightType: "removal",
        }))
      ),
      text: "Keep 1, 2, 4, and 6 in those cells and remove their other notes.",
    },
  ],
};

export const hiddenSetDemoCases = [
  {
    id: "hidden-single",
    label: "Hidden single in a row",
    puzzle: hiddenSinglePuzzle,
    hint: hiddenSingleHint,
  },
  {
    id: "hidden-pair",
    label: "Hidden pair in a row",
    puzzle: hiddenPairPuzzle,
    hint: hiddenPairHint,
  },
  {
    id: "hidden-triplet",
    label: "Hidden triplet in a column",
    puzzle: hiddenTripletPuzzle,
    hint: hiddenTripletHint,
  },
  {
    id: "hidden-quadruplet",
    label: "Hidden quadruplet in a box",
    puzzle: hiddenQuadrupletPuzzle,
    hint: hiddenQuadrupletHint,
  },
];
