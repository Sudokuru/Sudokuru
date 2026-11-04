# Implement the V4 Combined Raw Difficulty API

Implemented in [`V4/difficulty.ts`](../../difficulty.ts). The plan below records the scope and chosen defaults; label mapping and the hint-based redesign remain separate.

## Summary

Add `getRawDifficulty` using the V4 refutation and dependency scorers. Keep all combined-score tuning values together in `V4/difficulty.ts`. This change delivers the numeric API only; `getGameDifficulty` labels and `getSudokuData` remain separate work.

## Implementation

- Add `getRawDifficulty(puzzle: readonly (readonly CellProps[])[], solution?: readonly (readonly SudokuNumber[])[], options?: RawDifficultyOptions): number` in `V4/difficulty.ts`. If no solution is supplied, obtain one with `getPuzzleSolution`; a supplied solution is trusted as already validated. Return `0` for an already completed, prevalidated board.
- Add optional typed settings to `V4/refutation.ts` and `V4/dependency.ts`, preserving their current calls and defaults. The combined API passes explicit settings from `difficulty.ts`: refutation runs **3**, trials per run **32**, seed **81**; dependency runs **3**, early steps **20**, seed **81**. Reject nonpositive run/step counts and negative or noninteger trial budgets.
- Expose every combined-score tuning value as a field in optional `RawDifficultyOptions`, defaulting to the following values: refutation and dependency weights **1** each; separate empty-cell normalization exponents **0** and **1.9**; maximum refutation score **256**; output scale **1,000,000**. Count note cells as empty, using a minimum denominator of one. Replace a `null` refutation with 256 and **cap finite refutation scores at 256**. Preserve the scorers' existing rounding, then compute:

  ```text
  Math.round(scale * (
    refutationWeight * cappedRefutation / emptyCount ** refutationExponent +
    dependencyWeight * dependency / emptyCount ** dependencyExponent
  ))
  ```

- Document the optional solution, provisional cap, negative possible scores, and constants. Update V4's difficulty docs to mark the raw API implemented while leaving label mapping and the larger hint-based redesign pending.

## Verification

- Test unchanged standalone scorer defaults and custom settings that alter run count, trial budget, step count, and seed; test invalid count settings.
- Test combined-score literals for existing V4 fixtures, including `ONLY_OBVIOUS_SINGLES = -9980`, `COLUMN_OBVIOUS_PAIR = 8997911`, and the valid refutation-null fixture's capped result `255999807`. Cover a one-missing-cell board (`-50000`), a completed board (`0`), optional-solution parity, and input immutability. Keep historical legacy scores as comparison data, not V4 expectations.
- Run focused tests, the full V4 unit suite, TypeScript, and diff checks. Benchmark both one-argument and solution-supplied calls on committed fixtures and human-time boards; report latency distribution and correlation without timing assertions in tests.

## Assumptions

The optional solution matches a prevalidated puzzle; the API does not revalidate it. Without one, existing solution-validation errors propagate. The **256 cap is a tunable provisional value**, above the highest refutation score of 207 observed in 100 current fixtures. The million-scale integer output follows the legacy score's general units, while exact legacy results are not required.
