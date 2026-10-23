import { describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { captureElimination, parseEliminationRegistry, readEliminationRegistry, recordElimination } from "../eliminations";
import { activeExperiment, EXPERIMENTS, PROCEDURE_FAMILIES } from "../procedures";
import { runExperiment } from "../experiments";
import { renderReport } from "../report";
import type { TimedObservation } from "../experimentTypes";

function artifacts() {
  const reportContext = { corpusId: "corpus-a", codeRevision: "revision-a", settings: { benchmarks: "Enabled" } };
  return {
    results: { corpus: { personal: 3 }, reportContext, experiments: [{ name: "initial", summaries: [{
      family: "tree", evaluated: 3, total: 3,
      heldout: { n: 3, spearman: 0.8, pearson: 0.6, logRmse: 0.2, secondsMae: 20 },
      finalModel: { spec: { id: "tree:2:3" } },
    }] }] },
    benchmarks: { reportContext, cpu: "test cpu", runtime: { bun: "test" }, benchmarks: [{
      name: "initial extraction + tree prediction", p95Ms: 1.25,
    }] },
  };
}
function snapshot() {
  const { results, benchmarks } = artifacts();
  return captureElimination(results, benchmarks, "initial/tree", "Slower than alternatives", "2026-10-22T00:00:00.000Z");
}

describe("manual difficulty procedure eliminations", () => {
  test("captures exact scores, timing, raw statistics, and provenance from a completed run", () => {
    const record = snapshot();
    expect(record.score).toBeCloseTo(0.85);
    expect(record.scoringP95Ms).toBe(1.25);
    expect(record.statistics).toEqual({ n: 3, spearman: 0.8, pearson: 0.6, logRmse: 0.2, secondsMae: 20 });
    expect(record.runContext.corpusId).toBe("corpus-a");
    expect(record.runContext.codeRevision).toBe("revision-a");
    expect(record.benchmarkContext?.cpu).toBe("test cpu");
    expect(record.modelId).toBe("tree:2:3");
    expect(record.recordedAt).toBe("2026-10-22T00:00:00.000Z");
  });

  test("explicitly skipped benchmarks produce null timing, not zero or a stale measurement", () => {
    const { results } = artifacts();
    results.reportContext.settings.benchmarks = "Skipped";
    const record = captureElimination(results, { skipped: true }, "initial/tree", "reason");
    expect(record.scoringP95Ms).toBeNull();
    expect(record.benchmarkContext).toBeNull();
  });

  test("rejects incomplete evidence, missing reasons, unknown procedures, and mismatched timings", () => {
    const { results, benchmarks } = artifacts();
    expect(() => captureElimination(results, benchmarks, "initial/tree", " ")).toThrow("reason");
    expect(() => captureElimination(results, benchmarks, "initial/nope", "reason")).toThrow("procedure ID");
    expect(() => captureElimination(results, benchmarks, "missing/tree", "reason")).toThrow("no complete");
    expect(() => captureElimination({}, benchmarks, "initial/tree", "reason")).toThrow("metadata");
    expect(() => captureElimination(results, { skipped: true }, "initial/tree", "reason")).toThrow("do not match");
    expect(() => captureElimination(results, { ...benchmarks, reportContext: { corpusId: "other" } }, "initial/tree", "reason")).toThrow("provenance");
    expect(() => captureElimination(results, { ...benchmarks, benchmarks: [] }, "initial/tree", "reason")).toThrow("calculation-time");
    results.experiments[0].summaries[0].evaluated = 2;
    expect(() => captureElimination(results, benchmarks, "initial/tree", "reason")).toThrow("no complete");
  });

  test("validates the static registry and never overwrites a previous decision", () => {
    const directory = mkdtempSync(join(tmpdir(), "difficulty-registry-"));
    const path = join(directory, "registry.json");
    try {
      writeFileSync(path, '{"version":1,"procedures":[]}\n');
      recordElimination(snapshot(), path);
      const saved = readFileSync(path, "utf8");
      expect(readEliminationRegistry(path).procedures).toEqual([snapshot()]);
      expect(() => recordElimination({ ...snapshot(), score: 0.1 }, path)).toThrow("already eliminated");
      expect(readFileSync(path, "utf8")).toBe(saved);
      expect(() => parseEliminationRegistry({ version: 2, procedures: [] })).toThrow("version 1");
      expect(() => parseEliminationRegistry({ version: 1, procedures: [{ ...snapshot(), score: 2 }] })).toThrow("Invalid eliminated");
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  test("freezes historical scores even if the reporting convention or current corpus changes", () => {
    const record = { ...snapshot(), score: 0.123, scoreDefinition: "historical policy", reason: "Reason | detail\nnext line" };
    const registry = parseEliminationRegistry({ version: 1, procedures: [record] });
    const rendered = renderReport([], [], { unique: 0, personal: 0, siteAverage: 0, untimed: 0 }, null, undefined, registry.procedures);
    const unpadded = rendered.split("\n").map(line => line.split("|").map(cell => cell.trim()).join(" | ")).join("\n");
    expect(unpadded).toContain("initial/tree (eliminated) | 0.123 | 1.250");
    expect(rendered).toContain("historical policy");
    expect(rendered).toContain("corpus-a");
    expect(rendered).toContain("Reason &#124; detail<br>next line");
    expect(rendered).toContain("potentially from different corpora");
  });

  test("removes eliminated families from every selection fold and the live summary", () => {
    const base = { name: "initial", features: ["notes", "many"], includeTrace: false };
    const active = activeExperiment(base, [{ ...snapshot(), procedure: "initial/single" }]);
    expect(active?.excludedFamilies).toEqual(["single"]);
    const rows: TimedObservation[] = [1, 2, 3, 4, 5, 6].map(x => ({
      id: String(x), batch: "one", kind: "personal", seconds: Math.exp(x / 4),
      features: { notes: x, many: x * x }, historicalScores: { "legacy.combined": x },
    }));
    const result = runExperiment(active!, rows, [], [{ name: "personal", rows }]);
    if (!result) throw new Error("Expected experiment.");
    expect(result.summaries.some(row => row.family === "single")).toBe(false);
    expect(result.finalSelection.candidates.some(row => row.spec.kind === "linear" && row.spec.features.length === 1)).toBe(false);
    expect(result.heldout.every(row => !row.families.some(family => family.family === "single"))).toBe(true);
    const rendered = renderReport([result], [], { unique: 6, personal: 6, siteAverage: 0, untimed: 0 }, null, undefined, [snapshot()]);
    expect(rendered).toContain("initial/tree (eliminated)");
    expect(rendered).not.toContain("initial/tree versus");
    const noSelected = activeExperiment(base, [{ procedure: "initial/selected" }]);
    const familiesOnly = runExperiment(noSelected!, rows, [], []);
    expect(familiesOnly?.summaries.some(row => row.family === "selected")).toBe(false);
    expect(familiesOnly?.batchSensitivity).toEqual([]);
    expect(activeExperiment(base, PROCEDURE_FAMILIES.map(family => ({ procedure: `initial/${family}` })))).toBeNull();
  });

  test("CLI records a decision in an isolated registry and refuses a duplicate", () => {
    const directory = mkdtempSync(join(tmpdir(), "difficulty-eliminate-cli-"));
    try {
      const { results, benchmarks } = artifacts();
      const registry = join(directory, "registry.json");
      writeFileSync(registry, '{"version":1,"procedures":[]}\n');
      writeFileSync(join(directory, "results.json"), JSON.stringify(results));
      writeFileSync(join(directory, "benchmarks.json"), JSON.stringify(benchmarks));
      const command = [process.execPath, resolve(__dirname, "../eliminate.ts"), "initial/tree", "--reason", "manual decision", "--results", directory, "--registry", registry];
      const first = Bun.spawnSync(command);
      expect(first.exitCode).toBe(0);
      expect(readEliminationRegistry(registry).procedures[0].reason).toBe("manual decision");
      expect(Bun.spawnSync(command).exitCode).not.toBe(0);
      expect(readEliminationRegistry(registry).procedures.length).toBe(1);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  test("runner skips fully eliminated experiments and renders static scores without modifying the registry", () => {
    const directory = mkdtempSync(join(tmpdir(), "difficulty-retired-run-"));
    try {
      const registry = join(directory, "registry.json");
      const procedures = EXPERIMENTS.flatMap(experiment => PROCEDURE_FAMILIES.map(family => ({
        ...snapshot(), procedure: `${experiment.name}/${family}`,
      })));
      const saved = JSON.stringify({ version: 1, procedures }, null, 2) + "\n";
      writeFileSync(registry, saved);
      const output = join(directory, "results");
      const run = Bun.spawnSync([process.execPath, resolve(__dirname, "../run.ts"),
        "--registry", registry, "--out", output, "--skip-benchmarks"]);
      expect(run.exitCode).toBe(0);
      const results = JSON.parse(readFileSync(join(output, "results.json"), "utf8"));
      expect(results.experiments).toEqual([]);
      expect(results.eliminatedProcedures).toEqual(procedures);
      const rendered = readFileSync(join(output, "REPORT.md"), "utf8");
      for (const record of procedures) expect(rendered).toContain(`${record.procedure} (eliminated)`);
      expect(readFileSync(registry, "utf8")).toBe(saved);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
});
