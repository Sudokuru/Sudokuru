/**
 * These puzzle-update helpers are generic and useful enough that they will
 * probably eventually graduate into V4 production code. There is no reason to
 * standardize on them outside tests before production code actually needs them.
 */

import type {
  CellProps,
  NoteCellWithLocation,
  ValueCellWithLocation,
} from "../../Types";

/**
 * Returns a new puzzle with placed-value overrides and leaves the input unchanged.
 */
export function withValues(
  puzzle: readonly (readonly CellProps[])[],
  values: readonly ValueCellWithLocation[]
): readonly (readonly CellProps[])[] {
  return values.reduce<readonly (readonly CellProps[])[]>(
    (nextPuzzle, { r, c, type, value }) => {
      const nextRow = [...nextPuzzle[r]];
      nextRow[c] = { type, value };
      const updatedPuzzle = [...nextPuzzle];
      updatedPuzzle[r] = nextRow;

      return updatedPuzzle;
    },
    puzzle
  );
}

/**
 * Returns a new puzzle with note-cell overrides and leaves the input unchanged.
 */
export function withNotes(
  puzzle: readonly (readonly CellProps[])[],
  noteCells: readonly NoteCellWithLocation[]
): readonly (readonly CellProps[])[] {
  return noteCells.reduce<readonly (readonly CellProps[])[]>(
    (nextPuzzle, { r, c, notes }) => {
      const nextRow = [...nextPuzzle[r]];
      nextRow[c] = { type: "note", notes: [...notes] };
      const updatedPuzzle = [...nextPuzzle];
      updatedPuzzle[r] = nextRow;

      return updatedPuzzle;
    },
    puzzle
  );
}
