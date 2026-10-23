import type { ModelInputs } from "./featureTypes";
import type { metrics } from "./statistics";

/** One timed puzzle. Batch identifies its source for reporting, not prediction. */
export interface Observation {
  readonly id: string;
  readonly batch: string;
  readonly seconds: number;
  readonly features: ModelInputs;
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

export type ModelSpec = ConstantSpec | LinearSpec;

/** Reporting groups for baselines and formula sizes. */
export type ModelFamily = "constant" | "single" | "pair" | "multivariate";

/**
 * Trained state. Linear coefficients, means, and scales follow spec.features order.
 * Coefficients apply to standardized features, not their original units.
 * Constants use only the intercept.
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

export type FittedModel = ConstantModel | LinearModel;

/** A recipe scored on predictions for puzzles excluded from each fitting step. */
export interface CandidateResult {
  readonly spec: ModelSpec;
  readonly scores: ReturnType<typeof metrics>;
}
