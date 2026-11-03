import { locationsEqual } from "./cellLocations";
import { clonePuzzle } from "./puzzles";
import { getUnitLocations } from "./units";
import { UNIT_PRECEDENCE } from "./Types";
import type {
  CellLocation,
  CellProps,
  SudokuNumber,
  Unit,
} from "./Types";

/**
 * Returns the sole target candidate absent from every peer in one unit.
 */
function getHiddenSingle(
  puzzle: readonly (readonly CellProps[])[],
  targetLocation: CellLocation,
  unit: Unit
): SudokuNumber | null {
  const target = puzzle[targetLocation.r][targetLocation.c];

  if (target.type !== "note") {
    return null;
  }

  const unitLocations = getUnitLocations(
    targetLocation,
    unit,
    puzzle.length
  );
  let hiddenSingle: SudokuNumber | null = null;

  for (const candidate of target.notes) {
    let existsInPeer = false;

    for (const location of unitLocations) {
      if (locationsEqual(location, targetLocation)) {
        continue;
      }

      const peer = puzzle[location.r][location.c];

      if (peer.type === "note" && peer.notes.includes(candidate)) {
        existsInPeer = true;
        break;
      }
    }

    if (existsInPeer) {
      continue;
    }

    if (hiddenSingle !== null) {
      return null;
    }

    hiddenSingle = candidate;
  }

  return hiddenSingle;
}

/**
 * Returns an obvious or row-, column-, or box-hidden single at one location.
 */
function getSingle(
  puzzle: readonly (readonly CellProps[])[],
  location: CellLocation
): SudokuNumber | null {
  const cell = puzzle[location.r][location.c];

  if (cell.type !== "note") {
    return null;
  }

  if (cell.notes.length === 1) {
    return cell.notes[0];
  }

  for (const unit of UNIT_PRECEDENCE) {
    const hiddenSingle = getHiddenSingle(puzzle, location, unit);

    if (hiddenSingle !== null) {
      return hiddenSingle;
    }
  }

  return null;
}

/**
 * Removes a placed value from all note-cell peers in row, column, and box order.
 */
function simplifyPeerNotes(
  puzzle: CellProps[][],
  targetLocation: CellLocation,
  value: SudokuNumber
): void {
  for (const unit of UNIT_PRECEDENCE) {
    const unitLocations = getUnitLocations(
      targetLocation,
      unit,
      puzzle.length
    );

    for (const location of unitLocations) {
      if (locationsEqual(location, targetLocation)) {
        continue;
      }

      const peer = puzzle[location.r][location.c];

      if (peer.type !== "note" || !peer.notes.includes(value)) {
        continue;
      }

      puzzle[location.r][location.c] = {
        type: "note",
        notes: peer.notes.filter((note) => note !== value),
      };
    }
  }
}

/**
 * Returns a fresh puzzle with every legal candidate derived from placed values.
 * User notes are ignored; givens and user-entered values constrain peers equally.
 */
export function prepareSimplePuzzle(
  puzzle: readonly (readonly CellProps[])[]
): CellProps[][] {
  const prepared = clonePuzzle(puzzle);
  const allNotes = Array.from({ length: puzzle.length }, (_, index) => index + 1);

  for (const row of prepared) {
    for (const cell of row) {
      if (cell.type === "note") {
        cell.notes = [...allNotes];
      }
    }
  }

  for (let r = 0; r < prepared.length; r += 1) {
    for (let c = 0; c < prepared.length; c += 1) {
      const cell = prepared[r][c];
      if (cell.type !== "note") {
        simplifyPeerNotes(prepared, { r, c }, cell.value);
      }
    }
  }

  return prepared;
}

/**
 * Places a value and removes it from peer notes in a new, independent puzzle.
 */
export function placeSimpleValue(
  puzzle: readonly (readonly CellProps[])[],
  location: CellLocation,
  value: SudokuNumber
): CellProps[][] {
  const updatedPuzzle = clonePuzzle(puzzle);
  updatedPuzzle[location.r][location.c] = { type: "value", value };
  simplifyPeerNotes(updatedPuzzle, location, value);
  return updatedPuzzle;
}

/**
 * Chooses uniformly among cells with an obvious or hidden single in row-major
 * order, then returns a new puzzle with that value placed and peers simplified.
 * Returns null when neither strategy can make progress. Only draws randomness
 * when more than one cell is eligible.
 */
export function solveSimpleStep(
  puzzle: readonly (readonly CellProps[])[],
  nextRandom: () => number
): CellProps[][] | null {
  const singles: { location: CellLocation; value: SudokuNumber }[] = [];

  for (let r = 0; r < puzzle.length; r += 1) {
    for (let c = 0; c < puzzle.length; c += 1) {
      const location = { r, c };
      const value = getSingle(puzzle, location);

      if (value !== null) {
        singles.push({ location, value });
      }
    }
  }

  if (singles.length === 0) {
    return null;
  }

  const index =
    singles.length === 1 ? 0 : Math.floor(nextRandom() * singles.length);
  const { location, value } = singles[index];
  return placeSimpleValue(puzzle, location, value);
}
