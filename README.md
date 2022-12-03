Setup Instructions:
Change version of typescript in package.json to 4.8.4
Run npm i
Reset package.json (run git checkout -- package.json)
Run npm i
Should be able to run npm test successfully now

test using npm test
update docs with npm run update-docs

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
        number strategy
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