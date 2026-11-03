import { createSeededRandom } from "./random";
import { placeSimpleValue, prepareSimplePuzzle, solveSimpleStep } from "./simpleSolver";
import type { CellLocation, CellProps, SudokuNumber } from "./Types";

const REFUTATION_RUN_COUNT = 3;
const MAX_TRIALS_PER_RUN = 32;

type TrialBudget = { remaining: number };
type RefutableCell = { location: CellLocation; cost: number };

/**
 * Counts an assumption and subsequent singles until an empty cell has no notes.
 * Stalling or completing a board without that contradiction is unresolved.
 */
function measureTrial(
  puzzle: readonly (readonly CellProps[])[],
  location: CellLocation,
  candidate: SudokuNumber,
  nextRandom: () => number
): number | null {
  let branch = placeSimpleValue(puzzle, location, candidate);
  let cost = 1;

  while (!branch.some((row) => row.some(
    (cell) => cell.type === "note" && cell.notes.length === 0
  ))) {
    const next = solveSimpleStep(branch, nextRandom);
    if (next === null) {
      return null;
    }
    branch = next;
    cost += 1;
  }

  return cost;
}

/**
 * Returns the first row-major cell whose incorrect candidates can all be
 * refuted, summing their costs. Candidates are prepared in ascending order.
 * Unresolved candidates disqualify a cell. The trial budget spans the whole run.
 */
function findRefutableCell(
  puzzle: readonly (readonly CellProps[])[],
  solution: readonly (readonly SudokuNumber[])[],
  nextRandom: () => number,
  budget: TrialBudget
): RefutableCell | null {
  for (let r = 0; r < puzzle.length; r += 1) {
    for (let c = 0; c < puzzle.length; c += 1) {
      const cell = puzzle[r][c];
      if (cell.type !== "note") {
        continue;
      }

      let cost = 0;
      let refutable = true;
      for (const candidate of cell.notes) {
        if (candidate === solution[r][c]) {
          continue;
        }
        if (budget.remaining === 0) {
          return null;
        }
        budget.remaining -= 1;

        const trialCost = measureTrial(puzzle, { r, c }, candidate, nextRandom);
        if (trialCost === null) {
          refutable = false;
          break;
        }
        cost += trialCost;
      }

      if (refutable) {
        return { location: { r, c }, cost };
      }
    }
  }

  return null;
}

/**
 * Alternates free singles with refutations, placing a confirmed solution value
 * after all alternatives for that cell have been disproved.
 */
function scoreRun(
  initial: readonly (readonly CellProps[])[],
  solution: readonly (readonly SudokuNumber[])[],
  nextRandom: () => number
): number | null {
  let puzzle = initial;
  let score = 0;
  const budget: TrialBudget = { remaining: MAX_TRIALS_PER_RUN };

  while (true) {
    const next = solveSimpleStep(puzzle, nextRandom);
    if (next !== null) {
      puzzle = next;
      continue;
    }
    if (puzzle.every((row) => row.every((cell) => cell.type !== "note"))) {
      return score;
    }

    const refutation = findRefutableCell(puzzle, solution, nextRandom, budget);
    if (refutation === null) {
      return null;
    }
    const { location, cost } = refutation;
    score += cost;
    puzzle = placeSimpleValue(puzzle, location, solution[location.r][location.c]);
  }
}

/**
 * Averages three sampled refutation runs, rounded down, using one Mulberry32
 * stream seeded with 81 across all runs. Repeated calls are deterministic.
 *
 * Each run permits 32 wrong-candidate trials. Returns null if any run cannot
 * refute a cell or needs another trial after exhausting its budget. Null means
 * this bounded method could not rate the puzzle, not a difficulty category.
 *
 * Inputs must be prevalidated with a matching supplied solution. User notes are
 * ignored; neither input is mutated. Completed ratings are not cached.
 */
export function getRefutationScore(
  puzzle: readonly (readonly CellProps[])[],
  solution: readonly (readonly SudokuNumber[])[]
): number | null {
  const initial = prepareSimplePuzzle(puzzle);
  const nextRandom = createSeededRandom();
  let total = 0;

  for (let run = 0; run < REFUTATION_RUN_COUNT; run += 1) {
    const score = scoreRun(initial, solution, nextRandom);
    if (score === null) {
      return null;
    }
    total += score;
  }

  return Math.floor(total / REFUTATION_RUN_COUNT);
}
