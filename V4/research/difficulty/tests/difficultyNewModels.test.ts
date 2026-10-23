import { describe, expect, test } from "bun:test";
import { fitModel, modelTerms, predict } from "../models";
import { nestedCrossValidation, modelFamily } from "../evaluation";
import { rawCoefficients, runExperiment } from "../experiments";
import { activeExperiment } from "../procedures";
import type { ModelSpec, Observation } from "../modelTypes";
import type { TimedObservation } from "../experimentTypes";

function observations(xs: readonly number[], logTime: (x: number) => number): Observation[] {
  return xs.map((x, i) => ({ id: String(i), batch: i % 2 ? "one" : "two", seconds: Math.exp(logTime(x)),
    features: { x, duplicate: x, squared: x * x, fixed: 1 } }));
}
const quadratic: ModelSpec = { id: "quadratic:x", kind: "quadratic", features: ["x"] };
const ridge: ModelSpec = { id: "ridge:1", kind: "ridge", features: ["x"], penalty: 1 };

describe("quadratic and regularized difficulty formulas", () => {
  test("recovers a curved relation and exports both coefficients in original units", () => {
    const rows = observations([-2, -1, 0, 1, 2], x => 1 + 0.2 * x + 0.3 * x * x);
    const before = JSON.stringify(rows);
    const model = fitModel(rows, quadratic);
    if (!model || model.kind !== "quadratic") throw new Error("Expected quadratic model.");
    expect(modelFamily(model.spec)).toBe("quadratic");
    expect(modelTerms(model.spec)).toEqual(["x", "x^2"]);
    expect(predict(model, { x: 1.5 })).toBeCloseTo(1.975, 10);
    expect(predict(model, { x: -3 })).toBeCloseTo(3.1, 10);
    const raw = rawCoefficients(model);
    expect(raw.intercept).toBeCloseTo(1, 10);
    expect(raw.coefficients[0]).toBeCloseTo(0.2, 10);
    expect(raw.coefficients[1]).toBeCloseTo(0.3, 10);
    expect(model.means).toEqual([0, 2]);
    expect(JSON.stringify(rows)).toBe(before);
  });

  test("omits unidentifiable quadratic fits and transformed overflow", () => {
    expect(fitModel(observations([0, 1, 0, 1], x => x), quadratic)).toBeNull();
    expect(fitModel(observations([2, 2, 2], () => 1), quadratic)).toBeNull();
    expect(fitModel(observations([0, 1e200, 2], () => 1), quadratic)).toBeNull();
  });

  test("ridge matches its analytic shrinkage and leaves the intercept unpenalized", () => {
    const rows = observations([-1, 0, 1], x => 2 + x);
    const model = fitModel(rows, ridge);
    if (!model || model.kind !== "ridge") throw new Error("Expected ridge model.");
    expect(modelFamily(model.spec)).toBe("ridge");
    expect(model.intercept).toBeCloseTo(2, 10);
    expect(rawCoefficients(model).coefficients[0]).toBeCloseTo(0.5, 10);
    expect(predict(model, { x: 4 })).toBeCloseTo(4, 10);
    const stronger = fitModel(rows, { ...ridge, penalty: 9 });
    if (!stronger) throw new Error("Expected ridge fit.");
    expect(predict(stronger, { x: 4 })).toBeCloseTo(2.4, 10);
    expect(model.means).toEqual([0]);
    expect(model.scales[0]).toBeCloseTo(Math.sqrt(2 / 3), 10);
  });

  test("ridge handles redundant columns, constants, and more inputs than observations", () => {
    const rows = observations([-1, 0, 1], x => x);
    const duplicate = fitModel(rows, { kind: "ridge", id: "duplicate", features: ["x", "duplicate"], penalty: 1 });
    if (!duplicate) throw new Error("Expected ridge fit.");
    expect(predict(duplicate, { x: 3, duplicate: 3 })).toBeCloseTo(2, 10);
    const wide = fitModel(rows, { kind: "ridge", id: "wide", features: ["x", "duplicate", "squared", "fixed"], penalty: 1 });
    if (!wide || wide.kind !== "ridge") throw new Error("Expected wide ridge fit.");
    expect(wide.coefficients.every(Number.isFinite)).toBe(true);
    expect(wide.coefficients[3]).toBeCloseTo(0, 10);
    expect(Number.isFinite(predict(wide, { x: 2, duplicate: 2, squared: 4, fixed: 1 }))).toBe(true);
  });

  test.each([0, -1, Infinity, NaN])("rejects invalid ridge penalty %s", penalty => {
    expect(() => fitModel(observations([-1, 0, 1], x => x), { ...ridge, penalty })).toThrow("positive finite penalty");
  });

  test("nested quadratic feature choice and ridge penalty choice never see the held-out label", () => {
    const rows = observations([-3, -2, -1, 0, 1, 2, 3], x => 2 + 0.1 * x + 0.1 * x * x);
    const specs: ModelSpec[] = [quadratic, ridge,
      { kind: "ridge", id: "ridge:0.1", features: ["x", "squared"], penalty: 0.1 },
      { kind: "quadratic", id: "quadratic:squared", features: ["squared"] },
    ];
    const before = nestedCrossValidation(rows, specs);
    const changed = nestedCrossValidation(rows.map((row, i) => i === 0 ? { ...row, seconds: 10000 } : row), specs);
    expect(changed[0].selected).toBe(before[0].selected);
    expect(changed[0].logPrediction).toBe(before[0].logPrediction);
    expect(changed[0].families).toEqual(before[0].families);
    expect(before[0].families.map(row => row.family)).toEqual(["quadratic", "ridge"]);
    expect(nestedCrossValidation(rows, specs)).toEqual(before);
  });

  test("new families produce held-out results and correct coefficient exports, and can be eliminated", () => {
    const rows: TimedObservation[] = observations([-3, -2, -1, 0, 1, 2, 3], x => 2 + 0.1 * x + 0.1 * x * x)
      .map(row => ({ ...row, kind: "personal", historicalScores: { "legacy.combined": row.seconds } }));
    const spec = { name: "new", features: ["x", "squared"], includeTrace: false };
    const result = runExperiment(spec, rows, [], [{ name: "personal", rows }]);
    if (!result) throw new Error("Expected experiment.");
    for (const family of ["quadratic", "ridge"]) {
      const summary = result.summaries.find(row => row.family === family);
      expect(summary?.evaluated).toBe(7);
      expect(summary?.heldout?.n).toBe(7);
      expect(summary?.personalComparison?.model?.n).toBe(7);
    }
    const exported = result.coefficients.find(row => row.model === "quadratic:x");
    expect(exported?.["coefficient.x"]).toBeCloseTo(0.1, 10);
    expect(exported?.["coefficient.x^2"]).toBeCloseTo(0.1, 10);
    expect(exported?.intercept).toBeCloseTo(2, 10);
    const filtered = activeExperiment(spec, [{ procedure: "new/quadratic" }, { procedure: "new/ridge" }]);
    const oldFamiliesOnly = runExperiment(filtered!, rows, [], []);
    expect(oldFamiliesOnly?.finalSelection.candidates.every(row => row.spec.kind !== "quadratic" && row.spec.kind !== "ridge")).toBe(true);
    expect(oldFamiliesOnly?.heldout.every(row => row.families.every(family => family.family !== "quadratic" && family.family !== "ridge"))).toBe(true);
  });
});
