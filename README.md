Setup Instructions:
Run npm i

test using npm test
update docs with npm run update-docs

Run demo using npm start and then opening demo.html

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