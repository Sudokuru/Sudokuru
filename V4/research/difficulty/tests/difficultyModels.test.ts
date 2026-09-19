import { candidateSpecs, fitModel, predict } from "../models";
import { modelFamily, nestedCrossValidation, selectModel } from "../evaluation";
import type { Observation, ModelSpec } from "../modelTypes";

describe("small research models", () => {
  const rows: Observation[] = [
    { id: "a", batch: "one", seconds: 1, features: { x: 0 } },
    { id: "b", batch: "one", seconds: 7.38905609893065, features: { x: 1 } },
    { id: "c", batch: "two", seconds: 54.598150033144236, features: { x: 2 } },
  ];
  const linear: ModelSpec = { id: "linear:x", kind: "linear", features: ["x"] };

  test.each([
    ["single", { id: "one", kind: "linear", features: ["x"] }],
    ["pair", { id: "two", kind: "linear", features: ["x", "y"] }],
    ["multivariate", { id: "three", kind: "linear", features: ["x", "y", "z"] }],
    ["constant", { id: "constant", kind: "constant", features: [] }],
    ["tree", { id: "tree", kind: "tree", features: ["x"], depth: 1, minLeaf: 3 }],
  ] satisfies [string, ModelSpec][])("labels the %s family", (family, spec) => {
    expect(modelFamily(spec)).toBe(family);
  });

  test("constant models store only their prediction state", () => {
    const model = fitModel(rows, { id: "constant", kind: "constant", features: [] })!;
    expect(model).toEqual({
      kind: "constant",
      spec: { id: "constant", kind: "constant", features: [] },
      target: "logSeconds",
      intercept: 2,
    });
    expect(predict(model, {})).toBe(2);
  });

  test("selection discards a candidate when even one training fold is singular", () => {
    const data: Observation[] = [
      { id: "a", batch: "one", seconds: 1, features: { x: 0 } },
      { id: "b", batch: "one", seconds: 2, features: { x: 0 } },
      { id: "c", batch: "one", seconds: 3, features: { x: 1 } },
    ];
    const baseline: ModelSpec = { id: "constant", kind: "constant", features: [] };
    const result = selectModel(data, [linear, baseline]);
    expect(result.winner.id).toBe("constant");
    expect(result.candidates.map(candidate => candidate.spec.id)).toEqual(["constant"]);
    expect(result.candidates[0].scores.n).toBe(3);
    expect(() => selectModel(data, [linear])).toThrow("No valid candidate models.");
  });

  test("selection discards predictions that overflow when converted to seconds", () => {
    const data: Observation[] = [
      { id: "a", batch: "one", seconds: 1, features: { x: 0 } },
      { id: "b", batch: "one", seconds: 7.38905609893065, features: { x: 1 } },
      { id: "c", batch: "one", seconds: 3, features: { x: 1000 } },
    ];
    const result = selectModel(data, [
      linear,
      { id: "constant", kind: "constant", features: [] },
    ]);
    expect(result.candidates.map(candidate => candidate.spec.id)).toEqual(["constant"]);
  });

  test("fits an exact log-linear relation and retains training-only scaling", () => {
    const model = fitModel(rows, linear)!;
    if (model.kind !== "linear") throw new Error("Expected linear model.");
    expect(model.intercept).toBeCloseTo(2);
    expect(model.means).toEqual([1]);
    expect(model.scales[0]).toBeCloseTo(0.816496580927726);
    expect(predict(model, { x: 1.5 })).toBeCloseTo(3);
    expect(predict(model, { x: 3 })).toBeCloseTo(6);
  });

  test("constant features omit singular linear fits", () => {
    const constantRows = rows.map(row => ({ ...row, features: { x: 1 } }));
    expect(fitModel(constantRows, linear)).toBeNull();
  });

  test("fits a known combination of two independent features", () => {
    const data: Observation[] = [
      { id: "a", batch: "one", seconds: 2.718281828459045, features: { x: 0, z: 0 } },
      { id: "b", batch: "one", seconds: 20.085536923187668, features: { x: 1, z: 0 } },
      { id: "c", batch: "two", seconds: 54.598150033144236, features: { x: 0, z: 1 } },
      { id: "d", batch: "two", seconds: 403.4287934927351, features: { x: 1, z: 1 } },
    ];
    const model = fitModel(data, { id: "pair", kind: "linear", features: ["x", "z"] })!;
    if (model.kind !== "linear") throw new Error("Expected linear model.");
    expect(model.intercept).toBeCloseTo(3.5);
    expect(model.coefficients[0]).toBeCloseTo(1);
    expect(model.coefficients[1]).toBeCloseTo(1.5);
    expect(predict(model, { x: 2, z: 3 })).toBeCloseTo(14);
  });

  test("fits three features without a special-case solver", () => {
    const data: Observation[] = [
      { id: "a", batch: "one", seconds: 2.718281828459045, features: { x: 0, y: 0, z: 0 } },
      { id: "b", batch: "one", seconds: 7.38905609893065, features: { x: 1, y: 0, z: 0 } },
      { id: "c", batch: "one", seconds: 20.085536923187668, features: { x: 0, y: 1, z: 0 } },
      { id: "d", batch: "one", seconds: 54.598150033144236, features: { x: 0, y: 0, z: 1 } },
    ];
    const before = JSON.stringify(data);
    const model = fitModel(data, { id: "three", kind: "linear", features: ["x", "y", "z"] })!;
    expect(predict(model, { x: 2, y: 3, z: 4 })).toBeCloseTo(21, 10);
    expect(JSON.stringify(data)).toBe(before);
  });

  test("fits nearly redundant features without forming normal equations", () => {
    // The small difference between x and z is real information, not exact redundancy.
    const data: Observation[] = [
      { id: "a", batch: "one", seconds: 1, features: { x: 0, z: 0 } },
      { id: "b", batch: "one", seconds: 7.38905609893065, features: { x: 1, z: 1 } },
      { id: "c", batch: "one", seconds: 54.598150033144236, features: { x: 2, z: 2.000001 } },
      { id: "d", batch: "one", seconds: 403.4287934927351, features: { x: 3, z: 3 } },
    ];
    const model = fitModel(data, { id: "pair", kind: "linear", features: ["x", "z"] })!;
    expect(predict(model, { x: 4, z: 5 })).toBeCloseTo(8, 6);
  });

  test.each([
    ["redundant x/z", ["x", "z"]],
    ["redundant z/x", ["z", "x"]],
    ["constant first feature", ["fixed", "x"]],
    ["constant second feature", ["x", "fixed"]],
  ] satisfies [string, string[]][])("omits singular fits with %s", (_label, features) => {
    const data: Observation[] = [
      { id: "a", batch: "one", seconds: 1, features: { x: 0, z: 2, fixed: 1 } },
      { id: "b", batch: "one", seconds: 7.38905609893065, features: { x: 1, z: 4, fixed: 1 } },
      { id: "c", batch: "one", seconds: 54.598150033144236, features: { x: 2, z: 6, fixed: 1 } },
    ];
    expect(fitModel(data, { id: "pair", kind: "linear", features })).toBeNull();
  });

  test("a shallow tree finds a known split and respects its minimum leaf size", () => {
    const step: Observation[] = [
      { id: "a", batch: "one", seconds: 1, features: { x: 0 } },
      { id: "b", batch: "one", seconds: 1, features: { x: 1 } },
      { id: "c", batch: "one", seconds: 1, features: { x: 2 } },
      { id: "d", batch: "two", seconds: 7.38905609893065, features: { x: 3 } },
      { id: "e", batch: "two", seconds: 7.38905609893065, features: { x: 4 } },
      { id: "f", batch: "two", seconds: 7.38905609893065, features: { x: 5 } },
    ];
    const spec: ModelSpec = { id: "tree", kind: "tree", features: ["x"], depth: 1, minLeaf: 3 };
    const model = fitModel(step, spec)!;
    if (model.kind !== "tree") throw new Error("Expected tree model.");
    expect(model.tree).toEqual({ feature: "x", threshold: 2.5, left: { value: 0 }, right: { value: 2 } });
    expect(predict(model, { x: 2.5 })).toBe(0);
    expect(predict(model, { x: 2.6 })).toBe(2);
    const minimumLeaf = fitModel(step, { ...spec, minLeaf: 5 })!;
    const zeroDepth = fitModel(step, { ...spec, depth: 0 })!;
    if (minimumLeaf.kind !== "tree" || zeroDepth.kind !== "tree") throw new Error("Expected tree models.");
    expect(minimumLeaf.tree).toEqual({ value: 1 });
    expect(zeroDepth.tree).toEqual({ value: 1 });
  });

  test("trees split recursively until their depth limit", () => {
    // Log-times are 0, 0, 2, 4: the right branch needs a second split.
    const data: Observation[] = [
      { id: "a", batch: "one", seconds: 1, features: { x: 0 } },
      { id: "b", batch: "one", seconds: 1, features: { x: 1 } },
      { id: "c", batch: "one", seconds: 7.38905609893065, features: { x: 2 } },
      { id: "d", batch: "one", seconds: 54.598150033144236, features: { x: 3 } },
    ];
    const spec: ModelSpec = { id: "tree", kind: "tree", features: ["x"], depth: 2, minLeaf: 1 };
    const model = fitModel(data, spec)!;
    const shallow = fitModel(data, { ...spec, depth: 1 })!;
    if (model.kind !== "tree" || shallow.kind !== "tree") throw new Error("Expected tree models.");
    expect(model.tree).toEqual({
      feature: "x", threshold: 1.5, left: { value: 0 },
      right: { feature: "x", threshold: 2.5, left: { value: 2 }, right: { value: 4 } },
    });
    expect(shallow.tree).toEqual({
      feature: "x", threshold: 1.5, left: { value: 0 }, right: { value: 3 },
    });
    expect(predict(model, { x: 2.5 })).toBe(2);
    expect(predict(model, { x: 3 })).toBe(4);
  });

  test("equal-gain tree splits prefer the first feature and lowest threshold", () => {
    // Both columns are identical; both possible thresholds reduce error equally.
    const data: Observation[] = [
      { id: "a", batch: "one", seconds: 1, features: { x: 0, z: 0 } },
      { id: "b", batch: "one", seconds: 7.38905609893065, features: { x: 1, z: 1 } },
      { id: "c", batch: "one", seconds: 1, features: { x: 2, z: 2 } },
    ];
    const model = fitModel(data, { id: "tree", kind: "tree", features: ["z", "x"], depth: 1, minLeaf: 1 })!;
    if (model.kind !== "tree") throw new Error("Expected tree model.");
    expect(model.tree).toEqual({
      feature: "z", threshold: 0.5, left: { value: 0 }, right: { value: 1 },
    });
  });

  test("equal scores prefer simpler models before alphabetical IDs", () => {
    const data: Observation[] = [
      { id: "a", batch: "one", seconds: 1, features: { x: 0 } },
      { id: "b", batch: "one", seconds: 1, features: { x: 1 } },
      { id: "c", batch: "one", seconds: 1, features: { x: 2 } },
    ];
    const result = selectModel(data, [
      { id: "a-tree", kind: "tree", features: ["x"], depth: 1, minLeaf: 1 },
      { id: "z-constant", kind: "constant", features: [] },
      { id: "b-constant", kind: "constant", features: [] },
    ]);
    expect(result.candidates.map(candidate => candidate.spec.id)).toEqual(["b-constant", "z-constant", "a-tree"]);
    expect(result.winner.id).toBe("b-constant");
  });

  test("equal rank correlation prefers lower log-time error before IDs", () => {
    // x predicts log-time exactly; z preserves ordering but exaggerates the last time.
    const data: Observation[] = [
      { id: "a", batch: "one", seconds: 1, features: { x: 0, z: 0 } },
      { id: "b", batch: "one", seconds: 2.718281828459045, features: { x: 1, z: 1 } },
      { id: "c", batch: "one", seconds: 7.38905609893065, features: { x: 2, z: 2 } },
      { id: "d", batch: "one", seconds: 20.085536923187668, features: { x: 3, z: 3 } },
      { id: "e", batch: "one", seconds: 54.598150033144236, features: { x: 4, z: 5 } },
    ];
    const result = selectModel(data, [
      { id: "a-noisy", kind: "linear", features: ["z"] },
      { id: "z-exact", kind: "linear", features: ["x"] },
    ]);
    expect(result.winner.id).toBe("z-exact");
    expect(result.candidates.map(candidate => candidate.scores.spearman)).toEqual([1, 1]);
    expect(result.candidates[0].scores.logRmse).toBeCloseTo(0);
    expect(result.candidates[1].scores.logRmse).toBeGreaterThan(0.1);
  });

  test("rank correlation takes priority even when log-time error is worse", () => {
    const data: Observation[] = [
      { id: "a", batch: "one", seconds: 1, features: { x: 0, z: 0 } },
      { id: "b", batch: "one", seconds: 2.718281828459045, features: { x: 1, z: 1 } },
      { id: "c", batch: "one", seconds: 7.38905609893065, features: { x: 2, z: 2 } },
      { id: "d", batch: "one", seconds: 20.085536923187668, features: { x: 4, z: 3 } },
      { id: "e", batch: "one", seconds: 54.598150033144236, features: { x: 3, z: 8 } },
    ];
    const result = selectModel(data, [
      { id: "lower-error", kind: "linear", features: ["x"] },
      { id: "better-ranking", kind: "linear", features: ["z"] },
    ]);
    expect(result.winner.id).toBe("better-ranking");
    expect(result.candidates[0].scores.spearman).toBeCloseTo(1);
    expect(result.candidates[1].scores.spearman).toBeCloseTo(0.9);
    expect(result.candidates[0].scores.logRmse).toBeCloseTo(1.946343);
    expect(result.candidates[1].scores.logRmse).toBeCloseTo(1.161016);
  });

  test("outer held-out labels cannot affect selection, scaling, or predictions", () => {
    const data = [...rows, { id: "d", batch: "two", seconds: 403.4287934927351, features: { x: 3 } }];
    const before = JSON.stringify(data);
    const specs = candidateSpecs(["x"]);
    const original = nestedCrossValidation(data, specs);
    const changed = nestedCrossValidation(data.map((row, i) => i === 0 ? { ...row, seconds: 10000 } : row), specs);
    expect(changed[0].selected).toBe(original[0].selected);
    expect(changed[0].logPrediction).toBe(original[0].logPrediction);
    expect(changed[0].families).toEqual(original[0].families);
    expect(nestedCrossValidation(data, specs)).toEqual(original);
    for (const result of original) {
      const selectedFamily = result.families.find(family => family.selected === result.selected)!;
      expect(selectedFamily.logPrediction).toBe(result.logPrediction);
    }
    expect(JSON.stringify(data)).toBe(before);
    expect(() => nestedCrossValidation([...data, data[0]], specs)).toThrow("unique puzzle");
  });
});
