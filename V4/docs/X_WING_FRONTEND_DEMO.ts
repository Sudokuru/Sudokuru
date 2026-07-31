/**
 * Self-contained X-Wing fixture for quick Frontend testing.
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
type XWingHint = { strategy: "X_WING"; stages: HintStage[] };

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

const basis: NoteCellWithLocation[] = [
  { r: 1, c: 1, type: "note", notes: [2, 7] },
  { r: 1, c: 6, type: "note", notes: [4, 7, 9] },
  { r: 5, c: 1, type: "note", notes: [1, 7, 8] },
  { r: 5, c: 6, type: "note", notes: [3, 7] },
];
const targets: NoteCellWithLocation[] = [
  { r: 0, c: 1, type: "note", notes: [5, 7] },
  { r: 2, c: 6, type: "note", notes: [1, 7] },
  { r: 3, c: 1, type: "note", notes: [3, 7, 9] },
  { r: 8, c: 6, type: "note", notes: [2, 6, 7] },
];
const removals: NoteCellWithLocation[] = targets.map(({ r, c }) => ({
  r,
  c,
  type: "note",
  notes: [7],
}));

export const xWingPuzzle = createPreparedPuzzle([...basis, ...targets]);

export const xWingHint: XWingHint = {
  strategy: "X_WING",
  stages: [
    {
      text: "An X-Wing uses two rows and two columns where one note can occupy only the four corner cells.",
    },
    {
      highlightCells: basis.map((location) => ({
        location,
        highlightType: "basis",
      })),
      highlightNotes: basis.map((location) => ({
        location,
        value: 7,
        highlightType: "basis",
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
        highlightType: "removal",
      })),
      text: "Remove note 7 from the other cells in columns 2 and 7.",
    },
  ],
};

export const xWingDemoCase = {
  id: "x-wing",
  label: "Row-based X-Wing",
  puzzle: xWingPuzzle,
  hint: xWingHint,
};
