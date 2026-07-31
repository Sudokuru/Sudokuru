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
 * Returns every puzzle location in Fisher-Yates shuffled order.
 */
function getShuffledLocations(
  size: number,
  nextRandom: () => number
): CellLocation[] {
  const locations = Array.from(
    { length: size * size },
    (_, index): CellLocation => ({
      r: Math.floor(index / size),
      c: index % size,
    })
  );

  for (let index = locations.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(nextRandom() * (index + 1));
    const location = locations[index];
    locations[index] = locations[swapIndex];
    locations[swapIndex] = location;
  }

  return locations;
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
 * Returns a new puzzle with one randomized obvious or hidden single solved and
 * its peer notes simplified, or null when neither strategy can make progress.
 */
export function solveSimpleStep(
  puzzle: readonly (readonly CellProps[])[],
  nextRandom: () => number
): CellProps[][] | null {
  const locations = getShuffledLocations(puzzle.length, nextRandom);

  for (const location of locations) {
    const single = getSingle(puzzle, location);

    if (single === null) {
      continue;
    }

    const updatedPuzzle = clonePuzzle(puzzle);
    updatedPuzzle[location.r][location.c] = {
      type: "value",
      value: single,
    };
    simplifyPeerNotes(updatedPuzzle, location, single);
    return updatedPuzzle;
  }

  return null;
}
