/**
 * These location helpers are generic and useful enough that they will probably
 * eventually graduate into V4 production code. There is no reason to
 * standardize on them outside tests before production code actually needs them.
 */

import type { CellLocation } from "../../Types";

/**
 * Returns every location in a row from left to right.
 */
export function rowLocations(row: number, size: number): CellLocation[] {
  return Array.from({ length: size }, (_, c) => ({ r: row, c }));
}

/**
 * Returns every location in a column from top to bottom.
 */
export function columnLocations(column: number, size: number): CellLocation[] {
  return Array.from({ length: size }, (_, r) => ({ r, c: column }));
}

/**
 * Returns every location in the containing box in row-major order.
 */
export function boxLocations(
  location: CellLocation,
  boxHeight: number,
  boxWidth: number
): CellLocation[] {
  const firstRow = Math.floor(location.r / boxHeight) * boxHeight;
  const firstColumn = Math.floor(location.c / boxWidth) * boxWidth;

  return Array.from({ length: boxHeight }, (_, rowOffset) =>
    Array.from({ length: boxWidth }, (_, columnOffset) => ({
      r: firstRow + rowOffset,
      c: firstColumn + columnOffset,
    }))
  ).flat();
}
