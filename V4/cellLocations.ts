import type {
  CellLocation,
  CellProps,
  NoteCellWithLocation,
  ValueCellWithLocation,
} from "./Types";

/**
 * Returns a placed puzzle cell with its location, or null for a note cell.
 */
export function getValueCell(
  puzzle: readonly (readonly CellProps[])[],
  location: CellLocation
): ValueCellWithLocation | null {
  const cell = puzzle[location.r]?.[location.c];

  if (!cell || cell.type === "note") {
    return null;
  }

  return { ...location, ...cell };
}

/**
 * Returns a puzzle note cell with its location, or null for a placed-value cell.
 */
export function getNoteCell(
  puzzle: readonly (readonly CellProps[])[],
  location: CellLocation
): NoteCellWithLocation | null {
  const cell = puzzle[location.r][location.c];

  if (cell?.type !== "note") {
    return null;
  }

  return { ...location, ...cell, notes: [...cell.notes] };
}

/**
 * Returns true when two locations refer to the same puzzle cell.
 */
export function locationsEqual(
  first: CellLocation,
  second: CellLocation
): boolean {
  return first.r === second.r && first.c === second.c;
}

/**
 * Returns every location in a row from left to right.
 *
 * @example
 * rowLocations(2, 4);
 * // [
 * //   { r: 2, c: 0 },
 * //   { r: 2, c: 1 },
 * //   { r: 2, c: 2 },
 * //   { r: 2, c: 3 },
 * // ]
 */
export function rowLocations(row: number, size: number): CellLocation[] {
  return Array.from({ length: size }, (_, c) => ({ r: row, c }));
}

/**
 * Returns every location in a column from top to bottom.
 *
 * @example
 * columnLocations(1, 4);
 * // [
 * //   { r: 0, c: 1 },
 * //   { r: 1, c: 1 },
 * //   { r: 2, c: 1 },
 * //   { r: 3, c: 1 },
 * // ]
 */
export function columnLocations(column: number, size: number): CellLocation[] {
  return Array.from({ length: size }, (_, r) => ({ r, c: column }));
}

/**
 * Returns every location in the containing box in row-major order.
 *
 * @example
 * boxLocations({ r: 4, c: 7 }, 3, 3);
 * // [
 * //   { r: 3, c: 6 }, { r: 3, c: 7 }, { r: 3, c: 8 },
 * //   { r: 4, c: 6 }, { r: 4, c: 7 }, { r: 4, c: 8 },
 * //   { r: 5, c: 6 }, { r: 5, c: 7 }, { r: 5, c: 8 },
 * // ]
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
