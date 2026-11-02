# V4 Difficulty Module Plan

## Background

Before V4, Sudokuru's difficulty calculation was closely based on the computational model described by Radek Pelánek in *Difficulty Rating of Sudoku Puzzles by a Computational Model*. See the [paper summary](SudokuDifficultyPaperSummary.md) for an explanation of its refutation and dependency metrics.

The legacy implementation adapted those ideas to estimate human difficulty, but doing so required substantial simulation logic written specifically for difficulty calculation. That work is computationally expensive and overlaps with solving behavior implemented elsewhere in Sudokuru.

## Direction for V4

V4 will introduce a simpler difficulty module that produces broadly similar, useful difficulty ratings while being easier to understand, maintain, and extend.

The new module should reuse the same strategy detection code used to create hints. Difficulty calculation should observe which strategies are available and applied during a solve instead of maintaining a separate collection of ad hoc solving and simulation code. This keeps the difficulty model aligned with the techniques Sudokuru actually teaches and exposes through hints.

Performance is a primary requirement. The module should avoid the many randomized solve and refutation runs used by the legacy algorithm and should be fast enough to rate puzzles as part of real-time puzzle generation.

Correlation with human solving time will be a key comparison metric while developing the new difficulty calculation. Candidate approaches should be evaluated against the available human solve-time data, with the goal of retaining a similarly strong correlation while substantially reducing complexity and runtime.

The initial design therefore has four goals:

1. Produce difficulty output that remains useful and reasonably comparable to the legacy ratings.
2. Build on V4's existing strategy and hint-generation modules wherever practical.
3. Reduce calculation time enough to support real-time puzzle generation.
4. Achieve a correlation with human solving times similar to the legacy metric.
