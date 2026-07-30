import type {
  CellProps,
  Hint,
  HintStage,
  NoteCellWithLocation,
  ValueCellWithLocation,
} from "./Types";
import { clonePuzzle } from "./puzzles";

function removeValues(
  puzzle: CellProps[][],
  values: readonly ValueCellWithLocation[]
): void {
  for (const { r, c } of values) {
    puzzle[r][c] = { type: "note", notes: [] };
  }
}

function removeNotes(
  puzzle: CellProps[][],
  noteCells: readonly NoteCellWithLocation[]
): void {
  for (const { r, c, notes } of noteCells) {
    const cell = puzzle[r][c];

    if (cell.type !== "note") {
      continue;
    }

    const notesToRemove = new Set(notes);
    puzzle[r][c] = {
      type: "note",
      notes: cell.notes.filter((note) => !notesToRemove.has(note)),
    };
  }
}

function placeValues(
  puzzle: CellProps[][],
  values: readonly ValueCellWithLocation[]
): void {
  for (const { r, c, value } of values) {
    puzzle[r][c] = { type: "value", value };
  }
}

function placeNotes(
  puzzle: CellProps[][],
  noteCells: readonly NoteCellWithLocation[]
): void {
  for (const { r, c, notes } of noteCells) {
    const cell = puzzle[r][c];
    const existingNotes = cell.type === "note" ? cell.notes : [];

    puzzle[r][c] = {
      type: "note",
      notes: [...new Set([...existingNotes, ...notes])],
    };
  }
}

function applyStage(puzzle: CellProps[][], stage: HintStage): void {
  removeValues(puzzle, stage.removeValues ?? []);
  removeNotes(puzzle, stage.removeNotes ?? []);
  placeValues(puzzle, stage.placeValues ?? []);
  placeNotes(puzzle, stage.placeNotes ?? []);
}

/**
 * Applies a hint and returns the updated puzzle as a new immutable instance.
 */
export function applyHint(
  puzzle: readonly (readonly CellProps[])[],
  hint: Hint
): CellProps[][] {
  const updatedPuzzle = clonePuzzle(puzzle);

  for (const stage of hint.stages) {
    applyStage(updatedPuzzle, stage);
  }

  return updatedPuzzle;
}
