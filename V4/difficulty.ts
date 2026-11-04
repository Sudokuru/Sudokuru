import { getDependencyScore } from "./dependency";
import { getRefutationScore } from "./refutation";
import type { CellProps, SudokuNumber } from "./Types";
import { getPuzzleSolution } from "./validate";

// Sampling controls: more runs reduce move-order variation at additional cost.
// The trial budget bounds refutation work; dependency samples only early moves.
const REFUTATION_RUN_COUNT = 3;
const REFUTATION_MAX_TRIALS_PER_RUN = 32;
const REFUTATION_SEED = 81;
const DEPENDENCY_RUN_COUNT = 3;
const DEPENDENCY_STEP_COUNT = 20;
const DEPENDENCY_SEED = 81;

// Higher refutation scores increase difficulty; dependency scores are negative.
// Each component is divided by emptyCellCount ** its normalization exponent.
const REFUTATION_WEIGHT = 1;
const DEPENDENCY_WEIGHT = 1;
const REFUTATION_EMPTY_CELL_EXPONENT = 0;
const DEPENDENCY_EMPTY_CELL_EXPONENT = 1.9;

// Provisional ceiling for both unresolved and finite refutation scores.
const MAX_REFUTATION_SCORE = 256;
const OUTPUT_SCALE = 1_000_000;

/**
 * Combines bounded refutation cost and early single-move availability into a
 * deterministic integer score. Higher means harder; easy scores can be negative.
 * Sampling, weights, normalization, the cap, and scale are tuned above.
 *
 * Inputs must be prevalidated. An optional matching solution is trusted and
 * skips solution discovery; otherwise getPuzzleSolution errors propagate.
 * A completed puzzle returns 0. Note cells count as empty regardless of their
 * notes, and given/user values are treated alike. Inputs are never mutated.
 *
 * A null refutation receives the provisional maximum, and finite refutation
 * scores are capped at the same value before normalization. This is a raw
 * numeric rating; game difficulty labels are assigned separately.
 */
export function getRawDifficulty(
  puzzle: readonly (readonly CellProps[])[],
  solution?: readonly (readonly SudokuNumber[])[]
): number {
  let emptyCellCount = 0;
  for (const row of puzzle) {
    for (const cell of row) {
      if (cell.type === "note") {
        emptyCellCount += 1;
      }
    }
  }
  if (emptyCellCount === 0) {
    return 0;
  }

  const matchingSolution = solution ?? getPuzzleSolution(puzzle);
  const refutation = getRefutationScore(puzzle, matchingSolution, {
    runCount: REFUTATION_RUN_COUNT,
    maxTrialsPerRun: REFUTATION_MAX_TRIALS_PER_RUN,
    seed: REFUTATION_SEED,
  });
  const dependency = getDependencyScore(puzzle, {
    runCount: DEPENDENCY_RUN_COUNT,
    stepCount: DEPENDENCY_STEP_COUNT,
    seed: DEPENDENCY_SEED,
  });
  const cappedRefutation = Math.min(
    refutation ?? MAX_REFUTATION_SCORE,
    MAX_REFUTATION_SCORE
  );
  const denominator = Math.max(1, emptyCellCount);
  const normalizedRefutation =
    cappedRefutation / denominator ** REFUTATION_EMPTY_CELL_EXPONENT;
  const normalizedDependency =
    dependency / denominator ** DEPENDENCY_EMPTY_CELL_EXPONENT;

  return Math.round(OUTPUT_SCALE * (
    REFUTATION_WEIGHT * normalizedRefutation +
    DEPENDENCY_WEIGHT * normalizedDependency
  ));
}
