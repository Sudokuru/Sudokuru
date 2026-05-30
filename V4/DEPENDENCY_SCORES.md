# Dependency Scores

## High Level Summary

A dependency score measures how constrained the early part of a Sudoku solve is.

The current legacy implementation asks a simple question repeatedly:

> At this point in the puzzle, how many cells can be solved immediately with an obvious single or hidden single?

If many simple moves are available at once, the puzzle is considered easier. The solver has several obvious ways forward, so progress does not depend heavily on one exact move order.

If only one or two simple moves are available, the puzzle is considered harder. Each step depends more tightly on the previous step creating the next opportunity.

The raw dependency score is returned as a negative number:

- More available singles -> larger average -> more negative score -> easier.
- Fewer available singles -> smaller average -> closer-to-zero score -> harder.

This negative sign is intentional. It makes the dependency component move upward as puzzles get harder, because hard puzzles have fewer simple options available at each step.

In the full difficulty calculation, dependency is combined with the refutation score. Because the raw dependency score is sensitive to the number of empty cells, the current `Board` difficulty calculation divides it by the number of non-given cells raised to `1.9`.

## Important Files

- `Generator/Dependency.ts` contains the dependency score loop.
- `Generator/SingleStrategies.ts` decides whether a cell is an obvious single or hidden single.
- `Generator/SimpleSolver.ts` applies one random obvious/hidden single move.
- `Generator/Sudoku.ts` provides board copying and note simplification helpers.
- `Generator/Board.ts` prepares notes, calls the dependency scorer, and folds the result into overall difficulty.

## Terms

An obvious single is an empty cell with exactly one candidate note left.

A hidden single is an empty cell where one candidate appears only in that cell within its row, column, or box, even if the cell has multiple notes.

Candidate notes are the possible values still allowed for an empty cell. Before dependency scoring, empty cells are given all possible notes, then notes are simplified by removing values already placed in each peer row, column, and box.

## Step By Step Walkthrough

1. Start with a prepared board.

   The scorer expects a `Cell[][]` board whose empty cells already have candidate notes. In `Board.setDifficulty`, this setup happens by creating a cell board, resetting notes on empty cells, and simplifying notes around the givens.

2. Repeat the experiment 30 times.

   `Dependency.getDependencyScore` runs the same measurement 30 times. Each run starts from a fresh copy of the original board. This matters because the simple solver chooses among available single moves in random order, and different choices can create slightly different paths.

3. For each run, look at only the first 20 simple moves.

   The scorer samples up to 20 steps, not the whole solve. Late in a Sudoku puzzle, many boards naturally collapse into lots of obvious singles, so the late game is less useful for telling puzzles apart.

4. Count every currently available obvious or hidden single.

   At each sampled step, the scorer scans all 81 cells. For each empty cell, it calls `SingleStrategies.getSingle`.

   `getSingle` returns a value when:

   - the cell has exactly one note, or
   - one of the cell's notes is unique in its row, column, or box.

   Every cell that passes this check increments the running count for that step.

5. Add that count to the total.

   If a board has 6 available simple moves at one step, `6` is added. If it has 2 available simple moves, `2` is added. This total is accumulated across all sampled steps and all 30 runs.

6. Stop the current run if no simple move is available.

   If the count is `0`, the simple solver cannot continue with obvious or hidden singles, so that run ends early.

7. Otherwise, solve one random simple move.

   `SimpleSolver.solveStep` shuffles all cells with the seeded pseudo-random generator, finds the first empty cell that has an obvious or hidden single, places that value, and simplifies notes for the affected row, column, and box.

   Then the next sampled step starts from this updated board.

8. Average the counts.

   After all runs finish, the total is divided by `30` runs and by `20` sampled steps. Conceptually, this gives:

   ```text
   average available singles per sampled step
   ```

9. Floor the average and negate it.

   The final legacy formula is:

   ```text
   dependencyScore = -1 * floor(totalAvailableSingles / 30 / 20)
   ```

   So an average of `6.8` available singles becomes `-6`, while an average of `2.1` becomes `-2`.

## How To Read The Number

A lower, more negative dependency score means the puzzle tends to offer many simple moves early. That usually means easier.

A higher, closer-to-zero dependency score means the puzzle tends to offer fewer simple moves early. That usually means harder.

Examples:

| Average available singles | Raw dependency score | Interpretation |
| --- | ---: | --- |
| 8.4 | -8 | Many simple options; easier dependency profile |
| 4.6 | -4 | Moderate number of simple options |
| 1.9 | -1 | Few simple options; harder dependency profile |
| 0.0 | 0 | No sampled simple progress |

## Notes For V4

The legacy dependency score is a useful high-level heuristic, but it has a few design constraints to keep in mind for V4:

- It depends on candidate notes being initialized correctly before scoring.
- It uses randomness when choosing which single to apply next, then averages over 30 runs.
- It only considers obvious singles and hidden singles.
- It samples at most 20 early steps.
- Raw scores are not directly comparable across puzzles with very different numbers of givens unless they are normalized.
- The production difficulty formula currently adjusts the raw dependency score by dividing by `emptyCellCount ** 1.9` before adding it to the refutation score.

