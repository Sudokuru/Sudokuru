import { describe, expect, test } from "bun:test";
import { initialFeatures } from "../features";
import { unitScarcity } from "../unitScarcity";
import { EXPERIMENTS } from "../procedures";
import { experimentCandidates, fitModel, predict } from "../models";
import { nestedCrossValidation } from "../evaluation";
import { rawCoefficients } from "../experiments";
import type { ModelSpec, Observation } from "../modelTypes";

describe("unit candidate scarcity", () => {
  test("counts missing digits across rows, columns and boxes without changing the board", () => {
    const { board } = initialFeatures("0".repeat(81));
    for (let c = 2; c < 9; c++) {
      const cell = board[0][c];
      if (cell.type !== "note") throw new Error("Expected note cell.");
      cell.notes = cell.notes.filter(value => value !== 1);
    }
    const before = JSON.stringify(board);
    expect(unitScarcity(board)).toEqual({ unitMissingDigits: 243, unitOneLocation: 0,
      unitTwoLocations: 1, unitThreeLocations: 0, unitManyLocations: 242, unitTwoLocationFraction: 1 / 243 });
    expect(JSON.stringify(board)).toBe(before);
    expect(unitScarcity(initialFeatures("123456789456789123789123456891234567234567891567891234678912345912345678345678912").board))
      .toEqual({ unitMissingDigits: 0, unitOneLocation: 0, unitTwoLocations: 0, unitThreeLocations: 0,
        unitManyLocations: 0, unitTwoLocationFraction: 0 });
  });

  test("the scarcity-only procedure fits log-time and can be eliminated", () => {
    const experiment = EXPERIMENTS.find(row => row.name === "unit-scarcity")!;
    const all = experimentCandidates(experiment);
    const specs = all.filter(spec => spec.kind !== "constant");
    expect(specs.map(spec => spec.kind)).toEqual(["scarcity"]);
    expect(experiment.includeScarcity).toBe(true);
    for (const spec of specs) {
      const fractions = [0.1, 0.3, 0.2, 0.7, 0.4, 0.9, 0.8];
      const rows: Observation[] = fractions.map((fraction, i) => {
        const outcome = 2 + fraction;
        return { id: String(i), batch: "test", seconds: Math.exp(outcome),
          features: { notes: i + 1, unitTwoLocationFraction: fraction } };
      });
      const model = fitModel(rows, spec);
      if (!model) throw new Error(`Expected ${spec.id} fit.`);
      const coefficients = rawCoefficients(model);
      expect(coefficients.intercept).toBeCloseTo(2, 9);
      coefficients.coefficients.forEach(coefficient => expect(coefficient).toBeCloseTo(1, 9));
      expect(predict(model, rows[0].features)).toBeCloseTo(Math.log(rows[0].seconds), 9);
      const candidates: ModelSpec[] = [spec, { id: "constant", kind: "constant", features: [] }];
      const before = nestedCrossValidation(rows, candidates);
      const after = nestedCrossValidation(rows.map((row, i) => i ? row : { ...row, seconds: 999999 }), candidates);
      expect(after[0].families).toEqual(before[0].families);
    }
  });
});
