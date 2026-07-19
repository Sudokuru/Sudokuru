/**
 * These puzzle factories are generic and useful enough that they will probably
 * eventually graduate into V4 production code. There is no reason to
 * standardize on them outside tests before production code actually needs them.
 */

import type { CellProps } from "../../Types";

/**
 * Creates a fresh square puzzle containing only empty note cells.
 */
export function createEmptyPuzzle(size: number): CellProps[][] {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ({ type: "note", notes: [] }))
  );
}
