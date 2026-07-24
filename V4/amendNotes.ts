import {
  getNoteCell,
  getValueCell,
  locationsEqual,
} from "./cellLocations";
import { formatNumberAsList } from "./format";
import { notesMatch } from "./notes";
import { getUnitDescription, getUnitLocations } from "./units";
import { UNIT_PRECEDENCE } from "./Types";
import type {
  CellLocation,
  CellProps,
  Hint,
  HintStage,
  NoteCellWithLocation,
  SudokuNumber,
  Unit,
  ValueCellWithLocation,
} from "./Types";

const INTRODUCTION_TEXT =
  "Amend notes makes a cell contain every note that does not conflict with its row, column, or box.";

type RemovalStageData = {
  stages: HintStage[];
  removedValues: Set<SudokuNumber>;
};

/**
 * Returns placed cells whose values have not already been removed by an earlier unit.
 */
function getNewBasisCells(
  puzzle: readonly (readonly CellProps[])[],
  unitLocations: readonly CellLocation[],
  removedValues: ReadonlySet<SudokuNumber>
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
 * Builds one exact removal stage from value-ordered basis cells.
 */
function getRemovalStage(
  target: NoteCellWithLocation,
  unit: Unit,
  unitLocations: readonly CellLocation[],
  basisCells: readonly ValueCellWithLocation[]
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
  const formattedNotes = formatNumberAsList(removedNotes);
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
  puzzle: readonly (readonly CellProps[])[],
  target: NoteCellWithLocation,
  size: number
): RemovalStageData {
  const stages: HintStage[] = [];
  const removedValues = new Set<SudokuNumber>();

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
  puzzle: readonly (readonly CellProps[])[],
  solution: readonly (readonly SudokuNumber[])[],
  locationToCheck: CellLocation
): Hint | null {
  const target = getNoteCell(puzzle, locationToCheck);

  if (!target) {
    return null;
  }

  const size = puzzle.length;
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
