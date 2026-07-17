import { BOX_LAYOUTS } from "./Types";
import {
  boxLocations,
  columnLocations,
  getValueCell,
  locationsEqual,
  rowLocations,
} from "./cellLocations";
import type {
  BoxLayout,
  CellLocation,
  CellProps,
  Hint,
  SudokuValue,
  Unit,
  ValueCellWithLocation,
} from "./Types";

type UnitCheck = {
  unit: Unit;
  locations: CellLocation[];
};

type DirectConflict = UnitCheck & {
  conflictingCell: ValueCellWithLocation;
};

/**
 * Returns row, column, and box checks in deterministic strategy precedence order.
 */
function getUnitChecks(
  puzzle: CellProps[][],
  location: CellLocation
): UnitCheck[] {
  const size = puzzle.length;
  const layout: BoxLayout = BOX_LAYOUTS[size];

  return [
    { unit: "row", locations: rowLocations(location.r, size) },
    { unit: "column", locations: columnLocations(location.c, size) },
    {
      unit: "box",
      locations: boxLocations(location, layout.boxHeight, layout.boxWidth),
    },
  ];
}

/**
 * Finds the first direct conflict using row, column, then box precedence.
 */
function findDirectConflict(
  puzzle: CellProps[][],
  wrongValue: ValueCellWithLocation
): DirectConflict | null {
  for (const { unit, locations } of getUnitChecks(puzzle, wrongValue)) {
    for (const location of locations) {
      // skip comparing the cell against itself
      if (locationsEqual(location, wrongValue)) {
        continue;
      }

      const cell = getValueCell(puzzle, location);

      if (cell?.value === wrongValue.value) {
        return { unit, locations, conflictingCell: cell };
      }
    }
  }

  return null;
}

/**
 * Builds the staged hint used when an existing placed value directly conflicts.
 */
function getDirectConflictHint(
  wrongValue: ValueCellWithLocation,
  conflict: DirectConflict
): Hint {
  const otherLocations = conflict.locations.filter(
    (location) =>
      !locationsEqual(location, wrongValue) &&
      !locationsEqual(location, conflict.conflictingCell)
  );
  const row = wrongValue.r + 1;
  const column = wrongValue.c + 1;

  return {
    strategy: "WRONG_VALUE",
    stages: [
      {
        highlightCells: [
          ...otherLocations.map((location) => ({
            location,
            highlightType: "focus" as const,
          })),
          { location: wrongValue, highlightType: "removal" },
          { location: conflict.conflictingCell, highlightType: "basis" },
        ],
        text: `The ${wrongValue.value} in row ${row}, column ${column} conflicts with the existing ${wrongValue.value} in the same ${conflict.unit}.`,
      },
      {
        removeValues: [wrongValue],
        highlightCells: conflict.locations.map((location) => ({
          location,
          highlightType: "focus" as const,
        })),
        text: `Remove the ${wrongValue.value} in row ${row}, column ${column}.`,
      },
    ],
  };
}

/**
 * Builds the staged hint used when the solution refutes a value without a direct conflict.
 */
function getNoDirectConflictHint(wrongValue: ValueCellWithLocation): Hint {
  const row = wrongValue.r + 1;
  const column = wrongValue.c + 1;

  return {
    strategy: "WRONG_VALUE",
    stages: [
      {
        highlightCells: [{ location: wrongValue, highlightType: "removal" }],
        text: `The ${wrongValue.value} in row ${row}, column ${column} is the wrong value for this cell.`,
      },
      {
        removeValues: [wrongValue],
        highlightCells: [{ location: wrongValue, highlightType: "focus" }],
        text: `Remove the ${wrongValue.value} in row ${row}, column ${column}.`,
      },
    ],
  };
}

/**
 * Returns a staged removal hint when the targeted user value differs from the solution.
 */
export function getWrongValueHint(
  puzzle: CellProps[][],
  solution: SudokuValue[][],
  locationToCheck: CellLocation
): Hint | null {
  const wrongValue = getValueCell(puzzle, locationToCheck);

  if (
    wrongValue?.type !== "value" ||
    wrongValue.value === solution[locationToCheck.r][locationToCheck.c]
  ) {
    return null;
  }

  const directConflict = findDirectConflict(puzzle, wrongValue);

  return directConflict
    ? getDirectConflictHint(wrongValue, directConflict)
    : getNoDirectConflictHint(wrongValue);
}
