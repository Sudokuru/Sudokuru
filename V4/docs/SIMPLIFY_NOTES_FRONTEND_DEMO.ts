/**
 * Self-contained simplify-notes fixture for quick Frontend testing.
 *
 * Copy this file into the Frontend, stub getHint() with the exported hint,
 * and load simplifyNotesPuzzle.
 */

type CellLocation = { r: number; c: number };
type NoteCellWithLocation = CellLocation & {
  type: "note";
  notes: number[];
};
type ValueCellWithLocation = CellLocation & {
  type: "given" | "value";
  value: number;
};
type CellProps =
  | Omit<NoteCellWithLocation, keyof CellLocation>
  | Omit<ValueCellWithLocation, keyof CellLocation>;
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
type SimplifyNotesHint = {
  strategy: "SIMPLIFY_NOTES";
  stages: HintStage[];
};

const SOURCE_NUMBERS = [
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

const target: NoteCellWithLocation = {
  r: 1,
  c: 2,
  type: "note",
  notes: [2, 4, 8],
};

const conflictingValue: ValueCellWithLocation = {
  r: 1,
  c: 0,
  type: "given",
  value: 2,
};

const removal: NoteCellWithLocation = {
  r: 1,
  c: 2,
  type: "note",
  notes: [2],
};

const rowFocus: CellLocation[] = [
  { r: 1, c: 1 },
  { r: 1, c: 3 },
  { r: 1, c: 4 },
  { r: 1, c: 5 },
  { r: 1, c: 6 },
  { r: 1, c: 7 },
  { r: 1, c: 8 },
];

export const simplifyNotesPuzzle: CellProps[][] = SOURCE_NUMBERS.map(
  (row, r) =>
    row.map((value, c): CellProps => {
      if (r === target.r && c === target.c) {
        return { type: "note", notes: [...target.notes] };
      }
      return value === 0
        ? { type: "note", notes: [] }
        : { type: "given", value };
    })
);

export const simplifyNotesHint: SimplifyNotesHint = {
  strategy: "SIMPLIFY_NOTES",
  stages: [
    {
      text: "Simplify notes removes candidates that conflict with a value already placed in the same row, column, or box.",
    },
    {
      removeNotes: [removal],
      highlightCells: [
        ...rowFocus.map((location) => ({
          location,
          highlightType: "focus" as const,
        })),
        { location: conflictingValue, highlightType: "basis" },
        { location: target, highlightType: "focus" },
      ],
      highlightNotes: [
        { location: target, value: 2, highlightType: "removal" },
      ],
      text: "Remove note 2 from row 2, column 3 because 2 is already in row 2.",
    },
  ],
};

export const simplifyNotesDemoCase = {
  id: "simplify-notes",
  label: "Simplify notes in a row",
  puzzle: simplifyNotesPuzzle,
  hint: simplifyNotesHint,
};
