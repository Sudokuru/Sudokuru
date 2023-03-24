# Strategy Prerequisite Chart
If you place certain values you can reduce one strategy to another. This chart documents those relations.<br>
For instance, if you place values in the same row, column, and/or box as a hidden single such that it's left with only one possibility you have reduced it to a naked single.<br>
Relations are transitive meaning naked octuplet can become septuplet then sextuplet.<br>
They can also skip steps in some cases.

```mermaid
%%{init: {'theme': 'neutral', 'themeVariables': { 'fontSize': '32px', 'fontFamily': 'arial'}}}%%
classDiagram
    HiddenSingle --<| NakedSingle
    HiddenPair --<| NakedPair
    HiddenTriplet --<| NakedTriplet
    HiddenQuadruplet --<| NakedQuadruplet
    HiddenQuintuplet --<| NakedQuintuplet
    HiddenSextuplet --<| NakedSextuplet
    HiddenSeptuplet --<| NakedSeptuplet
    HiddenOctuplet --<| NakedOctuplet
    NakedPair --<| NakedSingle
    NakedTriplet --<| NakedPair
    NakedQuadruplet --<| NakedTriplet
    NakedQuintuplet --<| NakedQuadruplet
    NakedSextuplet --<| NakedQuintuplet
    NakedSeptuplet --<| NakedSextuplet
    NakedOctuplet --<| NakedSeptuplet
```