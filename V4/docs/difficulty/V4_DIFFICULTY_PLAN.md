# V4 Difficulty Module Plan

## Background

Before V4, Sudokuru's difficulty calculation was closely based on the computational model described by Radek Pelánek in *Difficulty Rating of Sudoku Puzzles by a Computational Model*. See the [paper summary](SudokuDifficultyPaperSummary.md) for an explanation of its refutation and dependency metrics.

The legacy implementation adapted those ideas to estimate human difficulty, but doing so required substantial simulation logic written specifically for difficulty calculation. That work is computationally expensive and overlaps with solving behavior implemented elsewhere in Sudokuru.

## Current V4 implementation

[`getRawDifficulty`](../../difficulty.ts) now combines V4's bounded refutation and dependency scores. It accepts a prevalidated puzzle and an optional matching solution; omitting the solution invokes `getPuzzleSolution`. Completed puzzles return zero. Ratings are deterministic integers, and easy puzzles can receive negative scores.

The optional `RawDifficultyOptions` argument to `getRawDifficulty` controls both run counts and seeds, the refutation trial budget, the dependency sampling window, component weights, empty-cell normalization exponents, the provisional refutation ceiling, and the output scale. Its defaults produce this formula:

```text
round(1,000,000 * (min(refutation ?? 48, 48) / emptyCellCount ** 2 + 10 * dependency / emptyCellCount ** 1.9))
```

The combined API defaults to one refutation run with 64 trials and three dependency paths of 25 steps. Each scorer uses its own seed-81 stream. Standalone scorer defaults remain three runs with 32 trials for refutation and three paths of 20 steps for dependency. The cap applies to unresolved and finite refutation scores before normalization. User notes are ignored, and inputs are not mutated. The comments in `difficulty.ts` document the calibration results and alternative tunings. `getGameDifficulty` label mapping and `getSudokuData` integration remain pending.

## Original Plan for hint-based direction

The following was the original plan for difficulty improvements. However, a reimplementation of the legacy V4 approach ended up performing way better on human correlation than both the old legacy V4 approach as well as all the other approaches I tried. It also consistently runs in under 20 milliseconds meaning it's should be fast enough to support real time puzzle generation.

Performance is a primary requirement. The module should avoid the many randomized solve and refutation runs used by the legacy algorithm and should be fast enough to rate puzzles as part of real-time puzzle generation.

Correlation with human solving time will be a key comparison metric while developing the new difficulty calculation. Candidate approaches should be evaluated against the available human solve-time data, with the goal of retaining a similarly strong correlation while substantially reducing complexity and runtime.

The initial design therefore has four goals:

1. Produce difficulty output that remains useful and reasonably comparable to the legacy ratings.
2. Build on V4's existing strategy and hint-generation modules wherever practical.
3. Reduce calculation time enough to support real-time puzzle generation.
4. Achieve a correlation with human solving times similar to the legacy metric.
