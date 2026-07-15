/**
 * This puzzle-cloning helper is generic and useful enough that it will probably
 * eventually graduate into V4 production code. There is no reason to
 * standardize on it outside tests before production code actually needs it.
 */

import type { CellProps } from "../../Types";

/**
 * Creates a deep-enough puzzle copy for detecting cell and note mutations.
 */
export function clonePuzzle(puzzle: CellProps[][]): CellProps[][] {
  return puzzle.map((row) =>
    row.map((cell): CellProps =>
      cell.type === "note"
        ? { type: "note", notes: [...cell.notes] }
        : { type: cell.type, value: cell.value }
    )
  );
}
