/**
 * Self-contained obvious pair, triplet, and quadruplet fixtures for quick
 * Frontend testing.
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
type ObviousSetHint = {
  strategy:
    | "OBVIOUS_PAIR"
    | "OBVIOUS_TRIPLET"
    | "OBVIOUS_QUADRUPLET";
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
  { r: 0, c: 0, type: "note", notes: [2, 7] },
  { r: 0, c: 3, type: "note", notes: [2, 7] },
];
const pairTargets: NoteCellWithLocation[] = [
  { r: 0, c: 5, type: "note", notes: [2, 4, 7] },
  { r: 0, c: 8, type: "note", notes: [1, 7] },
];
const pairRemovals: NoteCellWithLocation[] = [
  { r: 0, c: 5, type: "note", notes: [2, 7] },
  { r: 0, c: 8, type: "note", notes: [7] },
];

export const obviousPairPuzzle = createPreparedPuzzle([
  ...pairBasis,
  ...pairTargets,
]);
export const obviousPairHint: ObviousSetHint = {
  strategy: "OBVIOUS_PAIR",
  stages: [
    {
      text: "An obvious pair is two cells in one row, column, or box whose combined notes are exactly two numbers.",
    },
    {
      highlightCells: pairBasis.map((location) => ({
        location,
        highlightType: "basis",
      })),
      highlightNotes: pairBasis.flatMap((location) =>
        [2, 7].map((value) => ({
          location,
          value,
          highlightType: "basis",
        }))
      ),
      text: "In row 1, the cells in columns 1 and 4 are limited to 2 and 7.",
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
      highlightNotes: [
        { location: pairRemovals[0], value: 2, highlightType: "removal" },
        { location: pairRemovals[0], value: 7, highlightType: "removal" },
        { location: pairRemovals[1], value: 7, highlightType: "removal" },
      ],
      text: "Remove 2 and 7 from the other cells in row 1.",
    },
  ],
};

const tripletBasis: NoteCellWithLocation[] = [
  { r: 2, c: 0, type: "note", notes: [1, 4] },
  { r: 2, c: 3, type: "note", notes: [1, 6] },
  { r: 2, c: 7, type: "note", notes: [4, 6] },
];
const tripletTargets: NoteCellWithLocation[] = [
  { r: 2, c: 4, type: "note", notes: [1, 2, 6] },
  { r: 2, c: 8, type: "note", notes: [3, 4] },
];
const tripletRemovals: NoteCellWithLocation[] = [
  { r: 2, c: 4, type: "note", notes: [1, 6] },
  { r: 2, c: 8, type: "note", notes: [4] },
];

export const obviousTripletPuzzle = createPreparedPuzzle([
  ...tripletBasis,
  ...tripletTargets,
]);
export const obviousTripletHint: ObviousSetHint = {
  strategy: "OBVIOUS_TRIPLET",
  stages: [
    {
      text: "An obvious triplet is three cells in one row, column, or box whose combined notes are exactly three numbers.",
    },
    {
      highlightCells: tripletBasis.map((location) => ({
        location,
        highlightType: "basis",
      })),
      highlightNotes: tripletBasis.flatMap(({ r, c, notes }) =>
        notes.map((value) => ({
          location: { r, c },
          value,
          highlightType: "basis",
        }))
      ),
      text: "In row 3, the cells in columns 1, 4, and 8 are limited to 1, 4, and 6.",
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
      highlightNotes: [
        {
          location: tripletRemovals[0],
          value: 1,
          highlightType: "removal",
        },
        {
          location: tripletRemovals[0],
          value: 6,
          highlightType: "removal",
        },
        {
          location: tripletRemovals[1],
          value: 4,
          highlightType: "removal",
        },
      ],
      text: "Remove 1, 4, and 6 from the other cells in row 3.",
    },
  ],
};

const quadrupletBasis: NoteCellWithLocation[] = [
  { r: 0, c: 0, type: "note", notes: [1, 2] },
  { r: 0, c: 1, type: "note", notes: [2, 3] },
  { r: 1, c: 0, type: "note", notes: [1, 4] },
  { r: 1, c: 1, type: "note", notes: [3, 4] },
];
const quadrupletTargets: NoteCellWithLocation[] = [
  { r: 2, c: 0, type: "note", notes: [1, 5] },
  { r: 2, c: 1, type: "note", notes: [2, 6] },
  { r: 2, c: 2, type: "note", notes: [3, 4, 7] },
];
const quadrupletRemovals: NoteCellWithLocation[] = [
  { r: 2, c: 0, type: "note", notes: [1] },
  { r: 2, c: 1, type: "note", notes: [2] },
  { r: 2, c: 2, type: "note", notes: [3, 4] },
];

export const obviousQuadrupletPuzzle = createPreparedPuzzle([
  ...quadrupletBasis,
  ...quadrupletTargets,
]);
export const obviousQuadrupletHint: ObviousSetHint = {
  strategy: "OBVIOUS_QUADRUPLET",
  stages: [
    {
      text: "An obvious quadruplet is four cells in one row, column, or box whose combined notes are exactly four numbers.",
    },
    {
      highlightCells: quadrupletBasis.map((location) => ({
        location,
        highlightType: "basis",
      })),
      highlightNotes: quadrupletBasis.flatMap(({ r, c, notes }) =>
        notes.map((value) => ({
          location: { r, c },
          value,
          highlightType: "basis",
        }))
      ),
      text: "In the top-left box, four cells are limited to 1, 2, 3, and 4.",
    },
    {
      removeNotes: quadrupletRemovals,
      highlightCells: [
        ...quadrupletBasis.map((location) => ({
          location,
          highlightType: "basis" as const,
        })),
        ...quadrupletRemovals.map((location) => ({
          location,
          highlightType: "focus" as const,
        })),
      ],
      highlightNotes: quadrupletRemovals.flatMap(({ r, c, notes }) =>
        notes.map((value) => ({
          location: { r, c },
          value,
          highlightType: "removal",
        }))
      ),
      text: "Remove 1, 2, 3, and 4 from the other cells in the top-left box.",
    },
  ],
};

export const obviousSetDemoCases = [
  {
    id: "obvious-pair",
    label: "Obvious pair in a row",
    puzzle: obviousPairPuzzle,
    hint: obviousPairHint,
  },
  {
    id: "obvious-triplet",
    label: "Obvious triplet in a row",
    puzzle: obviousTripletPuzzle,
    hint: obviousTripletHint,
  },
  {
    id: "obvious-quadruplet",
    label: "Obvious quadruplet in a box",
    puzzle: obviousQuadrupletPuzzle,
    hint: obviousQuadrupletHint,
  },
];
