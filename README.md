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

# Run Demo Server on http://localhost:3001/
npm run start

# Can open interactive Solver Demo in browser while Demo Server is running (Generator/Demo/demo.html)

# Demo Server provides the following fakes for Puzzle Class (use http://localhost:3001/ as url)
# Puzzles.startGame(): Will overwrite text file with activeGame constant and return it to user
```
Official TypeDoc Documentation is Hosted Here: https://sudokuru.github.io/SudokuPuzzleGenerator/

