/** Heuristics measured on the initial board, before making any placements. */
export type InitialFeatures = {
  readonly empty: number;
  readonly notes: number;
  readonly meanNotes: number;
  readonly singles: number;
  readonly singleFraction: number;
  readonly singlesPerCandidate: number;
  readonly pairs: number;
  readonly pairFraction: number;
  readonly triples: number;
  readonly tripleFraction: number;
  readonly many: number;
  readonly manyFraction: number;
  readonly candidateVariance: number;
  readonly emptyPerSingle: number;
  readonly notesPerSingle: number;
};

/** Heuristics measured while applying obvious singles. */
export type TraceFeatures = {
  readonly tracePlacements: number;
  readonly traceFilledFraction: number;
  readonly traceRemaining: number;
  readonly traceSolved: 0 | 1;
  readonly availabilityCount10: number;
  readonly availabilityMean10: number;
  readonly availabilityMin10: number;
  readonly availabilityCount25: number;
  readonly availabilityMean25: number;
  readonly availabilityMin25: number;
};

/** Complete set of V4 research heuristics, excluding historical scores. */
export type Features = InitialFeatures & TraceFeatures;

/** Historical score columns retain their names in exported CSV artifacts. */
export type HistoricalScores = {
  readonly "legacy.combined": number;
  readonly "legacy.refutation"?: number;
  readonly "legacy.dependency"?: number;
  readonly "legacy.adjustedDependency"?: number;
  readonly "legacy.basicRD"?: number;
};

/** Generic numeric inputs for the reusable model algorithms, including synthetic tests. */
export type ModelInputs = Readonly<Record<string, number>>;
