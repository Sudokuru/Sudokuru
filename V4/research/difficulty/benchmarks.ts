import { cpus, platform, arch } from "node:os";
import { performance } from "node:perf_hooks";
import { initialFeatures } from "./features";
import { singleTrace } from "./singleTrace";
import { predict } from "./models";
import { mean, quantile } from "./statistics";
import { BENCHMARK_SETTINGS } from "./settings";
import type { FeatureRow, ExperimentResult } from "./experimentTypes";
import type { BenchmarkResult, BenchmarkResults } from "./benchmarkTypes";

/**
 * Compare the warmed cost of extracting heuristics, predicting from existing
 * heuristics, and doing both together. Solving and model training are excluded:
 * boards' solutions and fitted models must already be available.
 *
 * Warmup runs give the runtime a chance to optimize before measurement. Tiny
 * prediction calls are repeated in batches so reading the clock is a smaller
 * fraction of the measurement. Their percentiles describe batch averages, NOT
 * individual-call tail latency. These are comparative microbenchmarks, not
 * production latency guarantees.
 *
 * preparationMs records earlier validation/solution work for context; it is not
 * added to any timing sample. Warn and return null when there are no puzzles.
 */
export function runBenchmarks(
  featureRows: readonly FeatureRow[],
  experiments: readonly ExperimentResult[],
  preparationMs: number,
): BenchmarkResults | null {
  if (featureRows.length === 0) {
    console.warn("Too little data for benchmarks: no puzzles to measure.");
    return null;
  }
  // Consume every result and expose the sum, discouraging removal of unused work.
  // This is not a correctness check; its small accumulation cost is timed too.
  let checksum = 0;
  /**
   * Warm up, then collect one sample per puzzle per measured pass.
   * Each sample repeats the same operation on the same puzzle 'batch' times
   * and divides elapsed time by that count to estimate milliseconds per call.
   */
  function benchmark(name: string, operation: (index: number) => number, batch = 1): BenchmarkResult {
    for (let repeat = 0; repeat < BENCHMARK_SETTINGS.warmupPasses; repeat++) {
      for (let i = 0; i < featureRows.length; i++) checksum += operation(i);
    }
    const samples: number[] = [];
    for (let repeat = 0; repeat < BENCHMARK_SETTINGS.measuredPasses; repeat++) {
      for (let i = 0; i < featureRows.length; i++) {
        const start = performance.now();
        for (let iteration = 0; iteration < batch; iteration++) checksum += operation(i);
        samples.push((performance.now() - start) / batch);
      }
    }
    samples.sort((a, b) => a - b);
    // The nonempty corpus and positive measured-pass setting guarantee samples.
    return { name, p50Ms: quantile(samples, 0.5)!, p95Ms: quantile(samples, 0.95)!,
      puzzlesPerSecond: 1000 / mean(samples), samples: samples.length, callsPerSample: batch };
  }

  const benchmarks: BenchmarkResult[] = [];
  console.log("Measuring warmed feature and prediction latency.");
  const initialized = featureRows.map(row => initialFeatures(row.record.puzzle).board);
  benchmarks.push(benchmark("initial extraction (includes parsing)", i => initialFeatures(featureRows[i].record.puzzle).features.notes));
  benchmarks.push(benchmark("trace extraction (initialized board + prepared solution)", i => singleTrace(initialized[i], featureRows[i].solution).features.tracePlacements));
  for (const experiment of experiments) {
    for (const summary of experiment.summaries) {
      const model = summary.finalModel;
      if (!model) continue;
      benchmarks.push(benchmark(`${experiment.name}/${summary.family} prediction`, i => predict(model, featureRows[i].features), BENCHMARK_SETTINGS.predictionBatch));
    }
    benchmarks.push(benchmark(`${experiment.name} extraction + selected prediction`, i => {
      const initial = initialFeatures(featureRows[i].record.puzzle);
      const features = !experiment.includeTrace ? initial.features :
        { ...initial.features, ...singleTrace(initial.board, featureRows[i].solution).features };
      return predict(experiment.fitted, features);
    }));
  }
  return { runtime: process.versions, platform: platform(), arch: arch(), cpu: cpus()[0]?.model,
    preparationMs, ...BENCHMARK_SETTINGS, corpusSize: featureRows.length, checksum, benchmarks };
}
