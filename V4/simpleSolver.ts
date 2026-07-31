import type { CellProps } from "./Types";

/**
 * Returns a new puzzle with one randomized obvious or hidden single solved and
 * its peer notes simplified, or null when neither strategy can make progress.
 */
export declare function solveSimpleStep(
  puzzle: readonly (readonly CellProps[])[],
  nextRandom: () => number
): CellProps[][] | null;
