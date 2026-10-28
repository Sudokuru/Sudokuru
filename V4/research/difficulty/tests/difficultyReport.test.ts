import { describe, expect, test } from "bun:test";
import { renderReport } from "../report";
import { runExperiment } from "../experiments";
import { captureElimination } from "../eliminations";
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
  settings: { target: "logSeconds" },
};
const benchmarks: BenchmarkResults = {
  runtime: { node: "test" }, platform: "test", arch: "test", preparationMs: 1,
  warmupPasses: 1, measuredPasses: 2, predictionBatch: 10, corpusSize: 6, checksum: 1,
  benchmarks: [
    { name: "initial extraction + selected prediction", p50Ms: 0.3, p95Ms: 0.5, puzzlesPerSecond: 2000, samples: 12, callsPerSample: 1 },
    { name: "initial+trace extraction + selected prediction", p50Ms: 0.6, p95Ms: 0.8, puzzlesPerSecond: 1200, samples: 12, callsPerSample: 1 },
  ],
};

// Ignore presentation padding in content assertions; alignment is checked separately.
function unpad(markdown: string): string {
  return markdown.split("\n").map(line => line.includes(" | ") ?
    line.split("|").map(cell => cell.trim()).join(" | ") : line).join("\n");
}

function report(experiments: readonly ExperimentResult[] = [initial], metadata: ReportContext = context) {
  return unpad(renderReport(experiments, [], corpus, benchmarks, metadata));
}

describe("difficulty executive report", () => {
  test("ranks Cloud validation results and gives the top three individual comparisons with legacy", () => {
    const make = (procedure: string, spearman: number) => ({ procedure,
      scores: { n: 6, spearman, pearson: spearman, logRmse: 0.3, secondsMae: 10 } });
    const validation = [make("initial/single", 0.7), make("initial/quadratic", 0.8),
      make("initial/power", 0.9), make("initial/direct", 0.6),
      { procedure: "legacy", scores: { n: 6, spearman: 0.75, pearson: 0.75, logRmse: null, secondsMae: null } }];
    const rendered = unpad(renderReport([initial], [], corpus, benchmarks, context, [], validation));
    const main = rendered.split("## Top three strategies")[0];
    expect(main.indexOf("initial/power | 0.950")).toBeLessThan(main.indexOf("initial/quadratic | 0.900"));
    expect(main).toContain("legacy (V3) | 0.875");
    const details = rendered.split("## Top three strategies")[1].split("## Personal training corpus results")[0];
    expect(details).toContain("### initial/power versus legacy");
    expect(details).toContain("### initial/quadratic versus legacy");
    expect(details).toContain("### initial/single versus legacy");
    expect(details).not.toContain("### initial/direct versus legacy");
    expect(details).toContain("MAE seconds ↓ | 10.000 | n/a");
    expect(details).toContain("Spearman ↑ | 0.900 | 0.750");
  });
  test("sorts active rows by unrounded score, resolves ties by name, and puts unavailable scores last", () => {
    const correlations = { selected: 0.6, single: 0.6004, quadratic: 0.8, ridge: 0.8, pair: null };
    const experiment: ExperimentResult = { ...initial, comparisons: [],
      summaries: (["selected", "single", "quadratic", "ridge", "pair"] as const).map(family => ({
        ...initial.summaries[0], family,
        heldout: { ...initial.heldoutScores, spearman: correlations[family], pearson: correlations[family] },
      })),
    };
    const before = JSON.stringify(experiment);
    const rendered = report([experiment]);
    const names = rendered.split("### Eliminated procedures")[0].split("\n")
      .filter(line => line.startsWith("initial/")).map(line => line.split(" | ")[0]);
    expect(names).toEqual(["initial/quadratic", "initial/ridge", "initial/single", "initial/selected", "initial/pair"]);
    expect(JSON.stringify(experiment)).toBe(before);
    expect(report([experiment])).toBe(rendered);
  });

  test("places frozen eliminated rows in a separate table below active results", () => {
    const record = captureElimination({ experiments: [initial], corpus,
      reportContext: { ...context, settings: { benchmarks: "Skipped" } },
    }, { skipped: true }, "initial/single", "Retired for this test", "2026-10-22T00:00:00.000Z");
    const rendered = unpad(renderReport([initial], [], corpus, benchmarks, context, [record]));
    const [active, rest] = rendered.split("### Eliminated procedures");
    const archived = rest.split("## Does adding trace information help?")[0];
    expect(active).toContain("initial/selected | 1.000 | 0.500");
    expect(active).not.toContain("initial/single |");
    expect(active).not.toContain("(eliminated)");
    expect(archived).toContain("Procedure | Human-correlation score ↑ | Scoring p95 ms ↓");
    expect(archived).toContain("initial/single (eliminated) | 1.000 | n/a");
    expect(archived).not.toContain("initial/selected |");
  });

  test("summarizes procedures using exactly two metrics with no coverage column", () => {
    const executive = report().split("## Does adding trace information help?")[0];
    expect(executive).toContain("Procedure | Human-correlation score ↑ | Scoring p95 ms ↓");
    expect(executive).toContain("initial/selected | 1.000 | 0.500");
    expect(executive).toContain("legacy (historical) | 0.993 | n/a");
    expect(executive).not.toContain("Legacy-comparable/total");
    expect(executive).not.toContain("Log error ↓");
    expect(executive).not.toContain("Interval position");
    expect(executive).not.toContain("6/6");
  });

  test("aligns every Markdown table column without trailing spaces", () => {
    const rendered = renderReport([initial], [], corpus, benchmarks, context);
    for (const block of rendered.split("\n\n").filter(block => block.includes(" | "))) {
      const lines = block.split("\n");
      const positions = (line: string) => [...line.matchAll(/\|/g)].map(match => match.index);
      for (const line of lines) {
        expect(positions(line)).toEqual(positions(lines[0]));
        expect(line).toBe(line.trimEnd());
      }
    }
  });
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
    const detail = report([experiment]).split("## Appendix: correlations and evaluation details")[1];
    const selectedRow = detail.split("\n").find(line => line.startsWith("initial/selected |"));
    expect(selectedRow).toContain(label);
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
      "initial+trace/selected versus initial/selected | Matching puzzle coverage | -0.025 | 0.300");
    expect(report([base, trace])).toContain("initial | 0.500");
    expect(unpad(renderReport([base, trace], [], corpus, null, context))).toContain(
      "initial+trace/selected versus initial/selected | Matching puzzle coverage | -0.025 | n/a");
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
    expect(report([experiment])).toContain("partial/single | 4 | 1.000 | -1.000 | 2.000");
    const executive = report([experiment]).split("## Does adding trace information help?")[0];
    expect(executive).toContain("partial/single | 1.000 | n/a");
    expect(executive).not.toContain("legacy (historical)");
  });

  test("keeps partial prediction coverage out of the summary without a coverage column", () => {
    const partial = { ...initial, summaries: initial.summaries.map(summary => summary.family === "single" ? {
      ...summary, evaluated: 5, heldout: { ...summary.heldout!, n: 5 },
    } : summary) };
    const rendered = report([partial]);
    expect(rendered.split("## Does adding trace information help?")[0]).not.toContain("initial/single |");
    expect(rendered.split("## Appendix: correlations and evaluation details")[1]).toContain("initial | single | 5/6");
  });

  test("rejects equal-size comparisons when puzzle identities differ", () => {
    const trace = { ...initial, name: "trace", includeTrace: true,
      heldout: initial.heldout.map((row, i) => ({ ...row, id: i === 0 ? "other-puzzle" : row.id })),
    };
    expect(report([initial, trace])).toContain(
      "trace/selected versus initial/selected | Different puzzle coverage | n/a | n/a");
  });

  test("compares family coverage by puzzle identities rather than prediction count", () => {
    const experiment: ExperimentResult = { ...initial,
      heldout: initial.heldout.map((row, i) => ({ ...row, families: [
        { family: "single", selected: "single", logPrediction: i < 3 ? row.logPrediction : null },
        { family: "pair", selected: "pair", logPrediction: i >= 3 ? row.logPrediction : null },
      ] })),
    };
    expect(report([experiment])).toContain(
      "initial/pair versus initial/single | Different puzzle coverage | n/a | n/a");
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
    const missing = unpad(renderReport([], [], corpus, null));
    expect(missing).toContain("Legacy runtime measured in this run | n/a");
    expect(missing).toContain("Analysis code revision | n/a");
    expect(missing).not.toContain("NaN");
    expect(missing).not.toContain("undefined");
  });
});
