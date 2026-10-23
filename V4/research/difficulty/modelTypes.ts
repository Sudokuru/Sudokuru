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

export interface QuadraticSpec extends BaseSpec {
  readonly kind: "quadratic";
  readonly features: readonly [string];
}

export interface RidgeSpec extends BaseSpec {
  readonly kind: "ridge";
  /** Mean squared log error + penalty * sum of squared standardized weights. */
  readonly penalty: number;
}

export interface DirectSpec extends BaseSpec {
  readonly kind: "direct";
  readonly features: readonly [string];
  /** Fixed positive floor for extrapolated seconds; never fitted to held-out data. */
  readonly minimumSeconds: number;
}

export interface PowerSpec extends BaseSpec {
  readonly kind: "power";
  readonly features: readonly [string];
}

/** Fixed power-baseline term plus one observed strategy measurement. */
interface StrategyInputs extends BaseSpec {
  readonly features: readonly [string, string];
}

export interface ReductionSpec extends StrategyInputs { readonly kind: "reduction"; }
export interface BottleneckSpec extends StrategyInputs { readonly kind: "bottleneck"; }
export type StrategySpec = ReductionSpec | BottleneckSpec;

export type ModelSpec = ConstantSpec | LinearSpec | QuadraticSpec | RidgeSpec | DirectSpec | PowerSpec | StrategySpec;

/** Reporting groups for baselines and formula sizes. */
export type ModelFamily = "constant" | "single" | "pair" | "multivariate" | "quadratic" | "ridge" | "direct" | "power" | "reduction" | "bottleneck";

/**
 * Trained state. Formula coefficients, means, and scales follow modelTerms(spec)
 * order (raw features, or x then x² for a quadratic).
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

interface FormulaParameters extends FittedBase {
  readonly intercept: number;
  readonly coefficients: readonly number[];
  readonly means: readonly number[];
  readonly scales: readonly number[];
}

export interface LinearModel extends FormulaParameters {
  readonly kind: "linear";
  readonly spec: LinearSpec;
}

export interface QuadraticModel extends FormulaParameters {
  readonly kind: "quadratic";
  readonly spec: QuadraticSpec;
}

export interface RidgeModel extends FormulaParameters {
  readonly kind: "ridge";
  readonly spec: RidgeSpec;
}

export interface DirectModel extends Omit<FormulaParameters, "target"> {
  readonly target: "seconds";
  readonly kind: "direct";
  readonly spec: DirectSpec;
}

export interface PowerModel extends FormulaParameters {
  readonly kind: "power";
  readonly spec: PowerSpec;
}

export interface StrategyModel extends FormulaParameters {
  readonly kind: "reduction" | "bottleneck";
  readonly spec: StrategySpec;
}

export type FittedModel = ConstantModel | LinearModel | QuadraticModel | RidgeModel | DirectModel | PowerModel | StrategyModel;

/** A recipe scored on predictions for puzzles excluded from each fitting step. */
export interface CandidateResult {
  readonly spec: ModelSpec;
  readonly scores: ReturnType<typeof metrics>;
}
