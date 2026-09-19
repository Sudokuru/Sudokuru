import type { Features, HistoricalScores } from "./featureTypes";
import type { Observation } from "./modelTypes";
import type { PreparedPuzzle } from "./prepare";
import type { singleTrace } from "./singleTrace";
import type { runExperiment, correlations } from "./experiments";

export interface FeatureRow extends PreparedPuzzle {
  readonly features: Features;
  readonly trace: ReturnType<typeof singleTrace>;
}

export interface TimedObservation extends Observation {
  readonly kind: "personal" | "site-average";
  readonly historicalScores: HistoricalScores;
}

export interface Cohort {
  readonly name: string;
  readonly rows: readonly TimedObservation[];
}

export interface ExperimentSpec {
  readonly name: string;
  readonly features: readonly string[];
  readonly includeTrace: boolean;
}

export type ExperimentResult = ReturnType<typeof runExperiment>;
export type CorrelationRow = ReturnType<typeof correlations>[number];
