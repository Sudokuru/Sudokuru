import { getDependencyScore } from "./dependency";
import { getRefutationScore } from "./refutation";
import type { CellProps, SudokuNumber } from "./Types";
import { getPuzzleSolution } from "./validate";

/** Optional tuning parameters for the combined raw difficulty score. */
export interface RawDifficultyOptions {
  /** Positive integer number of refutation paths. Default: 3. */
  refutationRunCount?: number;
  /** Nonnegative integer trial budget per refutation path. Default: 32. */
  refutationMaxTrialsPerRun?: number;
  /** Seed for refutation path selection. Default: 81. */
  refutationSeed?: number;
  /** Positive integer number of dependency paths. Default: 3. */
  dependencyRunCount?: number;
  /** Positive integer number of early moves sampled per dependency path. Default: 20. */
  dependencyStepCount?: number;
  /** Seed for dependency path selection. Default: 81. */
  dependencySeed?: number;
  /** Multiplier for the normalized refutation score. Default: 1. */
  refutationWeight?: number;
  /** Multiplier for the normalized dependency score. Default: 1. */
  dependencyWeight?: number;
  /** Empty-cell normalization exponent for refutation. Default: 0. */
  refutationEmptyCellExponent?: number;
  /** Empty-cell normalization exponent for dependency. Default: 1.9. */
  dependencyEmptyCellExponent?: number;
  /** Ceiling for both unresolved and finite refutation scores. Default: 256. */
  maxRefutationScore?: number;
  /** Multiplier applied before rounding the combined score. Default: 1,000,000. */
  outputScale?: number;
}

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
 * Sampling, weights, normalization, the cap, and output scale can be changed
 * through `options`; omitted settings use the defaults listed in its type.
 */
export function getRawDifficulty(
  puzzle: readonly (readonly CellProps[])[],
  solution?: readonly (readonly SudokuNumber[])[],
  {
    refutationRunCount = 3,
    refutationMaxTrialsPerRun = 32,
    refutationSeed = 81,
    dependencyRunCount = 3,
    dependencyStepCount = 20,
    dependencySeed = 81,
    refutationWeight = 1,
    dependencyWeight = 1,
    refutationEmptyCellExponent = 0,
    dependencyEmptyCellExponent = 1.9,
    maxRefutationScore = 256,
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
