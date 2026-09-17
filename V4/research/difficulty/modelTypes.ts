import type { Features } from "./features";
import type { metrics } from "./statistics";

/** One timed puzzle. Batch identifies its source for reporting, not prediction. */
export interface Observation {
  readonly id: string;
  readonly batch: string;
  readonly seconds: number;
  readonly features: Features;
}

/** An unfitted recipe: which heuristics to use and which kind of model to train. */
export interface ModelSpec {
  readonly id: string;
  readonly kind: "constant" | "linear" | "tree";
  readonly features: readonly string[];
  /** Tree only: maximum number of decisions on a path to a prediction. */
  readonly depth?: number;
  /** Tree only: minimum number of training puzzles allowed in each leaf. */
  readonly minLeaf?: number;
}

// These are domain split records, not an ordered collection. BinaryTree/BST
// provide key lookup/insertion, not regression split training or prediction.
/** A leaf predicts log-seconds; a branch sends values <= its threshold left. */
export type Split = { readonly value: number } | {
  readonly feature: string; readonly threshold: number;
  readonly left: Split; readonly right: Split;
};

/**
 * Trained state. Linear coefficients, means, and scales follow spec.features order.
 * Coefficients apply to standardized features, not their original units.
 * Constants use only the intercept; trees use only the split records for prediction.
 */
export type FittedModel = {
  readonly spec: ModelSpec;
  readonly target: "logSeconds";
  readonly intercept: number;
  readonly coefficients: readonly number[];
  readonly means: readonly number[];
  readonly scales: readonly number[];
  readonly tree?: Split;
};

/** A recipe scored on predictions for puzzles excluded from each fitting step. */
export interface CandidateResult {
  readonly spec: ModelSpec;
  readonly scores: ReturnType<typeof metrics>;
}
