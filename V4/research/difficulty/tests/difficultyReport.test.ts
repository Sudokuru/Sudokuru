import { describe, expect, test } from "bun:test";
import { renderReport } from "../report";
import { runExperiment } from "../experiments";
import type { ExperimentResult, TimedObservation } from "../experimentTypes";
import type { ReportContext } from "../reportTypes";
import type { BenchmarkResults } from "../benchmarkTypes";

// Small actual experiments supply consistent prediction/family coverage without the full corpus search.
const rows: TimedObservation[] = [1, 2, 3, 4, 5, 6].map((x, i) => ({
  id: `p${i}`, batch: i < 3 ? "first" : "second", kind: "personal", seconds: Math.exp(x / 3),
  features: { notes: x, tracePlacements: x * x }, historicalScores: { "legacy.combined": x },
}));
const corpus = { unique: 6, personal: 6, siteAverage: 0, untimed: 0 };
const initial = runExperiment({ name: "initial", features: ["notes"], includeTrace: false }, rows, [], [{ name: "personal", rows }]);
if (!initial) throw new Error("Expected report fixture experiment.");
const context: ReportContext = {
  codeRevision: "analysis-revision", workingTreeDirty: true, corpusId: "sha256:corpus", sourceCommit: "source-revision",
  personalBatches: [{ name: "first", puzzles: 3 }, { name: "second", puzzles: 3 }],
  independentValidationPuzzles: 0, legacyRuntimeMeasured: false,
  criteria: { maxRankingLoss: null, scoringP95BudgetMs: null },
  settings: { target: "logSeconds", treeDepths: [1, 2, 3] },
};
const benchmarks: BenchmarkResults = {
  runtime: { node: "test" }, platform: "test", arch: "test", preparationMs: 1,
  warmupPasses: 1, measuredPasses: 2, predictionBatch: 10, corpusSize: 6, checksum: 1,
  benchmarks: [
    { name: "initial extraction + selected prediction", p50Ms: 0.3, p95Ms: 0.5, puzzlesPerSecond: 2000, samples: 12, callsPerSample: 1 },
    { name: "initial+trace extraction + selected prediction", p50Ms: 0.6, p95Ms: 0.8, puzzlesPerSecond: 1200, samples: 12, callsPerSample: 1 },
  ],
};

function report(experiments: readonly ExperimentResult[] = [initial], metadata: ReportContext = context) {
  return renderReport(experiments, [], corpus, benchmarks, metadata);
}

describe("difficulty executive report", () => {
  test("puts decision comparisons before technical appendices and separates final fits", () => {
    const rendered = report();
    const questions = [
      "How do approaches compare with legacy?", "Does adding trace information help?",
      "Does allowing more complex models help?", "How sensitive are results to the training data?",
      "What does scoring cost?", "What evidence is available?",
    ];
    for (let i = 1; i < questions.length; i++) {
      expect(rendered.indexOf(questions[i])).toBeGreaterThan(rendered.indexOf(questions[i - 1]));
    }
    expect(rendered.indexOf("Appendix: fitted models")).toBeGreaterThan(rendered.indexOf(questions[5]));
    const executive = rendered.split("## Appendix:")[0];
    expect(executive).not.toContain("Training Spearman");
    expect(executive).not.toContain("Final fitted recipe");
    expect(rendered).toContain("[results.json](results.json)");
    expect(rendered).not.toContain("Research conclusion");
  });

  test.each([
    [0.1, 0.2, "Interval above zero"],
    [-0.2, -0.1, "Interval below zero"],
    [-0.1, 0.2, "Interval includes zero"],
    [0, 0.2, "Interval includes zero"],
    [-0.2, 0, "Interval includes zero"],
    [null, null, "Unavailable"],
  ])("describes interval [%s, %s] mechanically", (lower95, upper95, label) => {
    const experiment = { ...initial, comparisons: initial.comparisons.map(comparison => ({
      ...comparison, pairedBootstrap: { ...comparison.pairedBootstrap!, lower95, upper95 },
    })) };
    const executive = report([experiment]).split("## Does adding trace information help?")[0];
    expect(executive).toContain(label);
    expect(executive).not.toContain("improvement");
  });

  test("calculates signed differences and total scoring cost on matching puzzles", () => {
    const base: ExperimentResult = { ...initial, summaries: initial.summaries.map(summary => summary.family === "selected" ? {
      ...summary, heldout: { ...summary.heldout!, spearman: 0.9, logRmse: 0.2 },
    } : summary) };
    const trace: ExperimentResult = { ...base, name: "initial+trace", includeTrace: true,
      summaries: base.summaries.map(summary => summary.family === "selected" ? {
        ...summary, heldout: { ...summary.heldout!, spearman: 0.8, logRmse: 0.3 },
      } : summary),
    };
    expect(report([base, trace])).toContain(
      "initial+trace/selected versus initial/selected | Matching puzzle coverage | -0.100 | 0.100 | 0.300");
    expect(report([base, trace])).toContain("initial | 0.300 | 0.500 | 2000");
    expect(renderReport([base, trace], [], corpus, null, context)).toContain(
      "initial+trace/selected versus initial/selected | Matching puzzle coverage | -0.100 | 0.100 | n/a");
  });

  test("compares a family and legacy on identical eligible puzzles", () => {
    const partialLegacy = rows.map((row, i) => ({ ...row,
      historicalScores: { "legacy.combined": i < 2 ? NaN : -i },
    }));
    const experiment = runExperiment({ name: "partial", features: ["notes"], includeTrace: false },
      partialLegacy, [], [{ name: "personal", rows: partialLegacy }]);
    if (!experiment) throw new Error("Expected experiment.");
    const single = experiment.summaries.find(summary => summary.family === "single");
    expect(single?.heldout?.n).toBe(6);
    expect(single?.personalComparison?.model?.n).toBe(4);
    expect(single?.personalComparison?.model?.spearman).toBe(1);
    expect(single?.personalComparison?.legacy.n).toBe(4);
    expect(single?.personalComparison?.legacy.spearman).toBe(-1);
    expect(single?.personalComparison?.pairedBootstrap?.difference).toBe(2);
    expect(report([experiment])).toContain("partial/single | 4/6 | 1.000 | -1.000 | 2.000");
  });

  test("rejects equal-size comparisons when puzzle identities differ", () => {
    const trace = { ...initial, name: "trace", includeTrace: true,
      heldout: initial.heldout.map((row, i) => ({ ...row, id: i === 0 ? "other-puzzle" : row.id })),
    };
    expect(report([initial, trace])).toContain(
      "trace/selected versus initial/selected | Different puzzle coverage | n/a | n/a | n/a");
  });

  test("compares family coverage by puzzle identities rather than prediction count", () => {
    const experiment: ExperimentResult = { ...initial,
      heldout: initial.heldout.map((row, i) => ({ ...row, families: [
        { family: "single", selected: "single", logPrediction: i < 3 ? row.logPrediction : null },
        { family: "pair", selected: "pair", logPrediction: i >= 3 ? row.logPrediction : null },
      ] })),
    };
    expect(report([experiment])).toContain(
      "initial/pair versus initial/single | Different puzzle coverage | n/a | n/a | n/a");
  });

  test("counts selected features directly and presents all tied most-frequent recipes", () => {
    const experiment = { ...initial, heldout: initial.heldout.map((row, i) => ({
      ...row, selected: i < 3 ? "z-recipe" : "a-recipe",
      selectedFeatures: i < 3 ? ["notes"] : ["notes", "tracePlacements"],
    })) };
    expect(report([experiment])).toContain("initial | 6 | 2 | a-recipe, z-recipe | 3 | 3");
  });

  test("uses explicit evidence metadata and displays configured or missing criteria", () => {
    const rendered = report();
    expect(rendered).toContain("Personal timing batches | 2");
    expect(rendered).toContain("Batch sizes | first: 3, second: 3");
    expect(rendered).toContain("Legacy runtime measured in this run | No");
    expect(rendered).toContain("Independent validation puzzles | 0");
    expect(rendered).toContain("Maximum acceptable ranking-correlation loss | Not configured");
    expect(rendered).toContain("Scoring p95 budget (ms) | Not configured");
    expect(rendered).toContain("Analysis code revision | analysis-revision");
    expect(rendered).toContain("Corpus identifier | sha256:corpus");
    expect(rendered).toContain("Working tree has tracked changes | Yes");
    const configured = report([initial], { ...context, independentValidationPuzzles: 12,
      criteria: { maxRankingLoss: 0.05, scoringP95BudgetMs: 1 } });
    expect(configured).toContain("Maximum acceptable ranking-correlation loss | 0.050");
    expect(configured).toContain("Scoring p95 budget (ms) | 1.000");
    expect(configured).toContain("Independent validation puzzles | 12");
    const missing = renderReport([], [], corpus, null);
    expect(missing).toContain("Legacy runtime measured in this run | n/a");
    expect(missing).toContain("Analysis code revision | n/a");
    expect(missing).not.toContain("NaN");
    expect(missing).not.toContain("undefined");
  });
});
