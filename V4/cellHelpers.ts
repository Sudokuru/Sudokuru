import type {
  CellLocation,
  CellProps,
  ValueCellWithLocation,
} from "./Types";

/**
 * Returns a placed puzzle cell with its location, or null for a note cell.
 */
export function getValueCell(
  puzzle: CellProps[][],
  location: CellLocation
): ValueCellWithLocation | null {
  const cell = puzzle[location.r]?.[location.c];

  if (!cell || cell.type === "note") {
    return null;
  }

  return { ...location, ...cell };
}
