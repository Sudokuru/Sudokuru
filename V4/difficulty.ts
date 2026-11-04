import { getDependencyScore } from "./dependency";
import { getRefutationScore } from "./refutation";
import type { CellProps, SudokuNumber } from "./Types";
import { getPuzzleSolution } from "./validate";

/** Optional tuning parameters for the combined raw difficulty score. */
export interface RawDifficultyOptions {
  /** Positive integer number of refutation paths. Default: 1. */
  refutationRunCount?: number;
  /** Nonnegative integer trial budget per refutation path. Default: 64. */
  refutationMaxTrialsPerRun?: number;
  /** Seed for refutation path selection. Default: 81. */
  refutationSeed?: number;
  /** Positive integer number of dependency paths. Default: 3. */
  dependencyRunCount?: number;
  /** Positive integer number of early moves sampled per dependency path. Default: 25. */
  dependencyStepCount?: number;
  /** Seed for dependency path selection. Default: 81. */
  dependencySeed?: number;
  /** Multiplier for the normalized refutation score. Default: 1. */
  refutationWeight?: number;
  /** Multiplier for the normalized dependency score. Default: 10. */
  dependencyWeight?: number;
  /** Empty-cell normalization exponent for refutation. Default: 2. */
  refutationEmptyCellExponent?: number;
  /** Empty-cell normalization exponent for dependency. Default: 1.9. */
  dependencyEmptyCellExponent?: number;
  /** Ceiling for both unresolved and finite refutation scores. Default: 48. */
  maxRefutationScore?: number;
  /** Multiplier applied before rounding the combined score. Default: 1,000,000. */
  outputScale?: number;
}

/**
 * Combines bounded refutation cost and early single-move availability into a
 * deterministic integer score. Higher means harder; easy scores can be negative.
 *
 * Inputs must be prevalidated. An optional matching solution is trusted and
 * skips solution discovery; otherwise getPuzzleSolution errors propagate.
 * A completed puzzle returns 0. Note cells count as empty regardless of their
 * notes, and given/user values are treated alike. Inputs are never mutated.
 *
 * A null refutation receives the provisional maximum, and finite refutation
 * scores are capped at the same value before normalization. This is a raw
 * numeric rating; game difficulty labels are assigned separately.
 * Sampling, weights, normalization, the cap, and output scale can be changed
 * through `options`; omitted settings use the defaults listed in its type.
 *
 * Calibration on 30 human-time boards, averaging Pearson across five groups:
 * dependencyRunCount | maxRefutationScore | mean Pearson
 *                  3 |                 48 | 0.8968778852 (chosen default)
 *                 10 |                 48 | 0.8970182236
 *                  5 |                 48 | 0.8957552246
 *                  3 |                 32 | 0.8955966178
 *                 10 |                 32 | 0.8955491066
 * All five used the other defaults below: one refutation run, 64 trials,
 * 25 dependency steps, weights 1/10, exponents 2/1.9, seeds 81, scale 1,000,000.
 * Three dependency runs nearly matched ten with less sampling work. Cap 32
 * correctly ordered the two hardest boards in both Sudoku-of-the-day groups
 * with three dependency runs, despite a slightly lower mean correlation.
 * These are tuning results on a small dataset, not independent validation.
 */
export function getRawDifficulty(
  puzzle: readonly (readonly CellProps[])[],
  solution?: readonly (readonly SudokuNumber[])[],
  {
    refutationRunCount = 1,
    refutationMaxTrialsPerRun = 64,
    refutationSeed = 81,
    dependencyRunCount = 3,
    dependencyStepCount = 25,
    dependencySeed = 81,
    refutationWeight = 1,
    dependencyWeight = 10,
    refutationEmptyCellExponent = 2,
    dependencyEmptyCellExponent = 1.9,
    maxRefutationScore = 48,
    outputScale = 1_000_000,
  }: RawDifficultyOptions = {}
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
    runCount: refutationRunCount,
    maxTrialsPerRun: refutationMaxTrialsPerRun,
    seed: refutationSeed,
  });
  const dependency = getDependencyScore(puzzle, {
    runCount: dependencyRunCount,
    stepCount: dependencyStepCount,
    seed: dependencySeed,
  });
  const cappedRefutation = Math.min(
    refutation ?? maxRefutationScore,
    maxRefutationScore
  );
  const denominator = Math.max(1, emptyCellCount);
  const normalizedRefutation =
    cappedRefutation / denominator ** refutationEmptyCellExponent;
  const normalizedDependency =
    dependency / denominator ** dependencyEmptyCellExponent;

  return Math.round(outputScale * (
    refutationWeight * normalizedRefutation +
    dependencyWeight * normalizedDependency
  ));
}
