import { getNoteCell, locationsEqual } from "./cellLocations";
import { getUnitDescription, getUnitLocations } from "./units";
import { UNIT_PRECEDENCE } from "./Types";
import type {
  CellLocation,
  CellProps,
  HighlightedCell,
  HighlightedNote,
  Hint,
  HintStage,
  NoteCellWithLocation,
  SudokuNumber,
  Unit,
  ValueCellWithLocation,
} from "./Types";

const INTRODUCTION_TEXT =
  "An obvious single is a cell with only one note remaining.";

/**
 * Returns note-removal actions that were not already handled by an earlier unit.
 */
function getNewNoteRemovals(
  puzzle: readonly (readonly CellProps[])[],
  target: NoteCellWithLocation,
  value: SudokuNumber,
  unitLocations: readonly CellLocation[],
  removedLocations: readonly CellLocation[]
): NoteCellWithLocation[] {
  const noteRemovals: NoteCellWithLocation[] = [];

  for (const location of unitLocations) {
    const alreadyRemoved = removedLocations.some((removedLocation) =>
      locationsEqual(location, removedLocation)
    );

    if (locationsEqual(location, target) || alreadyRemoved) {
      continue;
    }

    const noteCell = getNoteCell(puzzle, location);

    if (!noteCell || !noteCell.notes.includes(value)) {
      continue;
    }

    noteRemovals.push({ ...noteCell, notes: [value] });
  }

  return noteRemovals;
}

/**
 * Builds one exact row, column, or box note-simplification stage.
 */
function getRemovalStage(
  targetValue: ValueCellWithLocation,
  unit: Unit,
  unitLocations: readonly CellLocation[],
  noteRemovals: readonly NoteCellWithLocation[]
): HintStage {
  const highlightCells: HighlightedCell[] = [];
  const highlightNotes: HighlightedNote[] = [];

  for (const location of unitLocations) {
    if (!locationsEqual(location, targetValue)) {
      highlightCells.push({ location, highlightType: "focus" });
    }
  }

  highlightCells.push({ location: targetValue, highlightType: "basis" });

  for (const { r, c } of noteRemovals) {
    highlightNotes.push({
      location: { r, c },
      value: targetValue.value,
      highlightType: "removal",
    });
  }

  return {
    removeNotes: [...noteRemovals],
    highlightCells,
    highlightNotes,
    text: `Remove note ${targetValue.value} from the other cells in ${getUnitDescription(
      targetValue,
      unit
    )}.`,
  };
}

/**
 * Builds deterministic row, column, and box simplification stages.
 */
function getRemovalStages(
  puzzle: readonly (readonly CellProps[])[],
  target: NoteCellWithLocation,
  targetValue: ValueCellWithLocation
): HintStage[] {
  const stages: HintStage[] = [];
  const removedLocations: CellLocation[] = [];
  const size = puzzle.length;

  for (const unit of UNIT_PRECEDENCE) {
    const unitLocations = getUnitLocations(target, unit, size);
    const noteRemovals = getNewNoteRemovals(
      puzzle,
      target,
      targetValue.value,
      unitLocations,
      removedLocations
    );

    if (noteRemovals.length === 0) {
      continue;
    }

    for (const { r, c } of noteRemovals) {
      removedLocations.push({ r, c });
    }

    stages.push(
      getRemovalStage(targetValue, unit, unitLocations, noteRemovals)
    );
  }

  return stages;
}

/**
 * Returns a staged hint when the targeted note cell has exactly one candidate remaining.
 */
export function getObviousSingleHint(
  puzzle: readonly (readonly CellProps[])[],
  solution: readonly (readonly SudokuNumber[])[],
  locationToCheck: CellLocation
): Hint | null {
  const target = getNoteCell(puzzle, locationToCheck);

  if (!target || target.notes.length !== 1) {
    return null;
  }

  const value = target.notes[0];
  const targetValue: ValueCellWithLocation = {
    r: target.r,
    c: target.c,
    type: "value",
    value,
  };
  const row = target.r + 1;
  const column = target.c + 1;
  const removalStages = getRemovalStages(puzzle, target, targetValue);

  return {
    strategy: "OBVIOUS_SINGLE",
    stages: [
      { text: INTRODUCTION_TEXT },
      {
        highlightCells: [{ location: target, highlightType: "focus" }],
        text: `Row ${row}, column ${column} has only one note remaining: ${value}.`,
      },
      {
        placeValues: [targetValue],
        highlightCells: [
          { location: targetValue, highlightType: "placement" },
        ],
        text: `Place ${value} in row ${row}, column ${column}.`,
      },
      ...removalStages,
    ],
  };
}
