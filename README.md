# Setup Instructions:
Run npm i<br>
test using npm test<br>
update docs with npm run update-docs

Run demo using npm start and then opening demo.html

Generate file containing array of puzzle JSON objects using npm run generate FILEPATH
e.g. FILEPATH = file.txt if file.txt is in the same directory as this file and contains puzzle strings.
Can also use optional start parameter e.g. npm run generate file.txt 2 will start at the 2nd puzzle (skips the 1st puzzle)
Can use optional start and end parameters e.g. npm rum generate file.txt 2 4 will run on 2nd, 3rd, and 4th puzzles.
Start and end are both 1 indexed and inclusive e.g. 2 2 will run on just the 2nd puzzle.
Finally optional batch size which determines how many puzzles put in each array (one array per line).
e.g. npm run generate file.txt 2 4 2 which place 2nd and 3rd puzzles in array on line 1 and 4th puzzle on array in second line.

Upload generated json puzzle arrays file using npm run upload ENDPOINT
e.g. ENDPOINT = http://localhost:3000/api/v1/puzzles/ i.e. any POST endpoint URL thats expecting JSON body that looks like the following example:
[
  {
    puzzle: '310084002200150006570003010423708095760030000009562030050006070007000900000001500',
    puzzleSolution: '316984752298157346574623819423718695765439128189562437851396274637245981942871563',
    strategies: [ 'NAKED_SINGLE', 'HIDDEN_SINGLE', 'NAKED_PAIR', 'NAKED_TRIPLET' ],
    difficulty: 44,
    drillStrategies: [ 'HIDDEN_SINGLE', 'NAKED_SEXTUPLET' ]
  },
  {
    puzzle: '603002001500000020901730006810400090060000000000690040350000004002070005000500108',
    puzzleSolution: '683942751574816329921735486817453692469287513235691847358169274142378965796524138',
    strategies: [
      'NAKED_SINGLE',
      'HIDDEN_SINGLE',
      'NAKED_PAIR',
      'NAKED_TRIPLET',
      'NAKED_QUADRUPLET'
    ],
    difficulty: 60,
    drillStrategies: [ 'HIDDEN_SINGLE', 'NAKED_SEPTUPLET' ]
  }
]
Will do one POST request per array in puzzles.txt

## Documentation
Documentation is auto-generated using Typedoc and hosted on GitHub pages here:<br>
https://sudokuru.github.io/SudokuPuzzleGenerator/

```mermaid
%%{init: {'theme': 'neutral', 'themeVariables': { 'fontSize': '32px', 'fontFamily': 'arial'}}}%%
erDiagram
    BOARD ||..|| SOLVER : uses
    SOLVER }|..|{ CELL : contains
    SOLVER }|..|{ STRATEGY : uses
    STRATEGY }|..|{ CELL : contains
    BOARD {
        string_2D_array board
        string_2D_array solution
        string solutionString
        StrategyEnum mostDifficultStrategy
    }
    SOLVER {
        Cell_2D_array board
        boolean solved
    }
    CELL {
        number row
        number column
        number box
        string value
        map_string notes
    }
    STRATEGY {
        Cell_2D_array board
        Cell_array values
        boolean identified
    }
```