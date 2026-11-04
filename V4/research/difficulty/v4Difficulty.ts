import { getRawDifficulty, type RawDifficultyOptions } from "../../difficulty";
import { getPuzzle } from "../../validate";
import { pearson, spearman } from "./statistics";
import type { ValidationResult } from "./cloudValidation";

/** Fixed recipes from difficulty.ts at 25d39b3; never fitted to the report corpus. */
export interface V4DifficultyTuning {
  readonly procedure: string;
  readonly recommended: boolean;
  readonly tuningMeanPearson: number;
  readonly options: Readonly<Required<RawDifficultyOptions>>;
}

// Resolve every setting explicitly so future API default changes cannot silently
// change the meaning of these procedure IDs or their archived measurements.
export const V4_DIFFICULTY_TUNINGS: readonly V4DifficultyTuning[] = [
  { procedure: "v4/difficulty-recommended", runs: 3, cap: 48, mean: 0.8968778852 },
  { procedure: "v4/difficulty-runs10-cap48", runs: 10, cap: 48, mean: 0.8970182236 },
  { procedure: "v4/difficulty-runs5-cap48", runs: 5, cap: 48, mean: 0.8957552246 },
  { procedure: "v4/difficulty-runs3-cap32", runs: 3, cap: 32, mean: 0.8955966178 },
  { procedure: "v4/difficulty-runs10-cap32", runs: 10, cap: 32, mean: 0.8955491066 },
].map(({ procedure, runs, cap, mean }, index) => ({
  procedure, recommended: index === 0, tuningMeanPearson: mean,
  options: {
    refutationRunCount: 1, refutationMaxTrialsPerRun: 64, refutationSeed: 81,
    dependencyRunCount: runs, dependencyStepCount: 25, dependencySeed: 81,
    refutationWeight: 1, dependencyWeight: 10,
    refutationEmptyCellExponent: 2, dependencyEmptyCellExponent: 1.9,
    maxRefutationScore: cap, outputScale: 1_000_000,
  },
}));

/** Recognize raw scores, which have no predicted-seconds error metrics. */
export function isV4RawProcedure(procedure: string): boolean {
  return procedure === "v4/refutation" || V4_DIFFICULTY_TUNINGS.some(row => row.procedure === procedure);
}

/** Score validated records in input order using their already prepared solutions. */
export function scoreV4Difficulty(
  rows: readonly { readonly record: { readonly puzzle: string }; readonly solution: number[][] }[],
  options: RawDifficultyOptions,
): number[] {
  return rows.map(row => getRawDifficulty(getPuzzle(row.record.puzzle), row.solution, options));
}

/** Compare raw difficulty directly to seconds; constant scores have null correlations. */
export function summarizeRawDifficulty(procedure: string, seconds: readonly number[], scores: readonly number[]): ValidationResult {
  if (!seconds.length || seconds.length !== scores.length || seconds.some(time => !Number.isFinite(time) || time <= 0) ||
    scores.some(score => !Number.isFinite(score))) throw new Error("Difficulty observations must be finite and aligned.");
  return { procedure, scores: { n: seconds.length, spearman: spearman(seconds, scores),
    pearson: pearson(seconds, scores), logRmse: null, secondsMae: null } };
}
