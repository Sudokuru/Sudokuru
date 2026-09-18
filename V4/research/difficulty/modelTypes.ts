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
interface BaseSpec {
  readonly id: string;
  readonly features: readonly string[];
}

export interface ConstantSpec extends BaseSpec {
  readonly kind: "constant";
  readonly features: readonly [];
}

export interface LinearSpec extends BaseSpec {
  readonly kind: "linear";
}

export interface TreeSpec extends BaseSpec {
  readonly kind: "tree";
  /** Maximum number of decisions on a path to a prediction. */
  readonly depth: number;
  /** Minimum number of training puzzles allowed in each leaf. */
  readonly minLeaf: number;
}

export type ModelSpec = ConstantSpec | LinearSpec | TreeSpec;

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
interface FittedBase {
  readonly target: "logSeconds";
}

export interface ConstantModel extends FittedBase {
  readonly kind: "constant";
  readonly spec: ConstantSpec;
  readonly intercept: number;
}

export interface LinearModel extends FittedBase {
  readonly kind: "linear";
  readonly spec: LinearSpec;
  readonly intercept: number;
  readonly coefficients: readonly number[];
  readonly means: readonly number[];
  readonly scales: readonly number[];
}

export interface TreeModel extends FittedBase {
  readonly kind: "tree";
  readonly spec: TreeSpec;
  readonly tree: Split;
}

export type FittedModel = ConstantModel | LinearModel | TreeModel;

/** A recipe scored on predictions for puzzles excluded from each fitting step. */
export interface CandidateResult {
  readonly spec: ModelSpec;
  readonly scores: ReturnType<typeof metrics>;
}
