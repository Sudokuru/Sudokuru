import type { CellProps } from "../../Types";
import { getPuzzle } from "../../validate";
import { getAmendNotesHint } from "../../amendNotes";
import { applyHint } from "../../applyHint";
import { safeRatio } from "./statistics";

export type Features = Readonly<Record<string, number>>;

/** Initial 9x9 features use the same note amendment behavior as V4 hints. */
export function initialFeatures(puzzle: string): { board: CellProps[][]; features: Features } {
  if (puzzle.length !== 81) throw new Error("Difficulty research supports 9x9 puzzles only.");
  let board = getPuzzle(puzzle);
  // Amend-notes uses the solution only to avoid suggesting a cell whose
  // correct value is already present. A zero sentinel is never a legal note,
  // so every empty cell is eligible for note amendment, including puzzles
  // that are intentionally incomplete or have multiple solutions.
  const solution = Array.from({ length: 9 }, () => Array(9).fill(0));
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board.length; c++) {
      if (board[r][c].type !== "note") continue;
      const hint = getAmendNotesHint(board, solution, { r, c });
      if (hint) board = applyHint(board, hint);
    }
  }
  const counts = board.flat().flatMap(cell => cell.type === "note" ? [cell.notes.length] : []);
  if (counts.includes(0)) throw new Error("An empty cell has no legal candidates.");
  const empty = counts.length;
  const notes = counts.reduce((sum, n) => sum + n, 0);
  const singles = counts.filter(n => n === 1).length;
  const pairs = counts.filter(n => n === 2).length;
  const triples = counts.filter(n => n === 3).length;
  const many = counts.filter(n => n >= 4).length;
  const mean = safeRatio(notes, empty);
  return { board, features: {
    empty, notes,
    meanNotes: mean,
    singles, singleFraction: safeRatio(singles, empty), singlesPerCandidate: safeRatio(singles, notes),
    pairs, pairFraction: safeRatio(pairs, empty),
    triples, tripleFraction: safeRatio(triples, empty),
    many, manyFraction: safeRatio(many, empty),
    candidateVariance: safeRatio(counts.reduce((sum, n) => sum + (n - mean) ** 2, 0), empty),
    emptyPerSingle: safeRatio(empty, singles + 1), notesPerSingle: safeRatio(notes, singles + 1),
  } };
}

// Total notes, mean notes, and empty count can contribute differently to a linear model.
export const INITIAL_MODEL_FEATURES = [
  "empty", "notes", "meanNotes", "singles", "singleFraction", "singlesPerCandidate",
  "pairs", "pairFraction", "triples", "tripleFraction", "many", "manyFraction",
  "candidateVariance", "emptyPerSingle", "notesPerSingle",
] as const;
