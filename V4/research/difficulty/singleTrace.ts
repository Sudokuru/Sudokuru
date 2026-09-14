import type { CellProps, SudokuNumber } from "../../Types";
import { applyHint } from "../../applyHint";
import { getObviousSingleHint } from "../../obviousSingle";
import { clonePuzzle } from "../../puzzles";
import { safeRatio } from "./statistics";
import type { Features } from "./features";
import { INITIAL_MODEL_FEATURES } from "./features";

/** Model inputs for experiments combining initial-board features with this trace. */
export const TRACE_MODEL_FEATURES = [
  ...INITIAL_MODEL_FEATURES, "tracePlacements", "traceFilledFraction", "traceRemaining", "traceSolved",
  "availabilityCount10", "availabilityMean10", "availabilityMin10",
  "availabilityCount25", "availabilityMean25", "availabilityMin25",
] as const;

export interface SingleTrace {
  /** Numeric trace summaries; callers merge these with initial-board features. */
  readonly features: Features;
  /** Stalled means empty cells remain but no obvious single can advance the board. */
  readonly status: "solved" | "stalled";
  /** Values actually placed, in order, with zero-based row and column coordinates. */
  readonly placements: readonly { r: number; c: number; value: number }[];
  /** availability[i] counts all obvious singles available before placements[i]. */
  readonly availability: readonly number[];
}

/**
 * Measures how far obvious singles carry a 9x9 puzzle and how many choices are
 * available along the way. Fewer available singles may indicate a bottleneck
 * for a human solver; these measurements let the research test that hypothesis.
 *
 * The input board must already contain legal candidate notes. Each step uses
 * V4's hint detection and application, choosing the first single in row-major
 * order so repeated runs follow the same path. The supplied solution only
 * checks deductions through the hint API; it never supplies a move on its own.
 * Stops when solved or when harder techniques would be needed. Inputs are not
 * mutated, and the returned trace contains only obvious-single placements.
 */
export function singleTrace(
  initialBoard: readonly (readonly CellProps[])[],
  solution: readonly (readonly SudokuNumber[])[]
): SingleTrace {
  // Work on an independent board; retain the initial empty count as the
  // denominator for progress, even as notes become placed values.
  let board = clonePuzzle(initialBoard);
  const originalEmpty = board.flat().filter(cell => cell.type === "note").length;
  const availability: number[] = [];
  const placements: { r: number; c: number; value: number }[] = [];
  // One placement fills one cell, so 81 is an absolute bound for a 9x9 board.
  while (placements.length < 81) {
    // Rescan after each placement: removing its value from peers can unlock
    // new singles. Count every option, but take only the first one.
    const locations = board.flatMap((row, r) => row.flatMap((cell, c) =>
      cell.type === "note" && cell.notes.length === 1 ? [{ r, c }] : []));
    // A terminal board contributes no availability sample because no move
    // follows it. Remaining empty cells below distinguish a stall from a solve.
    if (locations.length === 0) break;
    const location = locations[0];
    const hint = getObviousSingleHint(board, solution, location);
    if (!hint) throw new Error("Legal single disagrees with the validated solution.");
    // Record the choice count before applying the hint, including its peer
    // note removals, so each sample describes the board before its placement.
    availability.push(locations.length);
    board = applyHint(board, hint);
    const placed = board[location.r][location.c];
    if (placed.type === "note") throw new Error("Single hint did not place a value.");
    placements.push({ ...location, value: placed.value });
  }
  // Summarize progress relative to the starting puzzle. The solved flag is
  // numeric for model fitting; safeRatio returns zero for an already-full board.
  const remaining = originalEmpty - placements.length;
  const features: Record<string, number> = {
    tracePlacements: placements.length,
    traceFilledFraction: safeRatio(placements.length, originalEmpty),
    traceRemaining: remaining,
    traceSolved: remaining === 0 ? 1 : 0,
  };
  // Compare early portions of the solve path. Mean measures typical choice
  // count; minimum captures its narrowest bottleneck. For example, [3, 1, 2]
  // has count 3, mean 2, and minimum 1 for either window below.
  // Short traces use only observed moves (no zero padding). Empty traces have
  // zero summaries; the count distinguishes them from windows with observations.
  for (const window of [10, 25]) {
    const sample = availability.slice(0, window);
    features[`availabilityCount${window}`] = sample.length;
    features[`availabilityMean${window}`] = safeRatio(sample.reduce((sum, n) => sum + n, 0), sample.length);
    features[`availabilityMin${window}`] = sample.length ? Math.min(...sample) : 0;
  }
  return { features, status: remaining === 0 ? "solved" : "stalled", placements, availability };
}
