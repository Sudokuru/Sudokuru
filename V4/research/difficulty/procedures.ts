import type { ExperimentSpec } from "./experimentTypes";
import { INITIAL_MODEL_FEATURES } from "./features";
import { TRACE_MODEL_FEATURES } from "./singleTrace";
import { experimentCandidates } from "./models";
import { modelFamily } from "./evaluation";
import { EARLY_TRACE_LIMIT } from "./settings";

export const PROCEDURE_FAMILIES = ["selected", "single", "pair", "quadratic", "ridge", "direct", "power", "reduction", "bottleneck", "cascade"] as const;

export const EXPERIMENTS: readonly ExperimentSpec[] = [
  { name: "initial", features: INITIAL_MODEL_FEATURES, includeTrace: false, additionalModels: [
    { id: "direct:notes", kind: "direct", features: ["notes"], minimumSeconds: 1 },
    { id: "power:notes", kind: "power", features: ["notes"] },
  ] },
  { name: "initial+trace", features: TRACE_MODEL_FEATURES, includeTrace: true },
  { name: "obvious-cascade", features: ["notes", "traceFilledFraction"], includeTrace: true,
    fixedModelsOnly: true, includeSelected: false, additionalModels: [
      { id: "cascade:notes+traceFilledFraction", kind: "cascade", features: ["notes", "traceFilledFraction"] },
    ] },
  { name: "early-singles", features: ["notes", "earlyCandidateReduction10", "earlyBottleneck10"],
    includeTrace: true, traceLimit: EARLY_TRACE_LIMIT, fixedModelsOnly: true, includeSelected: false,
    additionalModels: [
      { id: "reduction:notes+earlyCandidateReduction10", kind: "reduction", features: ["notes", "earlyCandidateReduction10"] },
      { id: "bottleneck:notes+earlyBottleneck10", kind: "bottleneck", features: ["notes", "earlyBottleneck10"] },
    ],
  },
];

/** Apply manual retirement decisions before generating or fitting candidates. */
export function activeExperiment(
  experiment: ExperimentSpec,
  eliminated: readonly { procedure: string }[],
): ExperimentSpec | null {
  const excluded = PROCEDURE_FAMILIES.filter(family =>
    eliminated.some(record => record.procedure === `${experiment.name}/${family}`));
  const offered = experimentCandidates(experiment).map(modelFamily);
  const available = PROCEDURE_FAMILIES.filter(family => family === "selected" ? experiment.includeSelected !== false : offered.includes(family));
  if (available.every(family => excluded.includes(family))) return null;
  return {
    ...experiment,
    excludedFamilies: excluded.filter((family): family is Exclude<typeof family, "selected"> => family !== "selected"),
    includeSelected: experiment.includeSelected !== false && !excluded.includes("selected"),
  };
}
