import { Cell } from "../../Cell";
import { Dependency } from "../../Dependency";
import { resetSeed } from "../../Random";
import { getCellBoard, simplifyNotes } from "../../Sudoku";
import { SudokuValue } from "../../../V4/Types";
import { ALL_ADDITIONAL_BOARDS_WITH_DEPENDENCY_SCORES } from "../../../V4/tests/utils/additionalBoards";

function createDependencyBoard(grid: SudokuValue[][]): Cell[][] {
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

function normalizeSignedZero(score: number): number {
    return Object.is(score, -0) ? 0 : score;
}

describe("calculate dependency score", () => {
    it.each(
        ALL_ADDITIONAL_BOARDS_WITH_DEPENDENCY_SCORES.map((fixture, index) => [index, fixture] as const)
    )("matches the hardcoded score for additional board %i", (_index, { board, dependencyScore }) => {
        resetSeed();

        const score: number = Dependency.getDependencyScore(createDependencyBoard(board));

        expect(normalizeSignedZero(score)).toBe(dependencyScore);
    });

    afterEach(() => {
        resetSeed();
    });
});
