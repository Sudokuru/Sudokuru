import type { CellProps, Hint } from "./Types";

/**
 * Applies a hint and returns the updated puzzle as a new immutable instance.
 */
export declare function applyHint(
  puzzle: readonly (readonly CellProps[])[],
  hint: Hint
): CellProps[][];
