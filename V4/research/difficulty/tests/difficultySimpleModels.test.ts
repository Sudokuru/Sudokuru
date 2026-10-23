import { describe, expect, test } from "bun:test";
import { fitModel, modelTerms, predict } from "../models";
import { modelFamily, nestedCrossValidation } from "../evaluation";
import { rawCoefficients, runExperiment } from "../experiments";
import { activeExperiment, EXPERIMENTS } from "../procedures";
import { captureElimination } from "../eliminations";
import type { DirectSpec, PowerSpec, Observation } from "../modelTypes";
import type { TimedObservation } from "../experimentTypes";

const direct: DirectSpec = { id: "direct:notes", kind: "direct", features: ["notes"], minimumSeconds: 1 };
const power: PowerSpec = { id: "power:notes", kind: "power", features: ["notes"] };
function observations(notes: readonly number[], seconds: (notes: number) => number): Observation[] {
  return notes.map((value, i) => ({ id: String(i), batch: i % 2 ? "one" : "two",
    seconds: seconds(value), features: { notes: value } }));
}

describe("fixed note-count procedures", () => {
  test("direct-time fitting recovers seconds rather than fitting log-seconds", () => {
    const rows = observations([0, 1, 2, 3, 4], n => 10 + 3 * n);
    const before = JSON.stringify(rows);
    const model = fitModel(rows, direct);
    if (!model || model.kind !== "direct") throw new Error("Expected direct model.");
    expect(model.target).toBe("seconds");
    expect(modelFamily(model.spec)).toBe("direct");
    expect(Math.exp(predict(model, { notes: 5 }))).toBeCloseTo(25, 10);
    const raw = rawCoefficients(model);
    expect(raw.intercept).toBeCloseTo(10, 10);
    expect(raw.coefficients[0]).toBeCloseTo(3, 10);
    expect(predict(model, { notes: -100 })).toBe(0);
    const restored = JSON.parse(JSON.stringify(model));
    expect(predict(restored, { notes: 5 })).toBe(predict(model, { notes: 5 }));
    expect(JSON.stringify(rows)).toBe(before);
  });

  test("power fitting recovers its transformed coefficient and handles zero notes", () => {
    const model = fitModel(observations([0, 1, 3, 7, 15], n => 2 * Math.sqrt(1 + n)), power);
    if (!model || model.kind !== "power") throw new Error("Expected power model.");
    expect(modelFamily(model.spec)).toBe("power");
    expect(modelTerms(model.spec)).toEqual(["log1p(notes)"]);
    expect(model.target).toBe("logSeconds");
    expect(Math.exp(predict(model, { notes: 24 }))).toBeCloseTo(10, 10);
    expect(Math.exp(predict(model, { notes: 0 }))).toBeCloseTo(2, 10);
    const raw = rawCoefficients(model);
    expect(raw.intercept).toBeCloseTo(Math.log(2), 10);
    expect(raw.coefficients[0]).toBeCloseTo(0.5, 10);
    expect(predict(JSON.parse(JSON.stringify(model)), { notes: 24 })).toBe(predict(model, { notes: 24 }));
  });

  test("rejects invalid floors and omits singular or out-of-domain fits", () => {
    for (const minimumSeconds of [0, -1, Infinity, NaN]) {
      expect(() => fitModel(observations([0, 1, 2], n => 10 + n), { ...direct, minimumSeconds })).toThrow("positive finite");
    }
    const constant = observations([1, 1, 1], () => 10);
    expect(fitModel(constant, direct)).toBeNull();
    expect(fitModel(constant, power)).toBeNull();
    expect(fitModel(observations([-1, 0, 1], () => 10), power)).toBeNull();
  });

  test("both fixed procedures exclude each held-out label from fitting and scaling", () => {
    const rows = observations([0, 1, 2, 3, 4, 5, 6], n => 10 + 3 * n);
    const before = nestedCrossValidation(rows, [direct, power]);
    const changed = nestedCrossValidation(rows.map((row, i) => i === 0 ? { ...row, seconds: 99999 } : row), [direct, power]);
    expect(changed[0].families).toEqual(before[0].families);
    expect(changed[0].logPrediction).toBe(before[0].logPrediction);
    expect(before[0].families.map(row => row.family)).toEqual(["direct", "power"]);
    expect(nestedCrossValidation(rows, [direct, power])).toEqual(before);
  });

  test("offers exactly two fixed extra recipes only on initial features", () => {
    const initial = EXPERIMENTS.find(spec => spec.name === "initial")!;
    const trace = EXPERIMENTS.find(spec => spec.name === "initial+trace")!;
    expect(initial.additionalModels).toEqual([direct, power]);
    expect(trace.additionalModels).toBeUndefined();
    const old = ["selected", "single", "pair", "quadratic", "ridge"];
    const retiredOld = old.map(family => ({ procedure: `initial/${family}` }));
    expect(activeExperiment(initial, retiredOld)).not.toBeNull();
    expect(activeExperiment(initial, [...retiredOld, { procedure: "initial/direct" }, { procedure: "initial/power" }])).toBeNull();
    expect(activeExperiment(trace, old.map(family => ({ procedure: `initial+trace/${family}` })))).toBeNull();
  });

  test("exports target units and transformed terms and supports independent elimination", () => {
    const rows: TimedObservation[] = observations([0, 1, 2, 3, 4, 5, 6], n => 10 + 3 * n)
      .map(row => ({ ...row, kind: "personal", historicalScores: { "legacy.combined": row.seconds } }));
    const spec = { name: "initial", features: ["notes"], includeTrace: false, additionalModels: [direct, power] };
    const result = runExperiment(spec, rows, [], [{ name: "personal", rows }]);
    if (!result) throw new Error("Expected result.");
    for (const family of ["direct", "power"]) {
      expect(result.summaries.find(row => row.family === family)?.evaluated).toBe(7);
      const snapshot = captureElimination({ experiments: [result], corpus: { personal: 7 },
        reportContext: { corpusId: "test", settings: { benchmarks: "Skipped" } },
      }, { skipped: true }, `initial/${family}`, "test reason");
      expect(snapshot.procedure).toBe(`initial/${family}`);
    }
    const coefficients = result.coefficients.find(row => row.model === direct.id);
    expect(coefficients?.target).toBe("seconds");
    expect(coefficients?.intercept).toBeCloseTo(10, 10);
    expect(coefficients?.["coefficient.notes"]).toBeCloseTo(3, 10);
    const transformed = result.coefficients.find(row => row.model === power.id);
    expect(transformed?.target).toBe("logSeconds");
    expect(Number.isFinite(transformed?.["coefficient.log1p(notes)"])).toBe(true);
    const plan = activeExperiment(spec, [{ procedure: "initial/direct" }, { procedure: "initial/power" }]);
    const filtered = runExperiment(plan!, rows, [], []);
    expect(filtered?.heldout.every(row => row.families.every(family => family.family !== "direct" && family.family !== "power"))).toBe(true);
    expect(() => runExperiment({ ...spec, features: ["other"] }, rows, [], [])).toThrow("experiment feature set");
  });
});
