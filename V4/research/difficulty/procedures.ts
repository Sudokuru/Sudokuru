import type { ExperimentSpec } from "./experimentTypes";
import { INITIAL_MODEL_FEATURES } from "./features";
import { TRACE_MODEL_FEATURES } from "./singleTrace";
import { candidateSpecs } from "./models";
import { modelFamily } from "./evaluation";

export const PROCEDURE_FAMILIES = ["selected", "single", "pair", "quadratic", "ridge", "direct", "power"] as const;

export const EXPERIMENTS: readonly ExperimentSpec[] = [
  { name: "initial", features: INITIAL_MODEL_FEATURES, includeTrace: false, additionalModels: [
    { id: "direct:notes", kind: "direct", features: ["notes"], minimumSeconds: 1 },
    { id: "power:notes", kind: "power", features: ["notes"] },
  ] },
  { name: "initial+trace", features: TRACE_MODEL_FEATURES, includeTrace: true },
];

/** Apply manual retirement decisions before generating or fitting candidates. */
export function activeExperiment(
  experiment: ExperimentSpec,
  eliminated: readonly { procedure: string }[],
): ExperimentSpec | null {
  const excluded = PROCEDURE_FAMILIES.filter(family =>
    eliminated.some(record => record.procedure === `${experiment.name}/${family}`));
  const offered = [...candidateSpecs(experiment.features), ...(experiment.additionalModels ?? [])].map(modelFamily);
  const available = PROCEDURE_FAMILIES.filter(family => family === "selected" || offered.includes(family));
  if (available.every(family => excluded.includes(family))) return null;
  return {
    ...experiment,
    excludedFamilies: excluded.filter((family): family is Exclude<typeof family, "selected"> => family !== "selected"),
    includeSelected: experiment.includeSelected !== false && !excluded.includes("selected"),
  };
}
