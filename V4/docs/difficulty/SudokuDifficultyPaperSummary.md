# Summary of *Difficulty Rating of Sudoku Puzzles by a Computational Model*

Radek Pelánek, Masaryk University Brno, 2011. [Read the paper](https://www.fi.muni.cz/~xpelanek/publications/flairs-sudoku.pdf).

## Abstract

The paper evaluates ways to estimate Sudoku difficulty by comparing computed ratings with human solve times gathered from online games. Pelánek argues that difficulty depends both on how demanding each deduction is and on how much one deduction must unlock another. The paper also considers whether this general model could help rate other constraint satisfaction problems.

## Overview of the Problem

Reliable difficulty ratings have practical value because they help Sudoku publishers give players puzzles at an appropriate level. Existing raters were generally based on developer judgment and tuned for particular applications, with little validation against actual player performance. The study aims to provide empirical support for difficulty modeling that may extend beyond Sudoku.

## Sudoku and Constraint Satisfaction Problems

Sudoku provides a useful case study because its popularity supplies a large amount of human solving data, while its rules fit the broader category of constraint satisfaction problems (CSPs). Other CSPs include practical problems such as scheduling.

A CSP consists of variables, a domain of possible values for each variable, and constraints governing which combinations are valid. In Sudoku, cells are the variables and the digits 1 through 9 are their domains. A valid solution assigns one digit to every cell without repeating a digit in any row, column, or box.

## Constraint Propagation

Backtracking lets computers solve Sudoku efficiently, but its search behavior does not closely resemble ordinary human play. Constraint propagation instead narrows candidates and makes deductions from the puzzle rules. Because human solvers commonly reason this way, it provides a more useful basis for modeling their performance.

## Basic Sudoku Techniques

The model treats naked singles and hidden singles as its basic deductions. A naked single occurs when a cell has only one legal candidate. A hidden single occurs when a digit has only one legal location within a row, column, or box.

The paper calls puzzles solvable using only these two techniques "simple Sudokus" and observes that puzzle sites commonly place them in their easier categories.

## Human Sudoku Solving Data

The study uses average completion time as its measure of human difficulty. Its data comes from online Sudoku sites and represents thousands of hours of play across roughly 2,000 puzzles.

## Computational Model of a Human Solver

Pelánek presents a general CSP-solving model and evaluates a Sudoku-specific version against the human data. Difficulty rating is its main purpose, though the paper suggests applications such as tutoring and detecting computer-assisted competition entries.

The model assumes that people favor deductions over systematic trial and error and prefer easier deductions when several techniques are available. A simulated solve therefore repeats this process:

1. Find the least difficult technique that can advance the current puzzle.
2. If that technique supports multiple moves, choose one at random.
3. Update the puzzle with the chosen move and repeat.

The simulation assumes a solver who never makes an error and can always continue through deduction without backtracking.

## Rating Logic Techniques

Conventional Sudoku programs assign costs to a catalog of solving techniques. Those costs commonly reflect the developer's experience, introduce many tuning choices, and tie the resulting model closely to Sudoku.

Pelánek instead interprets harder techniques as mental trial-and-error shortcuts. The model needs only a small set of elementary deductions specific to Sudoku; search supplies a cost for progress beyond them. This makes the overall idea more portable to other CSPs whose elementary deductions differ.

When elementary deductions cannot advance the board, the model tentatively assigns each candidate to an empty cell and measures how much elementary reasoning is required to expose a contradiction for every incorrect candidate. Adding those costs produces that cell's refutation score. A candidate that cannot be disproved this way gives the cell an infinite score. Although exhaustive breadth-first search could find minimum refutation paths, the implementation samples randomized deduction sequences as a cheaper and more human-like approximation. The model proceeds through the cell with the smallest finite score.

The refutation-sum difficulty metric averages the total refutation cost across 30 randomized simulations of the puzzle.

## Dependency Metric

Technique cost alone cannot explain why humans solve some simple Sudokus much faster than others. The paper attributes part of that difference to the shape of the solve path. A puzzle with many immediately visible deductions gives the player several ways forward, while a puzzle with only one available deduction creates a bottleneck.

The simulation records how many elementary moves are available after each update. Repeating the solve with random move selection provides an average branching profile for each stage. The dependency metric reduces that profile to the average availability during the first *k* moves. Later stages are less informative because partially completed puzzles tend to offer many easy moves. The experiments indicate that values of *k* from 20 through 30 behave similarly.

## Evaluation

The number of givens has a Pearson correlation of 0.25 on the `fed-sudoku.eu` dataset and 0.27 on the `sudoku.org.uk` dataset. Combining refutation sum with dependency raises those correlations to 0.74 and 0.88, respectively. The paper reports that a larger model combining Sudoku-specific metrics with refutation and dependency reaches correlations of 0.84 and 0.95.

## Citation

Pelánek, Radek. “Difficulty Rating of Sudoku Puzzles by a Computational Model.” *Proceedings of the Twenty-Fourth International Florida Artificial Intelligence Research Society Conference*, AAAI Press, 2011, pp. 434–439. [AAAI publication page](https://aaai.org/papers/flairs-2011-2517/).
