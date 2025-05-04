### Drill File

1. Setup:
    ```typescript
    import { getDrillPuzzleString } from 'sudokuru';
    ```
2. Description: Returns the puzzle state after running the solver for a specified number of moves
3. Syntax:
    ```typescript
    getDrillPuzzleString(puzzleString, moveNumber);
    ```
4. Parameters:
    - puzzleString: puzzle board string (81 characters, one for each cell containing each value or "0" if empty; left-to-right, top-to-bottom)
    - moveNumber: number of moves to execute (0-80, where 0 returns the original puzzle)
5. Return Value: puzzle string after the specified number of moves (81 characters)


      ### Drill File
      1. Setup:
         ```typescript
         import {getDrillPuzzleString} from 'sudokuru';
         ```
      2. Description: Returns the puzzle state after running the solver for a specified number of moves
      3. Syntax:
         ```typescript
         getDrillPuzzleString(puzzleString, moveNumber);
         ```
      4. Parameters:
         - puzzleString: puzzle board string (81 characters, one for each cell containing each value or "0" if empty, left to right top to bottom)
         - moveNumber: number of moves to execute (0-80, where 0 returns the original puzzle)
      5. Return Value: puzzle string after the specified number of moves (81 characters)
      ```