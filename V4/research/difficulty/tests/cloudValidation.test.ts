import { describe, expect, test } from "bun:test";
import { loadCloudSudoku, prepareCloudSudoku } from "../cloudSudoku";
import { evaluateCloud, loadLegacyScores, matchLegacyScores } from "../cloudValidation";
import { runExperiment } from "../experiments";
import type { TimedObservation } from "../experimentTypes";

describe("Cloud validation", () => {
  test("scores each final personal-data fit on Cloud observations and keeps legacy in its own units", () => {
    const personal: TimedObservation[] = [1, 2, 3, 4].map(n => ({ id: `p${n}`, batch: "personal",
      kind: "personal", seconds: n * 10, features: { notes: n }, historicalScores: { "legacy.combined": n } }));
    const experiment = runExperiment({ name: "initial", features: ["notes"], includeTrace: false }, personal, [], []);
    if (!experiment) throw new Error("Expected fitted experiment.");
    const records = loadCloudSudoku();
    const cloud = prepareCloudSudoku(records.slice(0, 3));
    const before = JSON.stringify(experiment);
    const legacy = loadLegacyScores(records).slice(0, 3);
    expect(legacy).toEqual([-2555, -3177, -2648]);
    const result = evaluateCloud(cloud, [experiment], legacy);
    expect(result.results.find(row => row.procedure === "initial/single")?.scores.n).toBe(3);
    expect(result.results.find(row => row.procedure === "legacy")?.scores).toMatchObject({ n: 3, logRmse: null, secondsMae: null });
    expect(result.predictions.find(row => row.procedure === "initial/single")?.values).toHaveLength(3);
    expect(JSON.stringify(experiment)).toBe(before);
    expect(() => evaluateCloud(cloud, [experiment], [])).toThrow("aligned");
  });

  test("matches snapshot scores by ID and puzzle, and rejects stale or incomplete data", () => {
    const [a, b] = loadCloudSudoku();
    const csv = `id,puzzle,legacyScore\n${a.id},${a.puzzle},-2555\n${b.id},${b.puzzle},-3177\n`;
    expect(matchLegacyScores([b, a], csv)).toEqual([-3177, -2555]);
    expect(() => matchLegacyScores([a], csv)).toThrow("unmatched");
    expect(() => matchLegacyScores([a, { ...b, puzzle: a.puzzle }], csv)).toThrow("mismatch");
    expect(() => matchLegacyScores([a, a], csv)).toThrow("mismatch");
    expect(() => matchLegacyScores([a, b], `${csv}${a.id},${a.puzzle},0\n`)).toThrow("duplicate");
    expect(() => matchLegacyScores([a, b], csv.replace("-2555", "NaN"))).toThrow("Invalid");
  });
});
