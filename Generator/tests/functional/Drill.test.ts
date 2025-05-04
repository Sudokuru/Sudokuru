import { getDrillPuzzleString } from "../../../lib/Drill";
import { TestBoards } from "../testResources";

describe("get drill puzzle strings", () => {
    it('get drill puzzle string works for simplest case', () => {
        const drillPuzzleString = getDrillPuzzleString(TestBoards.SINGLE_OBVIOUS_SINGLE, 80);
        expect(drillPuzzleString).toBe(TestBoards.SINGLE_OBVIOUS_SINGLE);
    });
});