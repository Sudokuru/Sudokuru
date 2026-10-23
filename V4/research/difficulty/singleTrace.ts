import type { CellProps, SudokuNumber } from "../../Types";
import { applyHint } from "../../applyHint";
import { getObviousSingleHint } from "../../obviousSingle";
import { clonePuzzle } from "../../puzzles";
import { safeRatio } from "./statistics";
import type { Features, TraceFeatures } from "./featureTypes";
import { INITIAL_MODEL_FEATURES } from "./features";
import { EARLY_TRACE_LIMIT } from "./settings";

/** Model inputs for experiments combining initial-board features with this trace. */
export const TRACE_MODEL_FEATURES = [
  ...INITIAL_MODEL_FEATURES, "tracePlacements", "traceFilledFraction", "traceRemaining", "traceSolved",
  "availabilityCount10", "availabilityMean10", "availabilityMin10",
  "availabilityCount25", "availabilityMean25", "availabilityMin25",
] as const satisfies readonly (keyof Features)[];

export interface SingleTrace {
  /** Numeric trace summaries; callers merge these with initial-board features. */
  readonly features: TraceFeatures;
  /** Limited means the budget ended with singles remaining; stalled means none remain. */
  readonly status: "solved" | "stalled" | "limited";
  readonly early: {
    readonly limit: number;
    readonly placements: number;
    readonly candidatesBefore: number;
    readonly candidatesAfter: number;
    readonly forcedMoves: number;
  };
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
 * Stops when solved, when harder techniques are needed, or at the placement budget. Inputs are not
 * mutated, and the returned trace contains only obvious-single placements.
 */
export function singleTrace(
  initialBoard: readonly (readonly CellProps[])[],
  solution: readonly (readonly SudokuNumber[])[],
  maxPlacements = 81,
): SingleTrace {
  if (!Number.isInteger(maxPlacements) || maxPlacements < 0 || maxPlacements > 81) {
    throw new Error("Trace placement limit must be an integer from 0 to 81.");
  }
  // Work on an independent board; retain the initial empty count as the
  // denominator for progress, even as notes become placed values.
  let board = clonePuzzle(initialBoard);
  const originalEmpty = board.flat().filter(cell => cell.type === "note").length;
  const candidateCount = () => board.reduce((total, row) => total + row.reduce((sum, cell) =>
    sum + (cell.type === "note" ? cell.notes.length : 0), 0), 0);
  const candidatesBefore = candidateCount();
  let earlyCandidatesAfter = candidatesBefore;
  const availability: number[] = [];
  const placements: { r: number; c: number; value: number }[] = [];
  // One placement fills one cell, so 81 is an absolute bound for a 9x9 board.
  while (placements.length < maxPlacements) {
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
    if (placements.length === EARLY_TRACE_LIMIT) earlyCandidatesAfter = candidateCount();
  }
  // Summarize progress relative to the starting puzzle. The solved flag is
  // numeric for model fitting; safeRatio returns zero for an already-full board.
  const remaining = originalEmpty - placements.length;
  if (placements.length < EARLY_TRACE_LIMIT) earlyCandidatesAfter = candidateCount();
  const earlyAvailability = availability.slice(0, EARLY_TRACE_LIMIT);
  // Compare early portions of the solve path: mean counts typical choices,
  // minimum captures the bottleneck. Short traces use observed moves only;
  // empty traces have zero summaries, distinguished by their zero count.
  const summarize = (window: number) => {
    const sample = availability.slice(0, window);
    return {
      count: sample.length,
      mean: safeRatio(sample.reduce((sum, n) => sum + n, 0), sample.length),
      min: sample.length ? Math.min(...sample) : 0,
    };
  };
  const first10 = summarize(10);
  const first25 = summarize(25);
  const features: TraceFeatures = {
    tracePlacements: placements.length,
    traceFilledFraction: safeRatio(placements.length, originalEmpty),
    traceRemaining: remaining,
    traceSolved: remaining === 0 ? 1 : 0,
    availabilityCount10: first10.count,
    availabilityMean10: first10.mean,
    availabilityMin10: first10.min,
    availabilityCount25: first25.count,
    availabilityMean25: first25.mean,
    availabilityMin25: first25.min,
    earlyCandidateReduction10: candidatesBefore - earlyCandidatesAfter - earlyAvailability.length,
    earlyBottleneck10: earlyAvailability.reduce((sum, count) => sum + 1 / count, 0),
  };
  const status = remaining === 0 ? "solved" :
    board.some(row => row.some(cell => cell.type === "note" && cell.notes.length === 1)) ? "limited" : "stalled";
  return { features, status, placements, availability, early: {
    limit: EARLY_TRACE_LIMIT, placements: earlyAvailability.length, candidatesBefore,
    candidatesAfter: earlyCandidatesAfter, forcedMoves: earlyAvailability.filter(count => count === 1).length,
  } };
}
