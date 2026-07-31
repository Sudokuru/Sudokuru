/**
 * Self-contained box-line-reduction fixture for quick Frontend testing.
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
type BoxLineReductionHint = {
  strategy: "BOX_LINE_REDUCTION";
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

const basis: NoteCellWithLocation[] = [
  { r: 2, c: 3, type: "note", notes: [4, 6] },
  { r: 2, c: 5, type: "note", notes: [1, 6, 7] },
];
const targets: NoteCellWithLocation[] = [
  { r: 0, c: 4, type: "note", notes: [2, 6, 8] },
  { r: 1, c: 3, type: "note", notes: [1, 6, 9] },
];
const removals: NoteCellWithLocation[] = [
  { r: 0, c: 4, type: "note", notes: [6] },
  { r: 1, c: 3, type: "note", notes: [6] },
];
const otherSourceRowCells: NoteCellWithLocation[] = [
  { r: 2, c: 0, type: "note", notes: [1, 2] },
  { r: 2, c: 1, type: "note", notes: [3, 4] },
  { r: 2, c: 2, type: "note", notes: [5, 7] },
  { r: 2, c: 4, type: "note", notes: [2, 8] },
  { r: 2, c: 6, type: "note", notes: [1, 9] },
  { r: 2, c: 7, type: "note", notes: [3, 5] },
  { r: 2, c: 8, type: "note", notes: [7, 8] },
];

export const boxLineReductionPuzzle = createPreparedPuzzle([
  ...basis,
  ...targets,
  ...otherSourceRowCells,
]);

export const boxLineReductionHint: BoxLineReductionHint = {
  strategy: "BOX_LINE_REDUCTION",
  stages: [
    {
      text: "Box-line reduction applies when every occurrence of a note in one row or column lies inside the same box.",
    },
    {
      highlightCells: basis.map((location) => ({
        location,
        highlightType: "basis",
      })),
      highlightNotes: basis.map((location) => ({
        location,
        value: 6,
        highlightType: "basis",
      })),
      text: "In row 3, note 6 appears only in columns 4 and 6, both inside the top-middle box.",
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
        value: 6,
        highlightType: "removal",
      })),
      text: "Remove note 6 from the other cells in the top-middle box.",
    },
  ],
};

export const boxLineReductionDemoCase = {
  id: "box-line-reduction",
  label: "Box-line reduction from a row",
  puzzle: boxLineReductionPuzzle,
  hint: boxLineReductionHint,
};
