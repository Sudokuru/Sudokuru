/**
 * This puzzle-update helper is generic and useful enough that it will probably
 * eventually graduate into V4 production code. There is no reason to
 * standardize on it outside tests before production code actually needs it.
 */

import type { CellProps, ValueCellWithLocation } from "../../Types";

/**
 * Returns a new puzzle with placed-value overrides and leaves the input unchanged.
 */
export function withValues(
  puzzle: CellProps[][],
  values: ValueCellWithLocation[]
): CellProps[][] {
  return values.reduce(
    (nextPuzzle, { r, c, type, value }) => {
      const nextRow = [...nextPuzzle[r]];
      nextRow[c] = { type, value };

      return nextPuzzle.map((row, index) => (index === r ? nextRow : row));
    },
    puzzle
  );
}
