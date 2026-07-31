import { createSeededRandom } from "./random";
import { BOX_LAYOUTS } from "./Types";
import type { BoxLayout, CellProps, SudokuNumber } from "./Types";

const REFUTATION_RUN_COUNT = 30;
const MAX_CACHED_REFUTATION_SCORES = 32;
const refutationScoreCache = new Map<string, number>();

type BoardGeometry = {
  size: number;
  cellCount: number;
  layout: BoxLayout;
  rowByCell: Uint8Array;
  columnByCell: Uint8Array;
  boxByCell: Uint8Array;
  rowPeers: Uint8Array[];
  columnPeers: Uint8Array[];
  boxPeers: Uint8Array[];
  allPeers: Uint8Array[];
};

type RefutationBoard = {
  geometry: BoardGeometry;
  state: Uint16Array;
  values: Uint16Array;
  candidates: Uint16Array;
  rowValues: Uint16Array;
  columnValues: Uint16Array;
  boxValues: Uint16Array;
  hasDuplicates: boolean;
  remainingCellCount: number;
};

type SolverScratch = {
  orderedLocations: Uint8Array;
  shuffledLocations: Uint8Array;
};

/**
 * Builds a compact key from the state that affects refutation scoring.
 *
 * Note contents and the distinction between given and user-entered values are
 * intentionally omitted because the scoring algorithm treats them identically.
 */
function getRefutationScoreCacheKey(
  puzzle: readonly (readonly CellProps[])[],
  solution: readonly (readonly SudokuNumber[])[],
  boost: number
): string {
  let key = `${puzzle.length}:${boost}:`;

  for (const row of puzzle) {
    for (const cell of row) {
      key += cell.type === "note" ? "0" : String(cell.value);
    }
  }

  key += ":";

  for (const row of solution) {
    for (const value of row) {
      key += String(value);
    }
  }

  return key;
}

/**
 * Retains a bounded least-recently-used set of completed pure calculations.
 */
function cacheRefutationScore(key: string, score: number): void {
  if (refutationScoreCache.size >= MAX_CACHED_REFUTATION_SCORES) {
    const oldestKey = refutationScoreCache.keys().next().value;

    if (oldestKey !== undefined) {
      refutationScoreCache.delete(oldestKey);
    }
  }

  refutationScoreCache.set(key, score);
}

/**
 * Creates one contiguous mutable state buffer and typed views into each region.
 *
 * Keeping branch state contiguous lets the refutation hot path clone it with
 * one native typed-array copy instead of five separate copies.
 */
function createBoardState(geometry: BoardGeometry): Omit<
  RefutationBoard,
  "geometry" | "hasDuplicates" | "remainingCellCount"
> {
  const { cellCount, size } = geometry;
  const candidatesOffset = cellCount;
  const rowValuesOffset = candidatesOffset + cellCount;
  const columnValuesOffset = rowValuesOffset + size;
  const boxValuesOffset = columnValuesOffset + size;
  const state = new Uint16Array(boxValuesOffset + size);

  return {
    state,
    values: state.subarray(0, candidatesOffset),
    candidates: state.subarray(candidatesOffset, rowValuesOffset),
    rowValues: state.subarray(rowValuesOffset, columnValuesOffset),
    columnValues: state.subarray(columnValuesOffset, boxValuesOffset),
    boxValues: state.subarray(boxValuesOffset),
  };
}

/**
 * Precomputes every unit relationship used by the refutation hot path.
 */
function createBoardGeometry(size: number, layout: BoxLayout): BoardGeometry {
  const cellCount = size * size;
  const rowByCell = new Uint8Array(cellCount);
  const columnByCell = new Uint8Array(cellCount);
  const boxByCell = new Uint8Array(cellCount);
  const rowPeers: Uint8Array[] = [];
  const columnPeers: Uint8Array[] = [];
  const boxPeers: Uint8Array[] = [];
  const allPeers: Uint8Array[] = [];
  const boxColumnCount = size / layout.boxWidth;

  for (let cellIndex = 0; cellIndex < cellCount; cellIndex += 1) {
    const row = Math.floor(cellIndex / size);
    const column = cellIndex % size;
    const box =
      Math.floor(row / layout.boxHeight) * boxColumnCount +
      Math.floor(column / layout.boxWidth);
    const firstBoxRow =
      Math.floor(row / layout.boxHeight) * layout.boxHeight;
    const firstBoxColumn =
      Math.floor(column / layout.boxWidth) * layout.boxWidth;
    const cellRowPeers: number[] = [];
    const cellColumnPeers: number[] = [];
    const cellBoxPeers: number[] = [];
    const cellAllPeers: number[] = [];

    rowByCell[cellIndex] = row;
    columnByCell[cellIndex] = column;
    boxByCell[cellIndex] = box;

    for (let peerColumn = 0; peerColumn < size; peerColumn += 1) {
      if (peerColumn !== column) {
        const peerIndex = row * size + peerColumn;
        cellRowPeers.push(peerIndex);
        cellAllPeers.push(peerIndex);
      }
    }

    for (let peerRow = 0; peerRow < size; peerRow += 1) {
      if (peerRow !== row) {
        const peerIndex = peerRow * size + column;
        cellColumnPeers.push(peerIndex);
        cellAllPeers.push(peerIndex);
      }
    }

    for (
      let peerRow = firstBoxRow;
      peerRow < firstBoxRow + layout.boxHeight;
      peerRow += 1
    ) {
      for (
        let peerColumn = firstBoxColumn;
        peerColumn < firstBoxColumn + layout.boxWidth;
        peerColumn += 1
      ) {
        if (peerRow === row && peerColumn === column) {
          continue;
        }

        const peerIndex = peerRow * size + peerColumn;
        cellBoxPeers.push(peerIndex);

        if (peerRow !== row && peerColumn !== column) {
          cellAllPeers.push(peerIndex);
        }
      }
    }

    rowPeers.push(Uint8Array.from(cellRowPeers));
    columnPeers.push(Uint8Array.from(cellColumnPeers));
    boxPeers.push(Uint8Array.from(cellBoxPeers));
    allPeers.push(Uint8Array.from(cellAllPeers));
  }

  return {
    size,
    cellCount,
    layout,
    rowByCell,
    columnByCell,
    boxByCell,
    rowPeers,
    columnPeers,
    boxPeers,
    allPeers,
  };
}

const BOARD_GEOMETRIES: Record<number, BoardGeometry> = Object.fromEntries(
  Object.entries(BOX_LAYOUTS).map(([size, layout]) => [
    Number(size),
    createBoardGeometry(Number(size), layout),
  ])
);

/**
 * Removes a placed value from the candidate masks of its row, column, and box peers.
 */
function simplifyCandidates(board: RefutationBoard, cellIndex: number): void {
  const candidateBit = 1 << (board.values[cellIndex] - 1);
  const retainedCandidates = ~candidateBit;
  const peers = board.geometry.allPeers[cellIndex];

  for (let peerIndex = 0; peerIndex < peers.length; peerIndex += 1) {
    board.candidates[peers[peerIndex]] &= retainedCandidates;
  }
}

/**
 * Places a value and updates duplicate tracking, optionally simplifying peers.
 */
function placeValue(
  board: RefutationBoard,
  cellIndex: number,
  value: SudokuNumber,
  shouldSimplifyCandidates: boolean
): void {
  const { geometry } = board;
  const row = geometry.rowByCell[cellIndex];
  const column = geometry.columnByCell[cellIndex];
  const box = geometry.boxByCell[cellIndex];
  const valueBit = 1 << (value - 1);

  if (
    (board.rowValues[row] & valueBit) !== 0 ||
    (board.columnValues[column] & valueBit) !== 0 ||
    (board.boxValues[box] & valueBit) !== 0
  ) {
    board.hasDuplicates = true;
  }

  board.values[cellIndex] = value;
  board.remainingCellCount -= 1;
  board.rowValues[row] |= valueBit;
  board.columnValues[column] |= valueBit;
  board.boxValues[box] |= valueBit;

  if (shouldSimplifyCandidates) {
    simplifyCandidates(board, cellIndex);
  }
}

/**
 * Creates compact refutation state and derives candidates from placed values.
 */
function createRefutationBoard(
  puzzle: readonly (readonly CellProps[])[]
): RefutationBoard {
  const size = puzzle.length;
  const geometry = BOARD_GEOMETRIES[size];
  const state = createBoardState(geometry);
  const { values, candidates } = state;
  const allCandidates = (1 << size) - 1;

  for (let row = 0; row < size; row += 1) {
    for (let column = 0; column < size; column += 1) {
      const cellIndex = row * size + column;
      const cell = puzzle[row][column];

      if (cell.type === "note") {
        candidates[cellIndex] = allCandidates;
      } else {
        values[cellIndex] = cell.value;
      }
    }
  }

  const board: RefutationBoard = {
    geometry,
    ...state,
    hasDuplicates: false,
    remainingCellCount: geometry.cellCount,
  };

  for (
    let cellIndex = 0;
    cellIndex < geometry.cellCount;
    cellIndex += 1
  ) {
    if (values[cellIndex] !== 0) {
      const value = values[cellIndex];
      values[cellIndex] = 0;
      placeValue(board, cellIndex, value, true);
    }
  }

  return board;
}

/**
 * Creates empty reusable storage with the same geometry as a source board.
 */
function createBoardStorage(source: RefutationBoard): RefutationBoard {
  const state = createBoardState(source.geometry);

  return {
    geometry: source.geometry,
    ...state,
    hasDuplicates: false,
    remainingCellCount: source.geometry.cellCount,
  };
}

/**
 * Copies values and candidates into an existing independent solving branch.
 */
function copyRefutationBoard(
  source: RefutationBoard,
  target: RefutationBoard
): void {
  target.state.set(source.state);
  target.hasDuplicates = source.hasDuplicates;
  target.remainingCellCount = source.remainingCellCount;
}

/**
 * Returns the sole candidate index in a mask, or -1 when there is not exactly one.
 */
function getOnlyCandidate(candidateMask: number): number {
  if (
    candidateMask === 0 ||
    (candidateMask & (candidateMask - 1)) !== 0
  ) {
    return -1;
  }

  return 31 - Math.clz32(candidateMask);
}

/**
 * Finds an obvious or row-, column-, or box-hidden single at one cell.
 */
function getSingleCandidate(
  board: RefutationBoard,
  cellIndex: number
): number {
  const { candidates, geometry } = board;
  const cellCandidates = candidates[cellIndex];
  const obviousSingle = getOnlyCandidate(cellCandidates);

  if (obviousSingle !== -1) {
    return obviousSingle;
  }

  const rowPeers = geometry.rowPeers[cellIndex];
  let hiddenCandidates = cellCandidates;

  for (let peerIndex = 0; peerIndex < rowPeers.length; peerIndex += 1) {
    hiddenCandidates &= ~candidates[rowPeers[peerIndex]];
  }

  const rowHiddenSingle = getOnlyCandidate(hiddenCandidates);

  if (rowHiddenSingle !== -1) {
    return rowHiddenSingle;
  }

  hiddenCandidates = cellCandidates;
  const columnPeers = geometry.columnPeers[cellIndex];

  for (
    let peerIndex = 0;
    peerIndex < columnPeers.length;
    peerIndex += 1
  ) {
    hiddenCandidates &= ~candidates[columnPeers[peerIndex]];
  }

  const columnHiddenSingle = getOnlyCandidate(hiddenCandidates);

  if (columnHiddenSingle !== -1) {
    return columnHiddenSingle;
  }

  hiddenCandidates = cellCandidates;
  const boxPeers = geometry.boxPeers[cellIndex];

  for (let peerIndex = 0; peerIndex < boxPeers.length; peerIndex += 1) {
    hiddenCandidates &= ~candidates[boxPeers[peerIndex]];
  }

  return getOnlyCandidate(hiddenCandidates);
}

/**
 * Creates reusable row-major and shuffled location buffers.
 */
function createSolverScratch(cellCount: number): SolverScratch {
  const orderedLocations = new Uint8Array(cellCount);

  for (let cellIndex = 0; cellIndex < cellCount; cellIndex += 1) {
    orderedLocations[cellIndex] = cellIndex;
  }

  return {
    orderedLocations,
    shuffledLocations: new Uint8Array(cellCount),
  };
}

/**
 * Places one seeded-random obvious or hidden single when available.
 */
function solveSingleStep(
  board: RefutationBoard,
  nextRandom: () => number,
  scratch: SolverScratch
): boolean {
  const { shuffledLocations, orderedLocations } = scratch;
  shuffledLocations.set(orderedLocations);
  const cellCount = board.geometry.cellCount;

  for (let index = cellCount - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(nextRandom() * (index + 1));
    const cellIndex = shuffledLocations[index];
    shuffledLocations[index] = shuffledLocations[swapIndex];
    shuffledLocations[swapIndex] = cellIndex;
  }

  for (
    let locationIndex = 0;
    locationIndex < cellCount;
    locationIndex += 1
  ) {
    const cellIndex = shuffledLocations[locationIndex];

    if (board.values[cellIndex] !== 0) {
      continue;
    }

    const candidateIndex = getSingleCandidate(board, cellIndex);

    if (candidateIndex === -1) {
      continue;
    }

    placeValue(board, cellIndex, candidateIndex + 1, true);
    return true;
  }

  return false;
}

/**
 * Returns true when a row, column, or box contains a duplicate placed value.
 */
function hasDuplicateValues(board: RefutationBoard): boolean {
  return board.hasDuplicates;
}

/**
 * Returns true when every cell contains a placed value.
 */
function isSolved(board: RefutationBoard): boolean {
  return board.remainingCellCount === 0;
}

/**
 * Flattens the immutable solution for hot-path indexed access.
 */
function getSolutionValues(
  solution: readonly (readonly SudokuNumber[])[],
  size: number
): Uint8Array {
  const solutionValues = new Uint8Array(size * size);

  for (let row = 0; row < size; row += 1) {
    for (let column = 0; column < size; column += 1) {
      solutionValues[row * size + column] = solution[row][column];
    }
  }

  return solutionValues;
}

/**
 * Returns a puzzle's refutation score for the supplied solution.
 *
 * The boost must be between 0 and 1 and controls the proportion of remaining
 * cells that may be skipped after a refutation candidate has been found.
 */
export function getRefutationScore(
  puzzle: readonly (readonly CellProps[])[],
  solution: readonly (readonly SudokuNumber[])[],
  boost: number
): number {
  const cacheKey = getRefutationScoreCacheKey(puzzle, solution, boost);
  const cachedScore = refutationScoreCache.get(cacheKey);

  if (cachedScore !== undefined) {
    refutationScoreCache.delete(cacheKey);
    refutationScoreCache.set(cacheKey, cachedScore);
    return cachedScore;
  }

  const initialBoard = createRefutationBoard(puzzle);
  const board = createBoardStorage(initialBoard);
  const branchBoard = createBoardStorage(initialBoard);
  const { size, cellCount } = initialBoard.geometry;
  const solutionValues = getSolutionValues(solution, size);
  const solverScratch = createSolverScratch(cellCount);
  const nextRandom = createSeededRandom();
  let totalRefutationScore = 0;

  for (let run = 0; run < REFUTATION_RUN_COUNT; run += 1) {
    copyRefutationBoard(initialBoard, board);

    while (!isSolved(board)) {
      while (solveSingleStep(board, nextRandom, solverScratch)) {
        // Continue until obvious and hidden singles are exhausted.
      }

      let lowestRefutationScore = Number.POSITIVE_INFINITY;
      let lowestScoreIndex = -1;

      for (
        let cellIndex = 0;
        cellIndex < cellCount;
        cellIndex += 1
      ) {
        if (board.values[cellIndex] !== 0) {
          continue;
        }

        if (lowestScoreIndex !== -1 && nextRandom() < boost) {
          continue;
        }

        const cellCandidates = board.candidates[cellIndex];

        for (
          let candidateIndex = 0;
          candidateIndex < size;
          candidateIndex += 1
        ) {
          const candidate = candidateIndex + 1;

          if (
            candidate === solutionValues[cellIndex] ||
            (cellCandidates & (1 << candidateIndex)) === 0
          ) {
            continue;
          }

          copyRefutationBoard(board, branchBoard);
          placeValue(branchBoard, cellIndex, candidate, true);

          let candidateRefutationScore = 0;

          while (true) {
            candidateRefutationScore += 1;

            if (
              hasDuplicateValues(branchBoard) ||
              !solveSingleStep(branchBoard, nextRandom, solverScratch)
            ) {
              break;
            }
          }

          if (candidateRefutationScore < lowestRefutationScore) {
            lowestRefutationScore = candidateRefutationScore;
            lowestScoreIndex = cellIndex;
          }
        }
      }

      if (lowestScoreIndex === -1) {
        break;
      }

      totalRefutationScore += lowestRefutationScore;
      placeValue(
        board,
        lowestScoreIndex,
        solutionValues[lowestScoreIndex],
        false
      );
    }
  }

  const score = Math.floor(totalRefutationScore / REFUTATION_RUN_COUNT);
  cacheRefutationScore(cacheKey, score);
  return score;
}
