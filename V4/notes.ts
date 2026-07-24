import type { SudokuValue } from "./Types";

/**
 * Returns true when two prevalidated note arrays contain the same values,
 * regardless of order.
 */
export function notesMatch(
  actualNotes: readonly SudokuValue[],
  expectedNotes: readonly SudokuValue[]
): boolean {
  if (actualNotes.length !== expectedNotes.length) {
    return false;
  }

  const expectedValues = new Set(expectedNotes);
  return actualNotes.every((note) => expectedValues.has(note));
}
