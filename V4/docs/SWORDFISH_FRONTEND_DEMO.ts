/**
 * Self-contained Swordfish fixture for quick Frontend testing.
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
type SwordfishHint = { strategy: "SWORDFISH"; stages: HintStage[] };

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
  { r: 0, c: 1, type: "note", notes: [2, 4] },
  { r: 0, c: 5, type: "note", notes: [4, 7] },
  { r: 3, c: 1, type: "note", notes: [1, 4, 8] },
  { r: 3, c: 7, type: "note", notes: [4, 9] },
  { r: 7, c: 5, type: "note", notes: [3, 4, 6] },
  { r: 7, c: 7, type: "note", notes: [4, 5] },
];
const targets: NoteCellWithLocation[] = [
  { r: 1, c: 1, type: "note", notes: [4, 5] },
  { r: 2, c: 5, type: "note", notes: [1, 4, 8] },
  { r: 8, c: 7, type: "note", notes: [2, 4, 9] },
];
const removals: NoteCellWithLocation[] = targets.map(({ r, c }) => ({
  r,
  c,
  type: "note",
  notes: [4],
}));

export const swordfishPuzzle = createPreparedPuzzle([
  ...basis,
  ...targets,
]);

export const swordfishHint: SwordfishHint = {
  strategy: "SWORDFISH",
  stages: [
    {
      text: "A Swordfish uses three rows and three columns that confine every occurrence of one note.",
    },
    {
      highlightCells: basis.map((location) => ({
        location,
        highlightType: "basis",
      })),
      highlightNotes: basis.map((location) => ({
        location,
        value: 4,
        highlightType: "basis",
      })),
      text: "In rows 1, 4, and 8, note 4 is confined to columns 2, 6, and 8, forming a Swordfish.",
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
        value: 4,
        highlightType: "removal",
      })),
      text: "Remove note 4 from the other cells in columns 2, 6, and 8.",
    },
  ],
};

export const swordfishDemoCase = {
  id: "swordfish",
  label: "Row-based Swordfish",
  puzzle: swordfishPuzzle,
  hint: swordfishHint,
};
