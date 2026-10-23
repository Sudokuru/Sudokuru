/** Explicit evidence and configuration supplied by the runner, never inferred from scores. */
export interface ReportContext {
  readonly codeRevision: string | null;
  readonly workingTreeDirty: boolean | null;
  readonly corpusId: string;
  readonly sourceCommit: string;
  readonly personalBatches: readonly { name: string; puzzles: number }[];
  readonly independentValidationPuzzles: number;
  readonly legacyRuntimeMeasured: boolean;
  readonly criteria: {
    readonly maxRankingLoss: number | null;
    readonly scoringP95BudgetMs: number | null;
  };
  readonly settings: Readonly<Record<string, string | number | readonly number[]>>;
}
