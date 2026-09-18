import { BOOTSTRAP_REPEATS, BOOTSTRAP_SEED } from "./settings";

// The installed CommonJS package does not provide TypeScript declarations.
const calculateCorrelation: (
  a: readonly number[],
  b: readonly number[],
  options: { decimals: number }
) => number = require("calculate-correlation");

/**
 * Returns the arithmetic average. Callers supply a nonempty array of finite
 * numbers; this helper does not validate inputs and returns NaN for an empty array.
 */
export function mean(values: readonly number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/**
 * Divides two numbers, returning zero when the denominator is zero.
 * Used for features with no observations, such as the fraction of empty cells
 * filled on an already-completed board. It does not otherwise sanitize inputs.
 */
export function safeRatio(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Measures the strength and direction of a linear relationship between paired
 * values. Each index must refer to the same observation in both arrays.
 *
 * @returns A coefficient from -1 (opposite directions) to 1 (same direction);
 * zero means no linear association. Returns null for fewer than two pairs,
 * non-finite inputs, constant arrays, or a non-finite library result.
 * @throws When array lengths differ.
 */
export function pearson(a: readonly number[], b: readonly number[]): number | null {
  if (a.length !== b.length) throw new Error("Correlation arrays must align.");
  if (a.length < 2 || [...a, ...b].some(n => !Number.isFinite(n))) return null;
  // Avoid the package's default nine-decimal rounding during model selection.
  const correlation = calculateCorrelation(a, b, { decimals: 15 });
  // Clamp small floating-point excursions beyond the mathematical bounds.
  return Number.isFinite(correlation) ? Math.max(-1, Math.min(1, correlation)) : null;
}

/**
 * Assigns ascending, one-based ranks to finite numbers, preserving input order
 * in the returned array. Equal values share the average of their rank positions.
 * For example, [40, 20, 20, 10] becomes [4, 2.5, 2.5, 1].
 * Returns an empty array for empty input and never sorts the caller's array.
 */
export function ranks(values: readonly number[]): number[] {
  const order = values.map((value, i) => ({ value, i })).sort((a, b) => a.value - b.value);
  const result = new Array<number>(values.length);
  // Walk each group of equal sorted values. `end` is exclusive; averaging its
  // first and last zero-based positions, then adding one, gives the shared rank.
  for (let start = 0; start < order.length;) {
    let end = start + 1;
    while (end < order.length && order[end].value === order[start].value) end++;
    for (let i = start; i < end; i++) result[order[i].i] = (start + end - 1) / 2 + 1;
    start = end;
  }
  return result;
}

/**
 * Measures agreement in ordering by applying Pearson correlation to average
 * ranks. Unlike Pearson on raw values, it can capture a consistently increasing
 * or decreasing relationship even when that relationship is not linear.
 *
 * Uses the same [-1, 1] scale and null cases as pearson, including tied constants.
 * Paired arrays must have equal lengths; mismatched lengths throw.
 */
export function spearman(a: readonly number[], b: readonly number[]): number | null {
  if (a.length !== b.length) throw new Error("Correlation arrays must align.");
  if ([...a, ...b].some(value => !Number.isFinite(value))) return null;
  return pearson(ranks(a), ranks(b));
}

/**
 * Evaluates predictions against observed human solve times for the same puzzles.
 *
 * @param seconds Positive, finite observed times in seconds.
 * @param logPredictions Predictions in natural-log seconds, not seconds.
 * @returns Sample count; Spearman ordering agreement; Pearson correlation after
 * exponentiating predictions; root mean squared error in log-seconds (logRmse);
 * and mean absolute error in seconds (secondsMae). Lower errors are better.
 * Correlations can be null even when errors are defined, e.g. for constant times.
 * @throws For empty/misaligned arrays, invalid times, non-finite predictions,
 * or predictions that overflow when converted back to seconds.
 */
export function metrics(seconds: readonly number[], logPredictions: readonly number[]) {
  if (seconds.length !== logPredictions.length || seconds.length === 0) {
    throw new Error("Metrics need nonempty aligned observations.");
  }
  if (seconds.some(value => !Number.isFinite(value) || value <= 0) ||
    logPredictions.some(value => !Number.isFinite(value) || !Number.isFinite(Math.exp(value)))) {
    throw new Error("Metrics require finite predictions and positive finite times.");
  }
  return {
    n: seconds.length,
    // Exponentiation preserves ordering, so ranks can use log predictions directly.
    spearman: spearman(seconds, logPredictions),
    pearson: pearson(seconds, logPredictions.map(Math.exp)),
    logRmse: Math.sqrt(mean(seconds.map((s, i) => (Math.log(s) - logPredictions[i]) ** 2))),
    secondsMae: mean(seconds.map((s, i) => Math.abs(s - Math.exp(logPredictions[i])))),
  };
}

/**
 * Returns a percentile using linear interpolation between adjacent sorted values.
 * Callers must provide finite numbers in ascending order and a probability in
 * [0, 1]; these preconditions are not checked here. Zero selects the minimum,
 * one selects the maximum, and 0.5 selects the median. Empty input returns null.
 */
export function quantile(sorted: readonly number[], probability: number): number | null {
  if (!sorted.length) return null;
  const index = (sorted.length - 1) * probability;
  const lo = Math.floor(index), hi = Math.ceil(index);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (index - lo);
}

/**
 * Estimates uncertainty in the difference between a model's and the legacy
 * score's Spearman correlations with human solve time. Positive differences
 * favor the model. All three arrays must describe the same puzzles in the same
 * order; predictions may be seconds or log-seconds because only ranks matter.
 *
 * Each repetition samples puzzles with replacement, keeping each puzzle's time,
 * prediction, and legacy score together. Models are not refitted: the interval
 * describes variation in these fixed predictions, not model-selection uncertainty
 * or generalization to a different solver population.
 *
 * @param repeats Number of resampling attempts (a positive integer).
 * @param seed Integer seed for reproducible pseudo-random draws.
 * @returns The original-sample difference, 2.5th/97.5th percentiles of valid
 * resampled differences, and the valid/attempted resample counts and seed.
 * The difference is null if either original correlation is undefined; interval
 * bounds are null if no resample has two defined correlations.
 * @throws When the three array lengths differ.
 */
export function bootstrapRankDifference(
  seconds: readonly number[], predicted: readonly number[], legacy: readonly number[],
  repeats: number = BOOTSTRAP_REPEATS, seed: number = BOOTSTRAP_SEED
) {
  if (seconds.length !== predicted.length || seconds.length !== legacy.length) {
    throw new Error("Bootstrap arrays must align.");
  }
  const differences: number[] = [];
  // Keep the pseudo-random state in unsigned 32-bit arithmetic. The same seed
  // and input order produce the same sequence of sampled puzzle indices.
  let state = seed >>> 0;
  for (let iteration = 0; iteration < repeats; iteration++) {
    const indices = seconds.map(() => {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      return Math.floor(state / 4294967296 * seconds.length);
    });
    // Reuse these indices for all three arrays to preserve the paired observations.
    const sample = indices.map(i => seconds[i]);
    const a = spearman(sample, indices.map(i => predicted[i]));
    const b = spearman(sample, indices.map(i => legacy[i]));
    // Repeated draws can create a constant sample. Omit undefined correlations
    // instead of recording an artificial zero difference.
    if (a !== null && b !== null) differences.push(a - b);
  }
  // The middle 95% of valid resampled differences forms the percentile interval.
  differences.sort((a, b) => a - b);
  const a = spearman(seconds, predicted), b = spearman(seconds, legacy);
  return {
    difference: a === null || b === null ? null : a - b,
    lower95: quantile(differences, 0.025), upper95: quantile(differences, 0.975),
    validResamples: differences.length, repeats, seed,
  };
}
