import {
  getNoteCell,
  getUnitLocations,
  getValueCell,
  locationsEqual,
} from "./cellLocations";
import { notesMatch } from "./notes";
import type {
  CellLocation,
  CellProps,
  Hint,
  HintStage,
  NoteCellWithLocation,
  SudokuValue,
  SupportedBoardSize,
  Unit,
  ValueCellWithLocation,
} from "./Types";

const INTRODUCTION_TEXT =
  "Amend notes makes a cell contain every note that does not conflict with its row, column, or box.";
const UNIT_PRECEDENCE: Unit[] = ["row", "column", "box"];

type RemovalStageData = {
  stages: HintStage[];
  removedValues: Set<SudokuValue>;
};

/**
 * Returns placed cells whose values have not already been removed by an earlier unit.
 */
function getNewBasisCells(
  puzzle: CellProps[][],
  unitLocations: CellLocation[],
  removedValues: Set<SudokuValue>
): ValueCellWithLocation[] {
  const basisCells: ValueCellWithLocation[] = [];

  for (const location of unitLocations) {
    const cell = getValueCell(puzzle, location);

    if (cell && !removedValues.has(cell.value)) {
      basisCells.push(cell);
    }
  }

  return basisCells.sort((first, second) => first.value - second.value);
}

/**
 * Formats a non-empty list of note values using the approved hint punctuation.
 */
function formatNoteValues(values: SudokuValue[]): string {
  if (values.length === 1) {
    return `${values[0]}`;
  }

  if (values.length === 2) {
    return `${values[0]} and ${values[1]}`;
  }

  return `${values.slice(0, -1).join(", ")}, and ${values.at(-1)}`;
}

/**
 * Returns the user-facing row, column, or box description for a removal stage.
 */
function getUnitDescription(target: CellLocation, unit: Unit): string {
  switch (unit) {
    case "row":
      return `row ${target.r + 1}`;
    case "column":
      return `column ${target.c + 1}`;
    case "box":
      return "the same box";
  }
}

/**
 * Builds one exact removal stage from value-ordered basis cells.
 */
function getRemovalStage(
  target: NoteCellWithLocation,
  unit: Unit,
  unitLocations: CellLocation[],
  basisCells: ValueCellWithLocation[]
): HintStage {
  const removedNotes = basisCells.map(({ value }) => value);
  const basisLocations = basisCells.map(({ r, c }) => ({ r, c }));
  const excludedFocusLocations = [target, ...basisLocations];
  const focusLocations = unitLocations.filter(
    (location) =>
      !excludedFocusLocations.some((excludedLocation) =>
        locationsEqual(location, excludedLocation)
      )
  );
  const isSingular = removedNotes.length === 1;
  const noteLabel = isSingular ? "note" : "notes";
  const conflictExplanation = isSingular
    ? "that number is"
    : "those numbers are";
  const formattedNotes = formatNoteValues(removedNotes);
  const unitLabel = getUnitDescription(target, unit);

  return {
    removeNotes: [{ ...target, notes: removedNotes }],
    highlightCells: [
      { location: target, highlightType: "focus" },
      ...focusLocations.map((location) => ({
        location,
        highlightType: "focus" as const,
      })),
      ...basisLocations.map((location) => ({
        location,
        highlightType: "basis" as const,
      })),
    ],
    highlightNotes: removedNotes.map((value) => ({
      location: target,
      value,
      highlightType: "removal" as const,
    })),
    text: `Remove ${noteLabel} ${formattedNotes} because ${conflictExplanation} already in ${unitLabel}.`,
  };
}

/**
 * Builds row, column, and box removal stages while tracking prior removals.
 */
function getRemovalStages(
  puzzle: CellProps[][],
  target: NoteCellWithLocation,
  size: SupportedBoardSize
): RemovalStageData {
  const stages: HintStage[] = [];
  const removedValues = new Set<SudokuValue>();

  for (const unit of UNIT_PRECEDENCE) {
    const unitLocations = getUnitLocations(target, unit, size);
    const basisCells = getNewBasisCells(
      puzzle,
      unitLocations,
      removedValues
    );

    if (basisCells.length === 0) {
      continue;
    }

    for (const { value } of basisCells) {
      removedValues.add(value);
    }

    stages.push(getRemovalStage(target, unit, unitLocations, basisCells));
  }

  return { stages, removedValues };
}

/**
 * Returns a staged hint that fills the targeted note cell with every allowed candidate.
 */
export function getAmendNotesHint(
  puzzle: CellProps[][],
  solution: SudokuValue[][],
  locationToCheck: CellLocation
): Hint | null {
  const target = getNoteCell(puzzle, locationToCheck);

  if (!target) {
    return null;
  }

  const size = puzzle.length as SupportedBoardSize;
  const allNotes = Array.from({ length: size }, (_, index) => index + 1);
  const { stages: removalStages, removedValues } = getRemovalStages(
    puzzle,
    target,
    size
  );
  const amendedNotes = allNotes.filter((note) => !removedValues.has(note));

  if (notesMatch(target.notes, amendedNotes)) {
    return null;
  }

  const allNotesCell: NoteCellWithLocation = {
    ...target,
    notes: allNotes,
  };
  const row = target.r + 1;
  const column = target.c + 1;

  return {
    strategy: "AMEND_NOTES",
    stages: [
      { text: INTRODUCTION_TEXT },
      {
        placeNotes: [allNotesCell],
        highlightCells: [{ location: target, highlightType: "focus" }],
        highlightNotes: allNotes.map((value) => ({
          location: target,
          value,
          highlightType: "placement" as const,
        })),
        text: `Add all notes not already present to the cell in row ${row}, column ${column}.`,
      },
      ...removalStages,
    ],
  };
}
