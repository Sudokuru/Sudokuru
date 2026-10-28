import { getPuzzle } from "../../validate";
import { getRefutationScore } from "../../refutation";
import { pearson, spearman } from "./statistics";
import type { ValidationResult } from "./cloudValidation";

/** Score each validated puzzle with the V4 refutation component and a prepared solution. */
export function scoreV4Refutation(rows: readonly { readonly record: { readonly puzzle: string }; readonly solution: number[][] }[]): number[] {
  return rows.map(row => getRefutationScore(getPuzzle(row.record.puzzle), row.solution, 1));
}

/** Raw refutation scores are difficulty values, not predictions in seconds. */
export function summarizeV4Refutation(seconds: readonly number[], scores: readonly number[]): ValidationResult {
  if (!seconds.length || seconds.length !== scores.length || seconds.some(time => !Number.isFinite(time) || time <= 0) ||
    scores.some(score => !Number.isFinite(score))) throw new Error("Refutation observations must be finite and aligned.");
  return { procedure: "v4/refutation", scores: { n: seconds.length, spearman: spearman(seconds, scores),
    pearson: pearson(seconds, scores), logRmse: null, secondsMae: null } };
}
