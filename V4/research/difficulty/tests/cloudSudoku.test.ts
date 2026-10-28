import { loadCloudSudoku, parseCloudSudoku, prepareCloudSudoku } from "../cloudSudoku";
import { DIFFICULTY_RESEARCH_PUZZLES } from "../data";

describe("Cloud Sudoku independent validation corpus", () => {
  test("preserves source measurements and prepares unique puzzle solutions", () => {
    const records = loadCloudSudoku();
    expect(records).toHaveLength(1533);
    expect(records[0]).toEqual({ id: "cloud-sudoku-3",
      puzzle: "730020800000000009002003070000600103080741060105002000050900300300000000008060045",
      batch: "Cloud Sudoku", seconds: 303, completionCount: 12 });
    const oldPuzzles = new Set(DIFFICULTY_RESEARCH_PUZZLES.map(row => row.puzzle));
    expect(records.filter(row => oldPuzzles.has(row.puzzle))).toHaveLength(0);
    const prepared = prepareCloudSudoku(records);
    expect(prepared).toHaveLength(1533);
    expect(prepared[0].solutionString).toHaveLength(81);
    expect(prepared[0].givens + prepared[0].empty).toBe(81);
  }, 120000);

  test("rejects invalid or duplicated source rows", () => {
    const row = "3,73..2.8..........9..2..3.7....6..1.3.8.741.6.1.5..2....5.9..3..3..........8.6..45,12,303";
    expect(() => parseCloudSudoku(`${row}\n${row}`)).toThrow("Duplicate");
    expect(() => parseCloudSudoku(row.replace(",12,303", ",0,303"))).toThrow("Invalid");
    expect(() => parseCloudSudoku(row.replace(",12,303", ",12,0"))).toThrow("Invalid");
  });
});
