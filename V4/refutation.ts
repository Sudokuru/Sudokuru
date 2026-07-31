import { BOX_LAYOUTS } from "./Types";
import { createSeededRandom } from "./random";
import type {
  BoxLayout,
  CellLocation,
  CellProps,
  SudokuNumber,
} from "./Types";

const REFUTATION_RUN_COUNT = 30;

type RefutationCell = {
  value: SudokuNumber;
  candidates: boolean[];
};

type RefutationBoard = RefutationCell[][];

/**
 * Removes a placed value from the candidates of its row, column, and box peers.
 */
function simplifyCandidates(
  board: RefutationBoard,
  row: number,
  column: number
): void {
  const size = board.length;
  const candidateIndex = board[row][column].value - 1;
  const layout: BoxLayout = BOX_LAYOUTS[size];

  for (let peerColumn = 0; peerColumn < size; peerColumn += 1) {
    if (peerColumn !== column) {
      board[row][peerColumn].candidates[candidateIndex] = false;
    }
  }

  for (let peerRow = 0; peerRow < size; peerRow += 1) {
    if (peerRow !== row) {
      board[peerRow][column].candidates[candidateIndex] = false;
    }
  }

  const firstBoxRow =
    Math.floor(row / layout.boxHeight) * layout.boxHeight;
  const firstBoxColumn =
    Math.floor(column / layout.boxWidth) * layout.boxWidth;

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
      if (peerRow !== row || peerColumn !== column) {
        board[peerRow][peerColumn].candidates[candidateIndex] = false;
      }
    }
  }
}

/**
 * Creates fresh refutation state and derives candidates from placed values.
 */
function createRefutationBoard(
  puzzle: readonly (readonly CellProps[])[]
): RefutationBoard {
  const size = puzzle.length;
  const board: RefutationBoard = puzzle.map((row) =>
    row.map((cell) =>
      cell.type === "note"
        ? { value: 0, candidates: new Array(size).fill(true) }
        : { value: cell.value, candidates: new Array(size).fill(false) }
    )
  );

  for (let row = 0; row < size; row += 1) {
    for (let column = 0; column < size; column += 1) {
      if (board[row][column].value !== 0) {
        simplifyCandidates(board, row, column);
      }
    }
  }

  return board;
}

/**
 * Copies values and candidate arrays for an independent solving branch.
 */
function cloneRefutationBoard(board: RefutationBoard): RefutationBoard {
  return board.map((row) =>
    row.map((cell) => ({
      value: cell.value,
      candidates: [...cell.candidates],
    }))
  );
}

/**
 * Returns the sole candidate index, or -1 when there is not exactly one.
 */
function getOnlyCandidate(candidates: readonly boolean[]): number {
  let onlyCandidate = -1;

  for (
    let candidateIndex = 0;
    candidateIndex < candidates.length;
    candidateIndex += 1
  ) {
    if (!candidates[candidateIndex]) {
      continue;
    }

    if (onlyCandidate !== -1) {
      return -1;
    }

    onlyCandidate = candidateIndex;
  }

  return onlyCandidate;
}

/**
 * Removes all candidates present in a peer from a candidate snapshot.
 */
function removePeerCandidates(
  candidates: boolean[],
  peerCandidates: readonly boolean[]
): void {
  for (
    let candidateIndex = 0;
    candidateIndex < candidates.length;
    candidateIndex += 1
  ) {
    if (peerCandidates[candidateIndex]) {
      candidates[candidateIndex] = false;
    }
  }
}

/**
 * Finds an obvious or row-, column-, or box-hidden single at one cell.
 */
function getSingleCandidate(
  board: RefutationBoard,
  row: number,
  column: number
): number {
  const size = board.length;
  const cellCandidates = board[row][column].candidates;
  const obviousSingle = getOnlyCandidate(cellCandidates);

  if (obviousSingle !== -1) {
    return obviousSingle;
  }

  let hiddenCandidates = [...cellCandidates];

  for (let peerColumn = 0; peerColumn < size; peerColumn += 1) {
    if (peerColumn !== column) {
      removePeerCandidates(
        hiddenCandidates,
        board[row][peerColumn].candidates
      );
    }
  }

  const rowHiddenSingle = getOnlyCandidate(hiddenCandidates);

  if (rowHiddenSingle !== -1) {
    return rowHiddenSingle;
  }

  hiddenCandidates = [...cellCandidates];

  for (let peerRow = 0; peerRow < size; peerRow += 1) {
    if (peerRow !== row) {
      removePeerCandidates(hiddenCandidates, board[peerRow][column].candidates);
    }
  }

  const columnHiddenSingle = getOnlyCandidate(hiddenCandidates);

  if (columnHiddenSingle !== -1) {
    return columnHiddenSingle;
  }

  hiddenCandidates = [...cellCandidates];

  const layout: BoxLayout = BOX_LAYOUTS[size];
  const firstBoxRow =
    Math.floor(row / layout.boxHeight) * layout.boxHeight;
  const firstBoxColumn =
    Math.floor(column / layout.boxWidth) * layout.boxWidth;

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
      if (peerRow !== row || peerColumn !== column) {
        removePeerCandidates(
          hiddenCandidates,
          board[peerRow][peerColumn].candidates
        );
      }
    }
  }

  return getOnlyCandidate(hiddenCandidates);
}

/**
 * Places one seeded-random obvious or hidden single when available.
 */
function solveSingleStep(
  board: RefutationBoard,
  nextRandom: () => number
): boolean {
  const size = board.length;
  const locations: CellLocation[] = [];

  for (let row = 0; row < size; row += 1) {
    for (let column = 0; column < size; column += 1) {
      locations.push({ r: row, c: column });
    }
  }

  for (let index = locations.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(nextRandom() * (index + 1));
    const location = locations[index];
    locations[index] = locations[swapIndex];
    locations[swapIndex] = location;
  }

  for (const { r: row, c: column } of locations) {
    if (board[row][column].value !== 0) {
      continue;
    }

    const candidateIndex = getSingleCandidate(board, row, column);

    if (candidateIndex === -1) {
      continue;
    }

    board[row][column].value = candidateIndex + 1;
    simplifyCandidates(board, row, column);
    return true;
  }

  return false;
}

/**
 * Returns true when a row, column, or box contains a duplicate placed value.
 */
function hasDuplicateValues(board: RefutationBoard): boolean {
  const size = board.length;

  for (let row = 0; row < size; row += 1) {
    const values = new Set<SudokuNumber>();

    for (let column = 0; column < size; column += 1) {
      const value = board[row][column].value;

      if (value !== 0 && values.has(value)) {
        return true;
      }

      if (value !== 0) {
        values.add(value);
      }
    }
  }

  for (let column = 0; column < size; column += 1) {
    const values = new Set<SudokuNumber>();

    for (let row = 0; row < size; row += 1) {
      const value = board[row][column].value;

      if (value !== 0 && values.has(value)) {
        return true;
      }

      if (value !== 0) {
        values.add(value);
      }
    }
  }

  const layout: BoxLayout = BOX_LAYOUTS[size];

  for (
    let firstBoxRow = 0;
    firstBoxRow < size;
    firstBoxRow += layout.boxHeight
  ) {
    for (
      let firstBoxColumn = 0;
      firstBoxColumn < size;
      firstBoxColumn += layout.boxWidth
    ) {
      const values = new Set<SudokuNumber>();

      for (
        let row = firstBoxRow;
        row < firstBoxRow + layout.boxHeight;
        row += 1
      ) {
        for (
          let column = firstBoxColumn;
          column < firstBoxColumn + layout.boxWidth;
          column += 1
        ) {
          const value = board[row][column].value;

          if (value !== 0 && values.has(value)) {
            return true;
          }

          if (value !== 0) {
            values.add(value);
          }
        }
      }
    }
  }

  return false;
}

/**
 * Returns true when every cell contains a placed value.
 */
function isSolved(board: RefutationBoard): boolean {
  return board.every((row) => row.every((cell) => cell.value !== 0));
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
  const initialBoard = createRefutationBoard(puzzle);
  const nextRandom = createSeededRandom();
  let totalRefutationScore = 0;

  for (let run = 0; run < REFUTATION_RUN_COUNT; run += 1) {
    const board = cloneRefutationBoard(initialBoard);

    while (!isSolved(board)) {
      while (solveSingleStep(board, nextRandom)) {
        // Continue until obvious and hidden singles are exhausted.
      }

      let lowestRefutationScore = Number.POSITIVE_INFINITY;
      let lowestScoreRow = -1;
      let lowestScoreColumn = -1;

      for (let row = 0; row < board.length; row += 1) {
        for (let column = 0; column < board.length; column += 1) {
          const cell = board[row][column];

          if (cell.value !== 0) {
            continue;
          }

          if (lowestScoreRow !== -1 && nextRandom() < boost) {
            continue;
          }

          for (
            let candidateIndex = 0;
            candidateIndex < board.length;
            candidateIndex += 1
          ) {
            const candidate = candidateIndex + 1;

            if (
              candidate === solution[row][column] ||
              !cell.candidates[candidateIndex]
            ) {
              continue;
            }

            const refutationBoard = cloneRefutationBoard(board);
            refutationBoard[row][column].value = candidate;
            simplifyCandidates(refutationBoard, row, column);

            let candidateRefutationScore = 0;

            while (true) {
              candidateRefutationScore += 1;

              if (
                hasDuplicateValues(refutationBoard) ||
                !solveSingleStep(refutationBoard, nextRandom)
              ) {
                break;
              }
            }

            if (candidateRefutationScore < lowestRefutationScore) {
              lowestRefutationScore = candidateRefutationScore;
              lowestScoreRow = row;
              lowestScoreColumn = column;
            }
          }
        }
      }

      if (lowestScoreRow === -1) {
        break;
      }

      totalRefutationScore += lowestRefutationScore;
      board[lowestScoreRow][lowestScoreColumn].value =
        solution[lowestScoreRow][lowestScoreColumn];
    }
  }

  return Math.floor(totalRefutationScore / REFUTATION_RUN_COUNT);
}
