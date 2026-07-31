import type { CellProps } from "./Types";

/**
 * Creates a puzzle copy with independent rows, cells, and note arrays.
 */
export function clonePuzzle(
  puzzle: readonly (readonly CellProps[])[]
): CellProps[][] {
  return puzzle.map((row) =>
    row.map((cell) =>
      cell.type === "note"
        ? { ...cell, notes: [...cell.notes] }
        : { ...cell }
    )
  );
}
