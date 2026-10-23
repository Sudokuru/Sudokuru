import type { Features, HistoricalScores } from "./featureTypes";
import type { Observation, FittedModel, CandidateResult, ModelSpec, ModelFamily } from "./modelTypes";
import type { PreparedPuzzle } from "./prepare";
import type { SingleTrace } from "./singleTrace";
import type { metrics, bootstrapRankDifference } from "./statistics";
import type { EARLY_TRACE_LIMIT } from "./settings";

export interface FeatureRow extends PreparedPuzzle {
  readonly features: Features;
  readonly trace: SingleTrace;
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
  /** The fixed early-strategy experiment uses the first ten placements only. */
  readonly traceLimit?: typeof EARLY_TRACE_LIMIT;
  /** Suppress generic feature searches for a preregistered fixed experiment. */
  readonly fixedModelsOnly?: boolean;
  /** Fixed recipes added only to this experiment, without another feature search. */
  readonly additionalModels?: readonly ModelSpec[];
  /** Eliminated families are removed from every fitting/selection fold. */
  readonly excludedFamilies?: readonly ModelFamily[];
  /** Family evaluation may continue after retiring the aggregate selected row. */
  readonly includeSelected?: boolean;
}

export interface CorrelationRow {
  readonly cohort: string;
  readonly feature: string;
  readonly target: "seconds" | "logSeconds";
  readonly n: number;
  readonly pearson: number | null;
  readonly spearman: number | null;
}

export interface HeldoutPrediction {
  readonly id: string;
  readonly seconds: number;
  readonly batch: string;
  readonly logPrediction: number;
  readonly selected: string;
  readonly selectedFeatures: readonly string[];
  readonly families: readonly {
    family: ModelFamily;
    selected: string | null;
    logPrediction: number | null;
  }[];
}

export interface FamilySummary {
  readonly family: "selected" | ModelFamily;
  readonly evaluated: number;
  readonly total: number;
  readonly heldout: ReturnType<typeof metrics> | null;
  readonly training: ReturnType<typeof metrics> | null;
  readonly finalModel: FittedModel | null;
  readonly personalComparison: HistoricalComparison | null;
}

/** A skipped diagnostic carries its explanation instead of fabricated scores. */
export interface BatchEvaluation {
  readonly batch: string;
  readonly selected: string | null;
  readonly scores: ReturnType<typeof metrics> | null;
  readonly skipped?: string;
}

export interface HistoricalComparison {
  readonly cohort: string;
  readonly evaluation: string;
  readonly model: ReturnType<typeof metrics> | null;
  readonly legacy: { n: number; spearman: number | null; pearson: number | null };
  readonly pairedBootstrap: ReturnType<typeof bootstrapRankDifference> | null;
  readonly skipped?: string;
}

export interface CoefficientRow {
  readonly experiment: string;
  readonly model: string;
  readonly target: FittedModel["target"];
  readonly intercept: number;
  readonly innerCvSpearman: number | null;
  readonly innerCvLogRmse: number;
  readonly [column: `coefficient.${string}`]: number;
}

/** Public experiment output, independent of how runExperiment builds it. */
export interface ExperimentResult {
  readonly name: string;
  readonly includeTrace: boolean;
  readonly traceLimit?: typeof EARLY_TRACE_LIMIT;
  readonly candidateCount: number;
  readonly heldout: readonly HeldoutPrediction[];
  readonly summaries: readonly FamilySummary[];
  readonly batchSensitivity: readonly BatchEvaluation[];
  readonly finalSelection: { winner: ModelSpec; candidates: readonly CandidateResult[] };
  readonly fitted: FittedModel;
  readonly comparisons: readonly HistoricalComparison[];
  readonly coefficients: readonly CoefficientRow[];
  readonly sitePredictions: readonly { id: string; batch: string; seconds: number; logPrediction: number }[];
  readonly perPersonalBatch: readonly { batch: string; scores: ReturnType<typeof metrics> }[];
  readonly heldoutScores: ReturnType<typeof metrics>;
}
