/** Timings per operation call, including loop/callback and checksum overhead. */
export interface BenchmarkResult {
  readonly name: string;
  /** Median and 95th percentile of per-sample average milliseconds per call. */
  readonly p50Ms: number;
  readonly p95Ms: number;
  /** Estimated throughput from mean measured time, not an end-to-end load test. */
  readonly puzzlesPerSecond: number;
  readonly samples: number;
  readonly callsPerSample: number;
}

/** Measurements and environment metadata needed to interpret one benchmark run. */
export interface BenchmarkResults {
  readonly runtime: Readonly<Record<string, string>>;
  readonly platform: string;
  readonly arch: string;
  readonly cpu?: string;
  readonly preparationMs: number;
  readonly warmupPasses: number;
  readonly measuredPasses: number;
  readonly predictionBatch: number;
  readonly corpusSize: number;
  readonly checksum: number;
  readonly benchmarks: readonly BenchmarkResult[];
}
