import { describe, expect, test } from "bun:test";
import { EXPERIMENTS, activeExperiment } from "../procedures";
import { experimentCandidates, fitModel, modelTerms, predict } from "../models";
import { rawCoefficients, prepareResearch, runExperiment } from "../experiments";
import { prepareDataset } from "../prepare";
import { DIFFICULTY_RESEARCH_PUZZLES } from "../data";
import { nestedCrossValidation } from "../evaluation";
import type { Observation, CascadeSpec } from "../modelTypes";

const spec: CascadeSpec = { id: "cascade:notes+traceFilledFraction", kind: "cascade", features: ["notes", "traceFilledFraction"] };

describe("fixed full obvious-single cascade procedure", () => {
  test("fits the power baseline plus cascade fraction and holds out the target", () => {
    const fractions = [0, 0.3, 1, 0.5, 0.9, 0.2, 0.7];
    const rows: Observation[] = fractions.map((fraction, i) => ({ id: String(i), batch: "test",
      seconds: Math.exp(1 + 0.2 * Math.log1p(i) - 0.3 * fraction),
      features: { notes: i, traceFilledFraction: fraction } }));
    const model = fitModel(rows, spec);
    if (!model) throw new Error("Expected cascade model.");
    expect(modelTerms(spec)).toEqual(["log1p(notes)", "traceFilledFraction"]);
    const raw = rawCoefficients(model);
    expect(raw.intercept).toBeCloseTo(1, 10);
    expect(raw.coefficients[0]).toBeCloseTo(0.2, 10);
    expect(raw.coefficients[1]).toBeCloseTo(-0.3, 10);
    expect(predict(model, { notes: 9, traceFilledFraction: 0.5 })).toBeCloseTo(1 + 0.2 * Math.log(10) - 0.15, 10);
    const before = nestedCrossValidation(rows, [spec, { id: "constant", kind: "constant", features: [] }]);
    const after = nestedCrossValidation(rows.map((row, i) => i ? row : { ...row, seconds: 99999 }), [spec, { id: "constant", kind: "constant", features: [] }]);
    expect(before[0].families).toEqual(after[0].families);
  });

  test("runs only the fixed cascade recipe on the existing personal observations", () => {
    const experiment = EXPERIMENTS.find(row => row.name === "obvious-cascade")!;
    expect(experimentCandidates(experiment)).toEqual([{ id: "constant", kind: "constant", features: [] }, spec]);
    expect(experiment.includeTrace).toBe(true);
    expect(experiment.traceLimit).toBeUndefined();
    const research = prepareResearch(prepareDataset(DIFFICULTY_RESEARCH_PUZZLES));
    const result = runExperiment(experiment, research.personal, research.site, research.cohorts);
    expect(result?.summaries.find(row => row.family === "cascade")?.evaluated).toBe(22);
    expect(result?.summaries.find(row => row.family === "cascade")?.finalModel?.spec).toEqual(spec);
    expect(activeExperiment(experiment, [{ procedure: "obvious-cascade/cascade" }])).toBeNull();
  });
});
