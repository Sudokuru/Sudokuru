import { Cell } from "../../Cell";
import { Refutation } from "../../Refutation";
import { resetSeed } from "../../Random";
import { getCellBoard, simplifyNotes } from "../../Sudoku";
import type { SudokuValue } from "../../../V4/Types";
import { ALL_ADDITIONAL_BOARDS_WITH_REFUTATION_SCORES } from "../../../V4/tests/utils/additionalBoards";

function createRefutationBoard(grid: SudokuValue[][]): Cell[][] {
    const board: Cell[][] = getCellBoard(
        grid.map((row: SudokuValue[]) => row.map((value: SudokuValue) => value.toString()))
    );

    for (let row: number = 0; row < 9; row++) {
        for (let column: number = 0; column < 9; column++) {
            if (board[row][column].isEmpty()) {
                board[row][column].resetNotes();
            }
        }
    }

    for (let row: number = 0; row < 9; row++) {
        for (let column: number = 0; column < 9; column++) {
            if (!board[row][column].isEmpty()) {
                simplifyNotes(board, row, column);
            }
        }
    }

    return board;
}

function createRefutationSolution(grid: SudokuValue[][]): string[][] {
    return grid.map((row: SudokuValue[]) => row.map((value: SudokuValue) => value.toString()));
}

describe("calculate refutation score", () => {
    it.each(
        ALL_ADDITIONAL_BOARDS_WITH_REFUTATION_SCORES.map((fixture, index) => [index, fixture] as const)
    )("matches the hardcoded score for additional board %i", (_index, { board, solution, refutationScore }) => {
        resetSeed();

        const score: number = Refutation.getRefutationScore(
            createRefutationBoard(board),
            createRefutationSolution(solution),
            1
        );

        expect(score).toBe(refutationScore);
    });

    afterEach(() => {
        resetSeed();
    });
});
