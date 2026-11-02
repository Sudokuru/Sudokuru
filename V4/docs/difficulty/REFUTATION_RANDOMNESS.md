# Refutation randomness and sampling

## Random source

`createSeededRandom(initialSeed = 81)` creates an independent
[Mulberry32](https://github.com/bryc/code/blob/master/jshash/PRNGs.md#mulberry32)
generator returning numbers in `[0, 1)`. Seeds are normalized to signed 32-bit
integers; zero is valid. Generators with the same normalized seed produce the
same sequence, and advancing one generator does not affect another.

## Single selection

Both single-step solvers scan cells in row-major order and collect cells with an
available obvious or hidden single. Each eligible cell appears once, even when
several units identify a hidden single. Within a cell, the solver checks obvious
singles first, then hidden singles in row, column, and box order.

With no eligible cells, the solver returns without making a move. With one,
it selects that cell without drawing randomness. With multiple eligible cells,
it uses one random draw to choose uniformly among them. Refutation reuses a
location buffer throughout a rating.

## Refutation sampling

`getRefutationScore(puzzle, solution, boost)` averages ten sampled runs and rounds
the result down. Each calculation starts a generator with seed 81 and advances
that same stream across all ten runs. Repeated calculations with the same inputs
produce the same score, independently of other calculations.

The `boost` parameter must be between 0 and 1. Once a refutation candidate has
been found, each subsequent remaining cell is skipped with probability `boost`.
Higher boost values reduce the number of cells evaluated. The fixed seed makes
the sampled paths repeatable; the score is still an estimate based on those paths.

The scorer retains up to 32 recently used completed scores. Calculations do not
mutate the supplied puzzle or solution.
