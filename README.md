
### Drill File
1. Setup: 
    ```typescript
    import {getDrillPuzzleString} from 'sudokuru';
    ```
2. Description: Returns the puzzle state after running the solver for a specified number of moves
3. Syntax
    ```typescript
    getDrillPuzzleString(puzzleString, moveNumber);
    ```
4. Parameters:
    - puzzleString: puzzle board string (81 characters, one for each cell containing a value or "0" if empty; left-to-right, top-to-bottom)
    - moveNumber: number of moves to execute (0–80, where 0 returns the original puzzle)
5. Return Value: puzzle string after the specified number of moves (81 characters)

```json
"When you see a hidden pair you can remove all notes other than the pair from the cells"
```
Describes the action that the hint is suggesting.
## Example 8: Other Hidden Sets
### strategy
```json
"HIDDEN_TRIPLET"
```
### strategy
```json
"HIDDEN_QUADRUPLET"
```
Name of strategy used by the hint. Hidden triplets through octuplets are scaled up versions of hidden pairs except instead of using two cells and notes they share 3-8. Note: while cells in say a hidden quadruplet must share the same 4 notes the 4 cells don't have to individually have all 4 notes they just have to be the only cells in the group that have those notes.
## Example 9: Pointing Pair
![Example 8](https://sudokuru.s3.amazonaws.com/hintExample7-V1.png)
### strategy
```json
"POINTING_PAIR"
```
Name of strategy used by the hint. Pointing pair works by having only two cells in a box that still have a specific numbers as a possibility and also share a row or column in which case all other notes can be removed from any other cells in the shared row or column except for the pointing pair themself. This is shown by the pointing pair in the top right in which they have the only 6's in the box are in the two cells highlighted in blue on the same row. Therefore, the other notes highlighted in red can be removed.
### cause
```json
[[0,6],[0,8]]
```
Coordinates of cells that "cause" strategy to be applicable.
### groups
```json
[[0,0],[2,2]]
```
Group type and index of groups that "cause strategy".
### placements
```json
[]
```
Row, column, and values for cells that have had values placed in them as result of strategy. This does not apply to this strategy.
### removals
```json
[[0,1,6],[0,2,6]]
```
Notes that can be removed from cells along with their row and columns. The first two values in each subarray represent the row and column respectively.
### info
```json
"Pointing pairs are when you only have two cells in a row or column left still containing a specific value and the cells also share a box"
```
Info about the strategy being used by the hint.
### action
```json
"When you see a pointing pair you can remove all other instances of the shared note from the box (except for those in the pair themself)"
```
Describes the action that the hint is suggesting.
# PuzzleData Object Properties
## solution
81 character string representing the solution to the puzzle (left to right top to bottom)
## difficulty
Number representing the difficulty of the puzzle (higher is harder)
## givensCount
Number representing the number of givens i.e. pre-filled cells in the puzzle
## puzzleStrategies
Boolean array representing which strategies were used to solve the puzzle in following order (subset of StrategyEnum):
- 0: OBVIOUS_SINGLE,
- 1: HIDDEN_SINGLE,
- 2: OBVIOUS_PAIR,
- 3: HIDDEN_PAIR,
- 4: POINTING_PAIR,
- 5: OBVIOUS_TRIPLET,
- 6: HIDDEN_TRIPLET,
- 7: POINTING_TRIPLET,
- 8: OBVIOUS_QUADRUPLET,
- 9: HIDDEN_QUADRUPLET,
## drills
- 1D number array representing last time strategy can be reasonably used as drill or -1 if it can't be used as a drill
- Each index is defined as the puzzle when it has a certain number of cells filled in (so index 30 has 30 cells filled in including givens).
- Reasonably is defined as to mean removing strategies if they overlap with their prereqs (i.e. if a obvious pair is made up of two obvious singles the pair will be excluded) and not counting a strategy if multiple instances of it are present so their is only one correct answer.
- The same number index to strategy mapping as puzzleStrategies is used.

# Developer Tools

Clone Repository
```shell
git clone https://github.com/SudoKuru/Sudokuru.git
```

```shell
bun install # or npm install
```

[Install pre-commit hooks](https://pre-commit.com/#install)

Run the below command to setup pre-commit hooks:

```shell
pre-commit install
```

Pre-commit hooks can be run manually with below command, but
will always run before git commit and git push if setup correctly.

```shell
npm run pre-commit
```

```bun......................................................................Passed```

Should appear in the git output logs after a commit.


```shell
# Install Developer Dependencies
bun install
```

Run Tests

Coverage reports are automatically generated can can be viewed in `jest-coverage` folder
```shell
npm run test
```
Run Tests without coverage (faster)
```shell
bun test
```

Build dist Folder
```shell
bun build
```

Create Local TypeDoc Documentation
```shell
bun update-docs
```

The following can also be done after installing the npm package by navigating to node_modules/sudokuru

Run Demo Server on http://localhost:3100/
```shell
bun start
```
```shell
# Can open interactive Solver Demo in browser while Demo Server is running (Generator/Demo/demo.html)

# Demo Server provides the following fakes for Puzzle Class (use http://localhost:3100/ as url)
# Puzzles.startGame(): Will overwrite text file with activeGame constant and return it to user
# Puzzles.getGame(): Will return the activeGame from text file or return 404 error if the text file doesn't exist
# Puzzles.saveGame(): Attempts to save changes to activeGame stored locally in a text file and returns true if successful
# Puzzles.finishGame(): Attempts to delete activeGame stored locally in a text file and returns true if successful
# Drills.getGame(): Will return a puzzle string constant

# Can modify a lessons by doing the following:
1. Log into AWS Console using team IAM user
2. Navigate to S3
3. Navigate to sudokuru bucket
4. Navigate to Lessons folder
5. Download the lessons json file e.g. AMEND_NOTES.json
6. Make changes locally to the json file
7. Upload the json file (it will overwrite the old version)

# Can add a lesson by doing the following:
1. Navigate to S3 sudokuru bucket Lessons folder same as in modifying lesson instructions above
2. Upload the new lesson json file using the same format as the existing ones
3. Download strategies.json
4. Add the new strategies name (same as uploaded file name) to strategies.json locally
5. Upload the json file (it will overwrite the old version)
```
Official TypeDoc Documentation is Hosted Here: https://sudokuru.github.io/SudokuPuzzleGenerator/

