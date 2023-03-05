![Sudokuru Logo](https://sudokuru.s3.amazonaws.com/goldLogoText.png)
# Sudoku Puzzle Generator
[![NPM version](https://img.shields.io/npm/v/sudokuru.svg?style=flat)](https://npmjs.org/package/sudokuru)
[![NPM downloads](https://img.shields.io/npm/dm/sudokuru.svg?style=flat)](https://npmjs.org/package/sudokuru)
![NPM License](https://img.shields.io/npm/l/sudokuru)

> Generate data about Sudoku puzzles and upload it via POST requests

# Table of Contents

*   [Installation](#installation)
    *   [Command Line Interface Installation](#command-line-interface-installation)
*   [Usage](#usage)
    *   [Command Line](#command-line)
    *   [JavaScript](#javascript)
        *   [Import](#import)
        *   [Puzzles Class](#puzzles-class)
            *   [Setup](#setup)
            *   [Puzzles.startGame()](#puzzlesstartgame)
            *   [Puzzles.getGame()](#puzzlesgetgame)
            *   [Puzzles.getHint()](#puzzlesgethint)
*   [Puzzle Object Properties](#puzzle-object-properties)
    *   [puzzle](#puzzle)
    *   [puzzleSolution](#puzzlesolution)
    *   [strategies](#strategies)
    *   [difficulty](#difficulty)
    *   [drillStrategies](#drillstrategies)
*   [activeGame Object Properties](#activegame-object-properties)
    *   [userID](#userid)
    *   [puzzle](#puzzle-1)
    *   [currentTime](#currenttime)
    *   [moves array](#moves-array)
        *   [puzzleCurrentState](#puzzlecurrentstate)
        *   [puzzleCurrentNotesState](#puzzlecurrentnotesstate)
    *   [numHintsAskedFor](#numhintsaskedfor)
    *   [numWrongCellsPlayed](#numwrongcellsplayed)
    *   [numWrongCellsPlayedPerStrategy](#numwrongcellsplayedperstrategy)
*   [hint Object Properties](#hint-object-properties)
    *   [Example 1: Amend Notes](#example-1-amend-notes)
        *   [strategy](#strategy)
        *   [cause](#cause)
        *   [groups](#groups)
        *   [placements](#placements)
        *   [removals](#removals)
        *   [info](#info)
        *   [action](#action)
    *   [Example 2: Simplify Notes](#example-2-simplify-notes)
        *   [strategy](#strategy-1)
        *   [cause](#cause-1)
        *   [groups](#groups-1)
        *   [placements](#placements-1)
        *   [removals](#removals-1)
        *   [info](#info-1)
        *   [action](#action-1)
    *   [Example 3: Naked Single](#example-3-naked-single)
        *   [strategy](#strategy-2)
        *   [cause](#cause-2)
        *   [groups](#groups-2)
        *   [placements](#placements-2)
        *   [removals](#removals-2)
        *   [info](#info-2)
        *   [action](#action-2)
    *   [Example 4: Naked Pair](#example-4-naked-pair)
        *   [strategy](#strategy-3)
        *   [cause](#cause-3)
        *   [groups](#groups-3)
        *   [placements](#placements-3)
        *   [removals](#removals-3)
        *   [info](#info-3)
        *   [action](#action-3)
    *   [Example 5: Other Naked Sets](#example-5-other-naked-sets)
        *   [strategy](#strategy-5)
        *   [strategy](#strategy-6)
        *   [strategy](#strategy-7)
        *   [strategy](#strategy-8)
        *   [strategy](#strategy-9)
        *   [strategy](#strategy-10)
    *   [Example 6: Hidden Single](#example-6-hidden-single)
        *   [strategy](#strategy-11)
        *   [cause](#cause-4)
        *   [groups](#groups-4)
        *   [placements](#placements-4)
        *   [removals](#removals-4)
        *   [info](#info-4)
        *   [action](#action-4)
*   [Developer Tools](#developer-tools)

# Installation

```shell
npm install sudokuru
```

## Command Line Interface Installation

```shell
# Navigate to sudokuru package installation
cd node_modules/sudokuru/dist

# Install CLI dependencies
npm install
```

# Usage

## Command Line

```shell
# Navigate to sudokuru package installation
cd node_modules/sudokuru/dist

# Generate puzzles:
# filepath: Gets puzzles from inputPuzzles.txt (only integers, newline indicates new puzzle)
# start: Ignores puzzle strings until the 2nd puzzle (1 indexed) which it includes in output
# end: Ignores all puzzle strings after 4th puzzle (1 indexed) which it includes in output
# batchSize: Puts 2 puzzle JSON objects in each JSON array (1 per line) in puzzles.txt
# Note: If number of puzzles is not evenly divisible by batchSize last array will have fewer puzzles
npm run generate --filepath=inputPuzzles.txt --start=2 --end=4 --batchsize=2

# Upload puzzles:
# endpoint: For each line in puzzles.txt uploads JSON array as POST request to http://localhost:3000/api/v1/puzzles/
npm run upload --endpoint=http://localhost:3000/api/v1/puzzles/
```

## JavaScript

### Import
```shell
const sudokuru = require("./node_modules/sudokuru/dist/bundle.js");
```

### Puzzles Class

#### Setup
```shell
const Puzzles = sudokuru.Puzzles;
```

#### Puzzles.startGame()
1. Description: Returns puzzle only containing strategies specified, hasn't been solved by user, and has difficulty as close to the specified difficulty as possible.
2. Syntax
    ```shell
    Puzzles.startGame(url, difficulty, strategies, token).then(game => {
        console.log(game);
    }).catch(err => {
        console.log(err);
    });
    ```
3. Parameters
    - url: Server url e.g. "http://localhost:3001/"
    - difficulty: number between 0 and 1 where 0 is lowest difficulty and 1 is highest
    - strategies: array of strategies that are allowed to be in returned puzzle e.g. [ "NAKED_SINGLE" ]
    - token: string authentication token
4. Return Value: [activeGame](#activegame-object-properties) JSON object

#### Puzzles.getGame()
1. Description: Retrieves users active game if they have one, otherwise returns null
2. Syntax
    ```shell
    Puzzles.getGame(url, token).then(game => {
        if (game !== null) {
            console.log(game);
        }
        else {
            console.log("User doesn't have an activeGame");
        }
    });
    ```
3. Parameters:
    - url: Server url e.g. "http://localhost:3001/"
    - token: string authentication token
4. Return Value: [activeGame](#activegame-object-properties) JSON object if user has an active game, otherwise null

#### Puzzles.getHint()
1. Description: Returns a hint based on the puzzle and notes provided
2. Syntax
    ```shell
    Puzzles.getHint(board, notes, strategies, solution);
    ```
3. Parameters:
    - board: 2d board array (9 arrays, one for each row, each with 9 strings representing values or "0" if empty)
    - notes: 2d notes array (81 arrays, one for each cell containing each note that is left in it)
    - strategies: optional parameter specifying which strategies are allowed to be used in the hint
    - solution: optional parameter specifying boards solution so that amend notes hints can correct users mistakes
4. Return Value: [hint](#hint-object-properties)

# Puzzle Object Properties

## puzzle
```json
310084002200150006570003010423708095760030000009562030050006070007000900000001500
```
Initial puzzle state, 81 numeric characters, zeroes represent empty cells
## puzzleSolution
```json
316984752298157346574623819423718695765439128189562437851396274637245981942871563
```
Final puzzle state, 81 numeric characters
## strategies
```json
[ "NAKED_SINGLE", "HIDDEN_SINGLE", "NAKED_PAIR", "NAKED_TRIPLET" ]
```
Array of strings representing strategies the solver used to figure out puzzle solution
## difficulty
```json
44
```
Integer representing difficulty of puzzle based on instances of strategies used and overall length of game
## drillStrategies
```json
[ "HIDDEN_SINGLE", "NAKED_SEXTUPLET" ]
```
Array of strings representing strategies that can be used on the puzzle in its intial state

# activeGame Object Properties
Stores data for game that user is playing or has paused.
## userID
```json
"P7JS989SM4DS058"
```
Unique string representing the user (who this game belongs to)
## puzzle
```json
"003070040006002301089000000000107080517000006000400000271009005095000000000020000"
```
Initial puzzle state, 81 numeric characters, zeroes represent empty cells
## currentTime
```json
774
```
Number of seconds that has elapsed during gameplay
## moves array
Contains state of the puzzle and user notes at each step in order first to latest (enables undo button)
### puzzleCurrentState
```json
"003070040006002301089000000000107080517000006000400000271009005095000000000020000"
```
Current puzzle state, 81 numeric characters, zeroes represent empty cells
### puzzleCurrentNotesState
```json
"111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111"
```
729 characters, 9 per cell representing numbers 1-9 in order, cells going left to right and top to bottom, ones represent note being in cell and zeros represent note not in cell
## numHintsAskedFor
```json
3
```
Number of hints the user has requested during the game
## numWrongCellsPlayed
```json
108
```
Number of times the user has entered the wrong number into a cell
## numWrongCellsPlayedPerStrategy
```json
"NAKED_SINGLE": 4,
"HIDDEN_SINGLE": 8,
"NAKED_PAIR": 15,
"NAKED_TRIPLET": 16,
"NAKED_QUADRUPLET": 23,
"NAKED_QUINTUPLET": 42,
"NAKED_SEXTUPLET": 0,
"NAKED_SEPTUPLET": 0,
"NAKED_OCTUPLET": 0,
"HIDDEN_PAIR": 0,
"HIDDEN_TRIPLET": 0,
"HIDDEN_QUADRUPLET": 0,
"HIDDEN_QUINTUPLET": 0,
"HIDDEN_SEXTUPLET": 0,
"HIDDEN_SEPTUPLET": 0,
"HIDDEN_OCTUPLET": 0,
"POINTING_PAIR": 0,
"POINTING_TRIPLET": 0,
"BOX_LINE_REDUCTION": 0,
"X_WING": 0,
"SWORDFISH": 0,
"SINGLES_CHAINING": 0
```
Number of times user has entered the wrong number when given strategies were the next available hints (approximates how much practice user needs per strategy)

# hint Object Properties
## Example 1: Amend Notes
![Example 1](https://sudokuru.s3.amazonaws.com/hintExample1-V2.png)
### strategy
```json
"AMEND_NOTES"
```
Name of strategy used by the hint. Amend notes works removing all notes from a cell then adding back in just the ones that don't conflict with placed values in the same row, column, and box as the cell. In the picture the cell with the red border was previously empty and amend notes was able to add in the 2 and 8 only as the others conflicted with the highlighted cells.
### cause
```json
[[7,4],[7,5],[7,6],[7,8],[4,2],[8,0],[8,1]]
```
Coordinates of cells that "cause" strategy to be applicable. This is a 2d array so cause[0] is [7, 4] referring to the cell with the 9 highlighted in blue in the next to last row (rows and columns are zero-indexed). cause[0][0] refers to it being in the 8th row and cause[0][1] refers to it being in the 5th column. Similarly the last cell cause[6] is the highlighted 3 that it shares a box with.
### groups
```json
[[0,7],[1,2],[2,6]]
```
Group type and index of groups that "cause strategy". This is a 2d array so group[0] is [0, 7] referring to the next to next to last row with green borders. group[0][0] refers to the group type (0 = row, 1 = column, 2 = box) and group[0][1] refers to it being the 8th row. Similarly the last group group[2] is the bottom left box whose cells also have green borders.
### placements
```json
[]
```
Row, column, and values for cells that have had values placed in them as result of strategy. This does not apply to this strategy.
### removals
```json
[[7,2,1,3,4,5,6,7,9]]
```
Notes that can be removed from cells along with their row and columns. The first two values represent the row and column respectively so removals[0][0] and removals[0][1] refer to the 3rd cell in the 8th row. The rest of the numbers in the subarray are the notes to be removed which is every number but 2 and 8. Amend notes is unique in that every note that shouldn't be removed should be added back in (2 and 8 in this example). In this example the cell had no notes in it before amend notes.
### info
```json
"Amend notes are when you reset a cell's notes to contain every nonconflicting number"
```
Info about the strategy being used by the hint.
### action
```json
"When you see an amend notes you can remove all notes then add all nonconflicting numbers to its notes"
```
Describes the action that the hint is suggesting.
## Example 2: Simplify Notes
![Example 2](https://sudokuru.s3.amazonaws.com/hintExample2-V2.png)
### strategy
```json
"SIMPLIFY_NOTES"
```
Name of strategy used by the hint. Simplify notes works by using a cell with a placed value (the blue highlighted 8) to remove a note of the same value from a cell sharing a group (the red 8 note in a cell in the same column).
### cause
```json
[[7,0]]
```
Coordinates of cells that "cause" strategy to be applicable. This is a 2d array so cause[0] is [7, 0] referring to the cell with the 8 highlighted in blue in the next to last row (rows and columns are zero-indexed). cause[0][0] refers to it being in the 8th row and cause[0][1] refers to it being in the 1st column.
### groups
```json
[[1,0]]
```
Group type and index of groups that "cause strategy". This is a 2d array so group[0] is [1, 0] referring to the first column with green borders. group[0][0] refers to the group type (0 = row, 1 = column, 2 = box) and group[0][1] refers to it being the 1st column.
### placements
```json
[]
```
Row, column, and values for cells that have had values placed in them as result of strategy. This does not apply to this strategy.
### removals
```json
[[1,0,8]]
```
Notes that can be removed from cells along with their row and columns. The first two values represent the row and column respectively so removals[0][0] and removals[0][1] refer to the 1st cell in the 2nd row. The rest of the numbers in the subarray are the notes to be removed which is just 8.
### info
```json
"You can simplify notes using values already placed in cells at the start of the game"
```
Info about the strategy being used by the hint.
### action
```json
"When there is a value already placed in a cell than it can be removed from all other cells notes in its row, column, and box"
```
Describes the action that the hint is suggesting.
## Example 3: Naked Single
![Example 3](https://sudokuru.s3.amazonaws.com/hintExample3-V1.png)
### strategy
```json
"NAKED_SINGLE"
```
Name of strategy used by the hint. Naked single works by placing a value in a cell where it is the only remaining possibility. In the example the green highlighted 2 is the last remaining possibility in the blue highlighted cell.
### cause
```json
[[7,2]]
```
Coordinates of cells that "cause" strategy to be applicable. This is a 2d array so cause[0] is [7, 2] referring to the 3rd cell in the next to last row (rows and columns are zero-indexed). cause[0][0] refers to it being in the 8th row and cause[0][1] refers to it being in the 3rd column.
### groups
```json
[]
```
Group type and index of groups that "cause strategy". This does not apply to this strategy.
### placements
```json
[[7,2,2]]
```
Row, column, and values for cells that have had values placed in them as result of strategy. This is a 2d array so placements[0] refers to the first value that needs to be placed. The first value in the subarray refers to the cells row, the next value is the column, and the final value is the value to be placed ("2" in this case).
### removals
```json
[]
```
Notes that can be removed from cells along with their row and columns. This does not apply to this strategy.
### info
```json
"Naked singles are when you only have one number left as a possibility in a cell"
```
Info about the strategy being used by the hint.
### action
```json
"When you see a naked single you can fill it in with its last remaining possibility"
```
Describes the action that the hint is suggesting.
## Example 4: Naked Pair
![Example 4](https://sudokuru.s3.amazonaws.com/hintExample4-V1.png)
### strategy
```json
"NAKED_PAIR"
```
Name of strategy used by the hint. Naked pair works using two cells that share a group and only have the same two notes left as possibilities to eliminate those notes from other cells in the group. In the example 7 and 8 are the last remaining possibilities in the blue highlighted cells which are used to remove all the other 7 and 8s in the column shown highlighted in red.
### cause
```json
[[1,8],[6,8]]
```
Coordinates of cells that "cause" strategy to be applicable. This is a 2d array so cause[0] is [1, 8] referring to the 9th cell in the second row (rows and columns are zero-indexed). cause[0][0] refers to it being in the 2nd row and cause[0][1] refers to it being in the 9th column.
### groups
```json
[[1,8]]
```
Group type and index of groups that "cause strategy". This is a 2d array so group[0] is [1, 8] referring to the last column with green borders. group[0][0] refers to the group type (0 = row, 1 = column, 2 = box) and group[0][1] refers to it being the 9th column.
### placements
```json
[]
```
Row, column, and values for cells that have had values placed in them as result of strategy. This does not apply to this strategy.
### removals
```json
[[3,8,7,8],[4,8,7,8]]
```
Notes that can be removed from cells along with their row and columns. The first two values in each subarray represent the row and column respectively so removals[0][0] and removals[0][1] refer to the 9th cell in the 4th row. The rest of the numbers in the subarray are the notes to be removed which is 7 and 8 (although only 8 is there to begin with and is highlighted in red).
### info
```json
"Naked pairs are when you only have the same two numbers left as a possibility in two cells in the same row, column, or box"
```
Info about the strategy being used by the hint.
### action
```json
"When you see a naked pair you can remove them from the notes of every other cell in the row, column, or box that they share"
```
Describes the action that the hint is suggesting.
## Example 5: Other Naked Sets
### strategy
```json
"NAKED_TRIPLET"
```
### strategy
```json
"NAKED_QUADRUPLET"
```
### strategy
```json
"NAKED_QUINTUPLET"
```
### strategy
```json
"NAKED_SEXTUPLET"
```
### strategy
```json
"NAKED_SEPTUPLET"
```
### strategy
```json
"NAKED_OCTUPLET"
```
Name of strategy used by the hint. Naked triplets through octuplets are scaled up versions of naked pairs except instead of using two cells and notes they share 3-8. Note: while cells in say a naked quadruplet must share the same 4 notes the 4 cells don't have to individually have all 4 notes they just can't have any other notes.
## Example 6: Hidden Single
![Example 6](https://sudokuru.s3.amazonaws.com/hintExample5-V1.png)
### strategy
```json
"HIDDEN_SINGLE"
```
Name of strategy used by the hint. Hidden single works by having only one cell in a group that still has a number as a possibility in which case all other notes can be removed from it. This is shown by the 8 naked single which in the only 8 note in the box with the green border. Therefore, the other notes highlighted in red can be removed.
### cause
```json
[[3,8],[4,8],[5,6],[5,8]]
```
Coordinates of cells that "cause" strategy to be applicable. This is a 2d array so cause[0] is [3, 8] referring to the 9th cell in the 4th row (rows and columns are zero-indexed). cause[0][0] refers to it being in the 4th row and cause[0][1] refers to it being in the 9th column.
### groups
```json
[[2,5]]
```
Group type and index of groups that "cause strategy". This is a 2d array so group[0] is [2, 5] referring to the 6th box with green borders (boxes are zero-indexed starting with the top left and going left to right top to bottom). group[0][0] refers to the group type (0 = row, 1 = column, 2 = box) and group[0][1] refers to it being the 6th box.
### placements
```json
[]
```
Row, column, and values for cells that have had values placed in them as result of strategy. This does not apply to this strategy.
### removals
```json
[[3,6,1,2,3,9]]
```
Notes that can be removed from cells along with their row and columns. The first two values in each subarray represent the row and column respectively so removals[0][0] and removals[0][1] refer to the 7th cell in the 4th row. The rest of the numbers in the subarray are the notes to be removed which is 1, 2, 3, and 9 (although only 1 and 3 are present and are highlighted in red).
### info
```json
"Hidden singles are when you only have one cell left still containing a specific value in a row, column, or box"
```
Info about the strategy being used by the hint.
### action
```json
"When you see a hidden single you can fill it in with its unique possibility"
```
Describes the action that the hint is suggesting.
# Developer Tools
```shell
# Clone Repository
git clone https://github.com/SudoKuru/SudokuPuzzleGenerator.git

# Install Developer Dependencies
npm install

# Run Tests
npm test

# Build dist Folder
npm run build

# Create Local TypeDoc Documentation
npm run update-docs

# The following can also be done after installing the npm package by navigating to node_modules/sudokuru

# Run Demo Server on http://localhost:3001/
npm run start

# Can open interactive Solver Demo in browser while Demo Server is running (Generator/Demo/demo.html)

# Demo Server provides the following fakes for Puzzle Class (use http://localhost:3001/ as url)
# Puzzles.startGame(): Will overwrite text file with activeGame constant and return it to user
# Puzzles.getGame(): Will return the activeGame from text file or return 404 error if the text file doesn't exist
```
Official TypeDoc Documentation is Hosted Here: https://sudokuru.github.io/SudokuPuzzleGenerator/

