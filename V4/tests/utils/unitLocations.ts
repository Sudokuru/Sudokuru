/**
 * This unit-location helper is generic and useful enough that it will probably
 * eventually graduate into V4 production code. There is no reason to
 * standardize on it outside tests before production code actually needs it.
 */

import { BOX_LAYOUTS } from "../../Types";
import type {
  CellLocation,
  SupportedBoardSize,
  Unit,
} from "../../Types";
import {
  boxLocations,
  columnLocations,
  rowLocations,
} from "../../cellLocations";

/**
 * Returns every location in the requested row, column, or box.
 */
export function getUnitLocations(
  target: CellLocation,
  unit: Unit,
  size: SupportedBoardSize
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
