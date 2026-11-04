import { createSeededRandom } from "./random";
import {
  getAvailableSingles,
  placeSimpleValue,
  prepareSimplePuzzle,
} from "./simpleSolver";
import type { CellProps } from "./Types";

const DEPENDENCY_RUN_COUNT = 3;
const EARLY_STEP_COUNT = 20;

export interface DependencyOptions {
  /** Positive integer number of sampled solve paths. Defaults to 3. */
  runCount?: number;
  /** Positive integer sampling window per path. Defaults to 20 moves. */
  stepCount?: number;
  /** Seed for one random stream shared across paths. Defaults to 81. */
  seed?: number;
}

/**
 * Measures how many obvious or hidden singles are available early in a solve.
 * By default, three paths begin at the same puzzle and sample up to 20 moves
 * each. The negative, unrounded mean makes more available singles an easier
 * score. A stalled path contributes zero for its remaining steps; zero also
 * describes an already solved puzzle.
 *
 * Inputs must be prevalidated. User notes are ignored, neither input cells nor
 * notes are mutated, and each call uses its own random stream (default seed 81).
 * Throws RangeError for invalid run or step counts.
 */
export function getDependencyScore(
  puzzle: readonly (readonly CellProps[])[],
  {
    runCount = DEPENDENCY_RUN_COUNT,
    stepCount = EARLY_STEP_COUNT,
    seed = 81,
  }: DependencyOptions = {}
): number {
  if (!Number.isInteger(runCount) || runCount <= 0) {
    throw new RangeError("runCount must be a positive integer.");
  }
  if (!Number.isInteger(stepCount) || stepCount <= 0) {
    throw new RangeError("stepCount must be a positive integer.");
  }

  const initial = prepareSimplePuzzle(puzzle);
  const nextRandom = createSeededRandom(seed);
  let totalAvailableSingles = 0;

  for (let run = 0; run < runCount; run += 1) {
    let current = initial;

    for (let step = 0; step < stepCount; step += 1) {
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
    : -totalAvailableSingles / (runCount * stepCount);
}
