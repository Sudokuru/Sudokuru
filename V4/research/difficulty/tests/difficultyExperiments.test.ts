import { predictionSummary, rawCoefficients, runExperiment, prepareResearch } from "../experiments";
import { renderReport } from "../report";
import { runBenchmarks } from "../benchmarks";
import { prepareDataset } from "../prepare";
import { DIFFICULTY_RESEARCH_PUZZLES } from "../data";
import type { TimedObservation } from "../experimentTypes";

describe("research experiment reporting", () => {
  test("empty reports explicitly explain missing experiments without claiming useful correlations", () => {
    const report = renderReport([], [], { unique: 0, personal: 0, siteAverage: 0, untimed: 0 }, null);
    expect(report).toContain("No experiments ran");
    expect(report).toContain("No results available.");
    expect(report).toContain("personal Pearson n/a and Spearman n/a");
    expect(report).not.toContain("promising");
    expect(report).not.toContain("Candidate counts are .");
    expect(report).not.toContain("Prediction percentiles describe");
  });

  test("reports describe supplied benchmark metadata and weak correlations neutrally", () => {
    const report = renderReport([], [
      { cohort: "personal", feature: "notes", target: "seconds", n: 4, pearson: 0.01, spearman: -0.1 },
    ], { unique: 4, personal: 4, siteAverage: 0, untimed: 0 }, {
      runtime: { node: "test" }, platform: "test", arch: "test", cpu: "test",
      preparationMs: 2, warmupPasses: 2, measuredPasses: 3, predictionBatch: 17,
      corpusSize: 4, checksum: 1,
      benchmarks: [{ name: "prediction", p50Ms: 0.1, p95Ms: 0.2, puzzlesPerSecond: 10, samples: 12, callsPerSample: 17 }],
    });
    expect(report).toContain("batches of 17 calls");
    expect(report).toContain("2 warmup passes and 3 measured passes over 4 puzzles");
    expect(report).toContain("personal Pearson 0.010 and Spearman -0.100");
    expect(report).not.toContain("promising");
  });

  test("empty benchmark input warns and returns no measurements", () => {
    const warnings: string[] = [];
    const originalWarn = console.warn;
    console.warn = message => warnings.push(String(message));
    try {
      expect(runBenchmarks([], [], 0)).toBeNull();
      expect(warnings).toEqual(["Too little data for benchmarks: no puzzles to measure."]);
    } finally {
      console.warn = originalWarn;
    }
  });
  test("benchmarks report extraction and prediction sample structure", () => {
    const { featureRows, personal, site, cohorts } = prepareResearch(prepareDataset(DIFFICULTY_RESEARCH_PUZZLES));
    // No input features keeps model training trivial while exercising prediction timings.
    const experiment = runExperiment({ name: "baseline", features: [], includeTrace: false }, personal, site, cohorts);
    if (!experiment) throw new Error("Expected experiment result.");
    const result = runBenchmarks(featureRows.slice(0, 1), [experiment], 12.5);
    if (!result) throw new Error("Expected benchmark results.");
    expect(result.preparationMs).toBe(12.5);
    expect(result.corpusSize).toBe(1);
    expect(result.warmupPasses).toBe(5);
    expect(result.measuredPasses).toBe(20);
    expect(result.predictionBatch).toBe(1000);
    expect(Number.isFinite(result.checksum)).toBe(true);
    expect(result.benchmarks.map(({ name, samples, callsPerSample }) => ({ name, samples, callsPerSample }))).toEqual([
      { name: "initial extraction (includes parsing)", samples: 20, callsPerSample: 1 },
      { name: "trace extraction (initialized board + prepared solution)", samples: 20, callsPerSample: 1 },
      { name: "baseline/selected prediction", samples: 20, callsPerSample: 1000 },
      { name: "baseline/constant prediction", samples: 20, callsPerSample: 1000 },
      { name: "baseline/tree prediction", samples: 20, callsPerSample: 1000 },
      { name: "baseline extraction + selected prediction", samples: 20, callsPerSample: 1 },
    ]);
    // Timings vary by machine; only their validity and ordering are contractual.
    for (const measurement of result.benchmarks) {
      expect(Number.isFinite(measurement.p50Ms)).toBe(true);
      expect(Number.isFinite(measurement.p95Ms)).toBe(true);
      expect(measurement.p50Ms).toBeGreaterThanOrEqual(0);
      expect(measurement.p95Ms).toBeGreaterThanOrEqual(measurement.p50Ms);
    }
  });

  test("reports partial and absent prediction coverage explicitly", () => {
    const partial = predictionSummary([1, 10, 1], [0, null, 0]);
    expect(partial.evaluated).toBe(2);
    expect(partial.total).toBe(3);
    expect(partial.scores).toEqual({ n: 2, spearman: null, pearson: null, logRmse: 0, secondsMae: 0 });
    expect(predictionSummary([1, 10], [null, null])).toEqual({ evaluated: 0, total: 2, scores: null });
  });

  test("converts standardized coefficients into one raw formula", () => {
    expect(rawCoefficients({
      kind: "linear", target: "logSeconds",
      spec: { id: "pair", kind: "linear", features: ["x", "y"] },
      intercept: 10, coefficients: [4, 6], means: [1, 2], scales: [2, 3],
    })).toEqual({ intercept: 4, coefficients: [2, 2] });
    expect(rawCoefficients({
      kind: "constant", target: "logSeconds",
      spec: { id: "constant", kind: "constant", features: [] }, intercept: 3,
    })).toEqual({ intercept: 3, coefficients: [] });
  });

  test("too-small experiments and diagnostics return unavailable results", () => {
    const rows: TimedObservation[] = [
      { id: "a", batch: "one", kind: "personal", seconds: 1, features: { x: 1 }, historicalScores: { "legacy.combined": 1 } },
      { id: "b", batch: "one", kind: "personal", seconds: 2, features: { x: 1 }, historicalScores: { "legacy.combined": 2 } },
      { id: "c", batch: "one", kind: "personal", seconds: 3, features: { x: 1 }, historicalScores: { "legacy.combined": 3 } },
    ];
    const spec = { name: "small", features: ["x"], includeTrace: false };
    const warnings: string[] = [];
    const originalWarn = console.warn;
    console.warn = message => warnings.push(String(message));
    try {
      expect(runExperiment(spec, [], [], [])).toBeNull();
      expect(runExperiment(spec, rows.slice(0, 2), [], [])).toBeNull();
      const result = runExperiment(spec, rows, [], [
        { name: "empty", rows: [] }, { name: "singleton", rows: rows.slice(0, 1) },
      ]);
      if (!result) throw new Error("Three puzzles should support nested cross-validation.");
      expect(result.batchSensitivity[0].scores).toBeNull();
      expect(result.batchSensitivity[0].selected).toBeNull();
      expect(result.batchSensitivity[0].skipped).toContain("Too little data for cross-validation");
      expect(result.comparisons.map(row => row.model)).toEqual([null, null]);
      expect(result.comparisons.map(row => row.legacy.n)).toEqual([0, 1]);
      expect(result.perPersonalBatch[0].scores.n).toBe(3);
      const report = renderReport([result], [], { unique: 3, personal: 3, siteAverage: 0, untimed: 0 }, null);
      expect(report).toContain("Too little data for historical-score analysis");
      expect(report).toContain("Too little data for cross-validation");
      expect(warnings).toHaveLength(5);
      expect(warnings[0]).toContain("Too little data for nested cross-validation");
    } finally {
      console.warn = originalWarn;
    }
  });

  test("unavailable families survive evaluation and report rendering", () => {
    const rows: TimedObservation[] = [
      { id: "a", batch: "one", kind: "personal", seconds: 1, features: { x: 1, y: 1 }, historicalScores: { "legacy.combined": 1 } },
      { id: "b", batch: "one", kind: "personal", seconds: 2, features: { x: 1, y: 1 }, historicalScores: { "legacy.combined": 2 } },
      { id: "c", batch: "one", kind: "personal", seconds: 3, features: { x: 1, y: 1 }, historicalScores: { "legacy.combined": 3 } },
      { id: "d", batch: "two", kind: "personal", seconds: 4, features: { x: 1, y: 1 }, historicalScores: { "legacy.combined": 4 } },
      { id: "e", batch: "two", kind: "personal", seconds: 5, features: { x: 1, y: 1 }, historicalScores: { "legacy.combined": 5 } },
      { id: "f", batch: "two", kind: "personal", seconds: 6, features: { x: 1, y: 1 }, historicalScores: { "legacy.combined": 6 } },
    ];
    const result = runExperiment(
      { name: "constant-inputs", features: ["x", "y"], includeTrace: false },
      rows, [], [{ name: "personal", rows }],
    );
    if (!result) throw new Error("Expected experiment result.");
    expect(result.summaries.find(summary => summary.family === "single")).toEqual({
      family: "single", evaluated: 0, total: 6, heldout: null, training: null, finalModel: null,
    });
    expect(result.summaries.find(summary => summary.family === "pair")).toEqual({
      family: "pair", evaluated: 0, total: 6, heldout: null, training: null, finalModel: null,
    });
    expect(result.summaries.find(summary => summary.family === "selected")!.finalModel).toBe(result.fitted);
    const report = renderReport([result], [], { unique: 6, personal: 6, siteAverage: 0, untimed: 0 }, null);
    expect(report).toContain("6 unique puzzles: 6 personally timed, 0 labeled with site-level average times, and 0 untimed.");
    expect(report).toContain("constant-inputs | single | 0/6 | unavailable | n/a");
    expect(report).toContain("single-feature fit unavailable.");
    expect(report).toContain("Benchmarks skipped for this run.");
  });
});
