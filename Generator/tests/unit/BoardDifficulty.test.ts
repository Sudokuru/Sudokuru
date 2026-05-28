import { Board } from "../../Board";
import { resetSeed } from "../../Random";
import type { SudokuValue } from "../../../V4/Types";
import { ALL_ADDITIONAL_BOARDS_WITH_DIFFICULTIES } from "../../../V4/tests/utils/additionalBoards";
import { DIFFICULTY_TEST_BOARDS_WITH_DIFFICULTIES } from "../../../V4/tests/utils/difficultyBoards";

function createBoardString(board: SudokuValue[][] | string): string {
    if (typeof board === "string") {
        return board;
    }

    return board.map((row: SudokuValue[]) => row.join("")).join("");
}

describe("calculate board difficulty", () => {
    it.each(
        ALL_ADDITIONAL_BOARDS_WITH_DIFFICULTIES.map((fixture, index) => [index, fixture] as const)
    )("matches the hardcoded difficulty for additional board %i", (_index, { board, difficulty }) => {
        resetSeed();

        const boardDifficulty: number = new Board(createBoardString(board)).getDifficulty();

        expect(boardDifficulty).toBe(difficulty);
    });

    it.each(
        DIFFICULTY_TEST_BOARDS_WITH_DIFFICULTIES.map((fixture, index) => [index, fixture] as const)
    )("matches the hardcoded difficulty for historical difficulty board %i", (_index, { board, difficulty }) => {
        resetSeed();

        const boardDifficulty: number = new Board(createBoardString(board)).getDifficulty();

        expect(boardDifficulty).toBe(difficulty);
    });

    afterEach(() => {
        resetSeed();
    });
});
