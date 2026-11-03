import { createSeededRandom } from "./random";
import {
  getAvailableSingles,
  placeSimpleValue,
  prepareSimplePuzzle,
} from "./simpleSolver";
import type { CellProps } from "./Types";

const DEPENDENCY_RUN_COUNT = 3;
const EARLY_STEP_COUNT = 20;

/**
 * Measures how many obvious or hidden singles are available early in a solve.
 * Three paths begin at the same puzzle and sample up to 20 moves each. The
 * negative, unrounded mean makes more available singles an easier score. A
 * stalled path contributes zero for its remaining steps; zero also describes
 * an already solved puzzle.
 *
 * Inputs must be prevalidated. User notes are ignored, neither input cells nor
 * notes are mutated, and each call uses its own seed-81 random stream.
 */
export function getDependencyScore(
  puzzle: readonly (readonly CellProps[])[]
): number {
  const initial = prepareSimplePuzzle(puzzle);
  const nextRandom = createSeededRandom();
  let totalAvailableSingles = 0;

  for (let run = 0; run < DEPENDENCY_RUN_COUNT; run += 1) {
    let current = initial;

    for (let step = 0; step < EARLY_STEP_COUNT; step += 1) {
      const singles = getAvailableSingles(current);
      totalAvailableSingles += singles.length;
      if (singles.length === 0) {
        break;
      }

      const index =
        singles.length === 1 ? 0 : Math.floor(nextRandom() * singles.length);
      const { location, value } = singles[index];
      current = placeSimpleValue(current, location, value);
    }
  }

  return totalAvailableSingles === 0
    ? 0
    : -totalAvailableSingles / (DEPENDENCY_RUN_COUNT * EARLY_STEP_COUNT);
}
