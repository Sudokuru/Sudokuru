import { BOX_LAYOUTS } from "./Types";
import type {
  CellLocation,
  Unit,
} from "./Types";
import {
  boxLocations,
  columnLocations,
  rowLocations,
} from "./cellLocations";

/**
 * Returns every location in the requested row, column, or box.
 */
export function getUnitLocations(
  target: CellLocation,
  unit: Unit,
  size: number
): CellLocation[] {
  switch (unit) {
    case "row":
      return rowLocations(target.r, size);
    case "column":
      return columnLocations(target.c, size);
    case "box": {
      const { boxHeight, boxWidth } = BOX_LAYOUTS[size];
      return boxLocations(target, boxHeight, boxWidth);
    }
  }
}

/**
 * Returns the user-facing description of a row, column, or box containing a target.
 */
export function getUnitDescription(
  target: CellLocation,
  unit: Unit
): string {
  switch (unit) {
    case "row":
      return `row ${target.r + 1}`;
    case "column":
      return `column ${target.c + 1}`;
    case "box":
      return "the same box";
  }
}
