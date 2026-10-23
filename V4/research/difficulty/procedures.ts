import type { ExperimentSpec } from "./experimentTypes";
import { INITIAL_MODEL_FEATURES } from "./features";
import { TRACE_MODEL_FEATURES } from "./singleTrace";

export const PROCEDURE_FAMILIES = ["selected", "single", "pair", "tree"] as const;

export const EXPERIMENTS: readonly ExperimentSpec[] = [
  { name: "initial", features: INITIAL_MODEL_FEATURES, includeTrace: false },
  { name: "initial+trace", features: TRACE_MODEL_FEATURES, includeTrace: true },
];

/** Apply manual retirement decisions before generating or fitting candidates. */
export function activeExperiment(
  experiment: ExperimentSpec,
  eliminated: readonly { procedure: string }[],
): ExperimentSpec | null {
  const excluded = PROCEDURE_FAMILIES.filter(family =>
    eliminated.some(record => record.procedure === `${experiment.name}/${family}`));
  if (excluded.length === PROCEDURE_FAMILIES.length) return null;
  return {
    ...experiment,
    excludedFamilies: excluded.filter((family): family is "single" | "pair" | "tree" => family !== "selected"),
    includeSelected: !excluded.includes("selected"),
  };
}
