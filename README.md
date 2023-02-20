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
*   [Puzzle Object Properties](#puzzle-object-properties)
    *   [puzzle](#puzzle)
    *   [puzzleSolution](#puzzlesolution)
    *   [strategies](#strategies)
    *   [difficulty](#difficulty)
    *   [drillStrategies](#drillstrategies)
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

# Run Solver Demo (then open demo.html in browser)
npm run start
```
Official TypeDoc Documentation is Hosted Here: https://sudokuru.github.io/SudokuPuzzleGenerator/

