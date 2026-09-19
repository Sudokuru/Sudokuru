import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { DIFFICULTY_RESEARCH_PUZZLES, TIMING_BATCHES } from "../data";
import { prepareDataset } from "../prepare";

describe("historical difficulty research corpus", () => {
  const directory = resolve(__dirname, "../../../docs/difficulty/data");
  const prepared = prepareDataset(DIFFICULTY_RESEARCH_PUZZLES);

  test("preserves all unique puzzles, timing cohorts, and validated solutions", () => {
    expect(prepared).toHaveLength(44);
    expect(prepared.filter(row => row.record.seconds !== undefined)).toHaveLength(30);
    expect(prepared.filter(row => row.record.batch && TIMING_BATCHES[row.record.batch] === "personal")).toHaveLength(22);
    expect(prepared.filter(row => row.record.batch && TIMING_BATCHES[row.record.batch] === "site-average")).toHaveLength(8);
    expect(prepared[0]).toMatchObject({ givens: 60, empty: 21 });
    expect(prepared[0].secondsPerEmpty).toBeCloseTo(4.095238095238095);
    expect(prepared[0].record).toMatchObject({ seconds: 86, individualSeconds: [96, 76] });
  });

  test("matches the source CSV puzzles, timings, solutions, and scores", () => {
    const csv = readFileSync(resolve(directory, "legacy-difficulty-benchmarks.csv"), "utf8").trim().split("\n");
    for (const line of csv.slice(1)) {
      const columns = line.split(",");
      const record = DIFFICULTY_RESEARCH_PUZZLES.find(row => row.puzzle === columns[6])!;
      expect(prepared.find(row => row.record.id === record.id)!.solutionString).toBe(columns[7]);
      expect(record.seconds).toBe(Number(columns[3]));
      expect(record.individualSeconds).toEqual([Number(columns[1]), Number(columns[2])]);
      expect(record.legacyScore).toBe(Number(columns[0]));
      // The mislabeled source column counts givens, not empty cells.
      expect([...record.puzzle].filter(value => value !== "0").length).toBe(Number(columns[4]));
    }
  });

  test("matches generator benchmark puzzles and metrics", () => {
    const benchmark = readFileSync(resolve(directory, "legacy-generator-difficulty-benchmarks.txt"), "utf8");
    const puzzleLines = [...benchmark.matchAll(/^\d+ \| (\d+) \| (\d{81})$/gm)];
    const metricLines = benchmark.split("\n").filter(line => /^│\s+\d+\s+│/.test(line));
    expect(puzzleLines).toHaveLength(16);
    expect(metricLines).toHaveLength(16);
    puzzleLines.forEach((line, i) => {
      const record = DIFFICULTY_RESEARCH_PUZZLES.find(row => row.puzzle === line[2])!;
      const values = metricLines[i].split("│").slice(1, -1).map(cell => Number(cell.trim()));
      expect(record.seconds).toBe(Number(line[1]));
      expect(record.legacyScore).toBe(values[6]);
      expect(record.refutationScore).toBe(values[2]);
      expect(record.dependencyScore).toBeCloseTo(values[3]);
      expect(record.adjustedDependencyScore).toBeCloseTo(values[4], 12);
      expect([...record.puzzle].filter(value => value === "0").length).toBe(values[5]);
    });
  });

  test("matches generator report puzzles and scores", () => {
    const report = readFileSync(resolve(directory, "legacy-generator-difficulty-report.txt"), "utf8");
    const lines = report.split("\n").filter(line => /'\d{81}'/.test(line));
    expect(lines).toHaveLength(18);
    for (const line of lines) {
      const puzzle = line.match(/'(\d{81})'/)![1];
      const columns = line.split("│").slice(1, -1).map(cell => cell.trim());
      const record = DIFFICULTY_RESEARCH_PUZZLES.find(row => row.puzzle === puzzle)!;
      expect(record.legacyScore).toBe(Number(columns[6]));
      expect([...record.puzzle].filter(value => value !== "0").length).toBe(Number(columns[5]));
    }
  });
});
