/** Shared execution settings, also written into research artifacts. */
export const TREE_DEPTHS = [1, 2, 3] as const;
export const TREE_MIN_LEAVES = [3, 5] as const;
export const BOOTSTRAP_REPEATS = 2000;
export const BOOTSTRAP_SEED = 711;
export const BENCHMARK_SETTINGS = {
  warmupPasses: 5,
  measuredPasses: 20,
  predictionBatch: 1000,
} as const;

/** Research acceptance criteria are unset until explicitly chosen. */
export const ACCEPTANCE_CRITERIA: {
  readonly maxRankingLoss: number | null;
  readonly scoringP95BudgetMs: number | null;
} = {
  maxRankingLoss: null,
  scoringP95BudgetMs: null,
};
