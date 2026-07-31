/**
 * Self-contained pointing pair and triplet fixtures for quick Frontend
 * testing.
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
type PointingSetHint = {
  strategy: "POINTING_PAIR" | "POINTING_TRIPLET";
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

const pairBasis: NoteCellWithLocation[] = [
  { r: 1, c: 0, type: "note", notes: [2, 7, 9] },
  { r: 1, c: 2, type: "note", notes: [4, 7] },
];
const pairTargets: NoteCellWithLocation[] = [
  { r: 1, c: 4, type: "note", notes: [1, 7] },
  { r: 1, c: 7, type: "note", notes: [3, 7, 8] },
];
const pairRemovals: NoteCellWithLocation[] = [
  { r: 1, c: 4, type: "note", notes: [7] },
  { r: 1, c: 7, type: "note", notes: [7] },
];
const pairOtherBoxCells: NoteCellWithLocation[] = [
  { r: 0, c: 0, type: "note", notes: [1, 2] },
  { r: 0, c: 1, type: "note", notes: [3, 4] },
  { r: 0, c: 2, type: "note", notes: [5, 6] },
  { r: 1, c: 1, type: "note", notes: [1, 5] },
  { r: 2, c: 0, type: "note", notes: [2, 6] },
  { r: 2, c: 1, type: "note", notes: [3, 8] },
  { r: 2, c: 2, type: "note", notes: [4, 9] },
];

export const pointingPairPuzzle = createPreparedPuzzle([
  ...pairBasis,
  ...pairTargets,
  ...pairOtherBoxCells,
]);
export const pointingPairHint: PointingSetHint = {
  strategy: "POINTING_PAIR",
  stages: [
    {
      text: "A pointing pair is two cells in one box that contain every occurrence of a note in that box and share a row or column.",
    },
    {
      highlightCells: pairBasis.map((location) => ({
        location,
        highlightType: "basis",
      })),
      highlightNotes: pairBasis.map((location) => ({
        location,
        value: 7,
        highlightType: "basis",
      })),
      text: "In the top-left box, note 7 appears only in row 2, columns 1 and 3.",
    },
    {
      removeNotes: pairRemovals,
      highlightCells: [
        ...pairBasis.map((location) => ({
          location,
          highlightType: "basis" as const,
        })),
        ...pairRemovals.map((location) => ({
          location,
          highlightType: "focus" as const,
        })),
      ],
      highlightNotes: pairRemovals.map((location) => ({
        location,
        value: 7,
        highlightType: "removal",
      })),
      text: "Remove note 7 from the rest of row 2 outside the top-left box.",
    },
  ],
};

const tripletBasis: NoteCellWithLocation[] = [
  { r: 3, c: 1, type: "note", notes: [2, 5] },
  { r: 4, c: 1, type: "note", notes: [1, 5, 8] },
  { r: 5, c: 1, type: "note", notes: [3, 5, 9] },
];
const tripletTargets: NoteCellWithLocation[] = [
  { r: 0, c: 1, type: "note", notes: [4, 5] },
  { r: 7, c: 1, type: "note", notes: [2, 5, 6] },
];
const tripletRemovals: NoteCellWithLocation[] = [
  { r: 0, c: 1, type: "note", notes: [5] },
  { r: 7, c: 1, type: "note", notes: [5] },
];
const tripletOtherBoxCells: NoteCellWithLocation[] = [
  { r: 3, c: 0, type: "note", notes: [1, 2] },
  { r: 3, c: 2, type: "note", notes: [3, 4] },
  { r: 4, c: 0, type: "note", notes: [6, 7] },
  { r: 4, c: 2, type: "note", notes: [2, 8] },
  { r: 5, c: 0, type: "note", notes: [1, 9] },
  { r: 5, c: 2, type: "note", notes: [4, 6] },
];

export const pointingTripletPuzzle = createPreparedPuzzle([
  ...tripletBasis,
  ...tripletTargets,
  ...tripletOtherBoxCells,
]);
export const pointingTripletHint: PointingSetHint = {
  strategy: "POINTING_TRIPLET",
  stages: [
    {
      text: "A pointing triplet is three cells in one box that contain every occurrence of a note in that box and share a row or column.",
    },
    {
      highlightCells: tripletBasis.map((location) => ({
        location,
        highlightType: "basis",
      })),
      highlightNotes: tripletBasis.map((location) => ({
        location,
        value: 5,
        highlightType: "basis",
      })),
      text: "In the middle-left box, note 5 appears only in column 2, rows 4, 5, and 6.",
    },
    {
      removeNotes: tripletRemovals,
      highlightCells: [
        ...tripletBasis.map((location) => ({
          location,
          highlightType: "basis" as const,
        })),
        ...tripletRemovals.map((location) => ({
          location,
          highlightType: "focus" as const,
        })),
      ],
      highlightNotes: tripletRemovals.map((location) => ({
        location,
        value: 5,
        highlightType: "removal",
      })),
      text: "Remove note 5 from the rest of column 2 outside the middle-left box.",
    },
  ],
};

export const pointingSetDemoCases = [
  {
    id: "pointing-pair",
    label: "Pointing pair in a row",
    puzzle: pointingPairPuzzle,
    hint: pointingPairHint,
  },
  {
    id: "pointing-triplet",
    label: "Pointing triplet in a column",
    puzzle: pointingTripletPuzzle,
    hint: pointingTripletHint,
  },
];
