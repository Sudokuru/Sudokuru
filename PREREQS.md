# Strategy Prerequisite Chart
If you place certain values you can reduce one strategy to another. This chart documents those relations.<br>
For instance, if you place values in the same row, column, and/or box as a hidden single such that it's left with only one possibility you have reduced it to a obvious single.<br>
Relations are transitive meaning obvious octuplet can become septuplet then sextuplet.<br>
They can also skip steps in some cases.

```mermaid
%%{init: {'theme': 'neutral', 'themeVariables': { 'fontSize': '32px', 'fontFamily': 'arial'}}}%%
classDiagram
    HiddenSingle --<| ObviousSingle
    HiddenPair --<| ObviousPair
    HiddenTriplet --<| ObviousTriplet
    HiddenQuadruplet --<| ObviousQuadruplet
    HiddenQuintuplet --<| ObviousQuintuplet
    HiddenSextuplet --<| ObviousSextuplet
    HiddenSeptuplet --<| ObviousSeptuplet
    HiddenOctuplet --<| ObviousOctuplet
    ObviousPair --<| ObviousSingle
    ObviousTriplet --<| ObviousPair
    ObviousQuadruplet --<| ObviousTriplet
    ObviousQuintuplet --<| ObviousQuadruplet
    ObviousSextuplet --<| ObviousQuintuplet
    ObviousSeptuplet --<| ObviousSextuplet
    ObviousOctuplet --<| ObviousSeptuplet
    PointingPair --<| HiddenSingle
    PointingTriplet --<| PointingPair
```