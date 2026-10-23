import { describe, expect, test } from "bun:test";
import { singleTrace } from "../singleTrace";
import { initialFeatures } from "../features";
import { EARLY_TRACE_LIMIT } from "../settings";
import { prepareDataset } from "../prepare";
import { DIFFICULTY_RESEARCH_PUZZLES } from "../data";
import { prepareResearch, rawCoefficients, runExperiment } from "../experiments";
import { fitModel, predict, modelTerms, experimentCandidates } from "../models";
import { nestedCrossValidation } from "../evaluation";
import { activeExperiment, EXPERIMENTS } from "../procedures";
import { captureElimination } from "../eliminations";
import { renderReport } from "../report";
import { SOLVED_TEST_BOARDS } from "../../../tests/utils/testBoards";
import type { Observation, StrategySpec } from "../modelTypes";
import type { TimedObservation } from "../experimentTypes";

const solution = SOLVED_TEST_BOARDS[9];
// Four holes: (0,0)=[1], (0,1)=[1,2], (0,2)=[3], (7,1)=[1].
const chain = "000456789456789123789123456891234567234567891567891234678912345902345678345678912";
const reduction: StrategySpec = { id: "reduction:test", kind: "reduction", features: ["notes", "earlyCandidateReduction10"] };
const bottleneck: StrategySpec = { id: "bottleneck:test", kind: "bottleneck", features: ["notes", "earlyBottleneck10"] };

describe("fixed early obvious-single strategy measurements", () => {
  test("counts actual peer removals, observed branching, and forced moves on a known chain", () => {
    const initial = initialFeatures(chain);
    const before = JSON.stringify(initial.board);
    const full = singleTrace(initial.board, solution);
    expect(initial.features.notes).toBe(5);
    expect(full.availability).toEqual([3, 3, 2, 1]);
    expect(full.features.earlyCandidateReduction10).toBe(1);
    expect(full.features.earlyBottleneck10).toBeCloseTo(13 / 6, 12);
    expect(full.early).toEqual({ limit: 10, placements: 4, candidatesBefore: 5, candidatesAfter: 0, forcedMoves: 1 });
    const one = singleTrace(initial.board, solution, 1);
    expect(one.status).toBe("limited");
    expect(one.placements.length).toBe(1);
    expect(one.early).toEqual({ limit: 10, placements: 1, candidatesBefore: 5, candidatesAfter: 3, forcedMoves: 0 });
    expect(one.features.earlyCandidateReduction10).toBe(1);
    expect(one.features.earlyBottleneck10).toBe(1 / 3);
    expect(JSON.stringify(initial.board)).toBe(before);
  });

  test("stops at the ten-placement budget and preserves the full trace's prefix measurements", () => {
    // Empty column 0 plus column 1 in the first three rows: 12 solvable holes.
    const values = solution.flat().map(String);
    for (const index of [0, 1, 9, 10, 18, 19, 27, 36, 45, 54, 63, 72]) values[index] = "0";
    const { board } = initialFeatures(values.join(""));
    const full = singleTrace(board, solution);
    const limited = singleTrace(board, solution, EARLY_TRACE_LIMIT);
    expect(full.status).toBe("solved");
    expect(full.placements.length).toBe(12);
    expect(limited.status).toBe("limited");
    expect(limited.placements.length).toBe(10);
    expect(limited.availability).toEqual(full.availability.slice(0, 10));
    expect(limited.features.earlyCandidateReduction10).toBe(3);
    expect(limited.features.earlyBottleneck10).toBe(full.features.earlyBottleneck10);
    expect(limited.early).toEqual(full.early);
    expect(limited.early.placements).toBe(10);
  });

  test("solved and stalled boards produce zero observations without fabricated bottlenecks", () => {
    for (const puzzle of [solution.flat().join(""), "0".repeat(81)]) {
      const trace = singleTrace(initialFeatures(puzzle).board, solution, 10);
      expect(trace.early.placements).toBe(0);
      expect(trace.features.earlyCandidateReduction10).toBe(0);
      expect(trace.features.earlyBottleneck10).toBe(0);
      expect(trace.early.forcedMoves).toBe(0);
    }
    expect(singleTrace(initialFeatures(chain).board, solution, 0).features.earlyBottleneck10).toBe(0);
    for (const limit of [-1, 1.5, 82, NaN]) {
      expect(() => singleTrace(initialFeatures(chain).board, solution, limit)).toThrow("placement limit");
    }
  });

  test("training features match bounded inference for every corpus puzzle", () => {
    const { featureRows } = prepareResearch(prepareDataset(DIFFICULTY_RESEARCH_PUZZLES));
    for (const row of featureRows) {
      const bounded = singleTrace(initialFeatures(row.record.puzzle).board, row.solution, 10);
      expect(bounded.features.earlyCandidateReduction10).toBe(row.features.earlyCandidateReduction10);
      expect(bounded.features.earlyBottleneck10).toBe(row.features.earlyBottleneck10);
      expect(bounded.early).toEqual(row.trace.early);
      expect(bounded.placements.length).toBeLessThanOrEqual(10);
    }
  });

  test("fits each power-baseline-plus-one-signal formula and exports its transformed terms", () => {
    for (const spec of [reduction, bottleneck]) {
      const signal = [0, 1, 0, 2, 1, 3, 2];
      const rows: Observation[] = signal.map((value, i) => ({ id: String(i), batch: "one",
        seconds: Math.exp(1 + 0.2 * Math.log1p(i) + 0.3 * value),
        features: { notes: i, [spec.features[1]]: value },
      }));
      const model = fitModel(rows, spec);
      if (!model) throw new Error("Expected strategy fit.");
      expect(modelTerms(spec)).toEqual(["log1p(notes)", spec.features[1]]);
      const raw = rawCoefficients(model);
      expect(raw.intercept).toBeCloseTo(1, 10);
      expect(raw.coefficients[0]).toBeCloseTo(0.2, 10);
      expect(raw.coefficients[1]).toBeCloseTo(0.3, 10);
      expect(predict(model, { notes: 9, [spec.features[1]]: 2 })).toBeCloseTo(1.6 + 0.2 * Math.log(10), 10);
      const original = nestedCrossValidation(rows, [spec, { kind: "constant", id: "constant", features: [] }]);
      const changed = nestedCrossValidation(rows.map((row, i) => i === 0 ? { ...row, seconds: 99999 } : row), [spec, { kind: "constant", id: "constant", features: [] }]);
      expect(changed[0].families).toEqual(original[0].families);
    }
  });

  test("offers exactly two independent fixed procedures with no search and supports elimination", () => {
    const experiment = EXPERIMENTS.find(row => row.name === "early-singles")!;
    expect(experiment.traceLimit).toBe(10);
    expect(experimentCandidates(experiment).map(row => row.kind)).toEqual(["constant", "reduction", "bottleneck"]);
    const notes = [1, 2, 3, 4, 5, 6, 7];
    const values = [0, 1, 0, 2, 1, 3, 2];
    const rows: TimedObservation[] = notes.map((n, i) => ({ id: String(i), batch: i % 2 ? "one" : "two",
      seconds: Math.exp(1 + 0.2 * Math.log1p(n) + 0.3 * values[i]), kind: "personal",
      features: { notes: n, earlyCandidateReduction10: values[i], earlyBottleneck10: values[i] },
      historicalScores: { "legacy.combined": i },
    }));
    const result = runExperiment(experiment, rows, [], [{ name: "personal", rows }]);
    if (!result) throw new Error("Expected experiment.");
    expect(result.summaries.map(row => row.family)).toEqual(["constant", "reduction", "bottleneck"]);
    const report = renderReport([result], [], { unique: 7, personal: 7, siteAverage: 0, untimed: 0 }, null);
    expect(report).not.toContain("early-singles/pair versus");
    expect(report).not.toContain("early-singles/quadratic versus");
    for (const family of ["reduction", "bottleneck"]) {
      expect(result.summaries.find(row => row.family === family)?.evaluated).toBe(7);
      expect(captureElimination({ experiments: [result], corpus: { personal: 7 },
        reportContext: { corpusId: "test", settings: { benchmarks: "Skipped" } },
      }, { skipped: true }, `early-singles/${family}`, "test").procedure).toBe(`early-singles/${family}`);
    }
    const oneRetired = activeExperiment(experiment, [{ procedure: "early-singles/reduction" }]);
    const filtered = runExperiment(oneRetired!, rows, [], []);
    expect(filtered?.summaries.some(row => row.family === "reduction")).toBe(false);
    expect(filtered?.summaries.some(row => row.family === "bottleneck")).toBe(true);
    expect(activeExperiment(experiment, ["reduction", "bottleneck"].map(family => ({ procedure: `early-singles/${family}` })))).toBeNull();
  });
});
