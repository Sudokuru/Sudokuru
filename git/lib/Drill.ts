
/**
 * Given a puzzle string and move number, returns the puzzle state after that many moves
 * @param puzzleString - 81 character string representing the initial puzzle state
 * @param moveNumber - number of moves to execute (0-80, where 0 returns the original puzzle)
 * @returns puzzle string after specified number of moves
 */
export function getDrillPuzzleString(puzzleString: string, moveNumber: number): string {
  // Create solver with the initial puzzle
  const solver: Solver = new Solver(getBoardArray(puzzleString));
  

/**
 * Given a puzzle string and move number, returns the puzzle state after that many moves
 * @param puzzleString - 81 character string representing the initial puzzle state
 * @param moveNumber - number of moves to execute (0-80, where 0 returns the original puzzle)
 * @returns puzzle string after specified number of moves
 */
export function getDrillPuzzleString(puzzleString: string, moveNumber: number): string {
    // Create solver with the initial puzzle
    let solver: Solver = new Solver(getBoardArray(puzzleString));
    
    // Get initial placed count (givens)
    let initialPlacedCount: number = solver.getPlacedCount();
    let targetPlacedCount: number = initialPlacedCount + moveNumber;
    
    // Validate moveNumber
    if (moveNumber < 0 || targetPlacedCount > 81) {
        throw new Error("Invalid move number: " + moveNumber);
    }
    
    // Return original puzzle if no moves
    if (moveNumber === 0) {
        return puzzleString;
    }
    
    // Execute steps until desired placement count
    while (solver.getPlacedCount() < targetPlacedCount) {
        let hint = solver.nextStep();
        if (hint === null) {
            break;
        }
    }
    
    // Serialize current board state to string
    let result: string = "";
    let board: string[][] = solver.getBoard();
    for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[row].length; col++) {
            result += board[row][col];
        }
    }
    
    return result;
}

  const initialPlacedCount: number = solver.getPlacedCount();
  const targetPlacedCount: number = initialPlacedCount + moveNumber;
  
  // Validate moveNumber
  if (moveNumber < 0 || targetPlacedCount > 81) {
    throw new Error("Invalid move number: " + moveNumber);
  }
  
  // If no moves requested, return original puzzle
  if (moveNumber === 0) {
    return puzzleString;
  }
  
  // Step through solver until target placed count is reached
  while (solver.getPlacedCount() < targetPlacedCount) {
    const hint = solver.nextStep();
    if (hint === null) {
      break;
    }
  }
  
  // Serialize current board state back to an 81-character string
  let result = "";
  const board = solver.getBoard();
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      result += board[row][col];
    }
  }
  
  return result;
}
