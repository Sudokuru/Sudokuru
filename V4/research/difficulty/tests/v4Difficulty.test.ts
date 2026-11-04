import { describe, expect, test } from "bun:test";
import { V4_DIFFICULTY_TUNINGS, scoreV4Difficulty, summarizeRawDifficulty } from "../v4Difficulty";
import { getRawDifficulty } from "../../../difficulty";
import { getPuzzle } from "../../../validate";
import { ADDITIONAL_TEST_BOARDS_BY_NAME } from "../../../tests/utils/additionalBoards";
import { renderReport } from "../report";

describe("fixed V4 combined difficulty procedures", () => {
  test("preserves all five documented tunings with fully resolved settings", () => {
    expect(V4_DIFFICULTY_TUNINGS.map(row => [row.procedure, row.options.dependencyRunCount,
      row.options.maxRefutationScore, row.tuningMeanPearson, row.recommended])).toEqual([
      ["v4/difficulty-recommended", 3, 48, 0.8968778852, true],
      ["v4/difficulty-runs10-cap48", 10, 48, 0.8970182236, false],
      ["v4/difficulty-runs5-cap48", 5, 48, 0.8957552246, false],
      ["v4/difficulty-runs3-cap32", 3, 32, 0.8955966178, false],
      ["v4/difficulty-runs10-cap32", 10, 32, 0.8955491066, false],
    ]);
    for (const tuning of V4_DIFFICULTY_TUNINGS) {
      const { dependencyRunCount, maxRefutationScore, ...shared } = tuning.options;
      expect(shared).toEqual({ refutationRunCount: 1, refutationMaxTrialsPerRun: 64, refutationSeed: 81,
        dependencyStepCount: 25, dependencySeed: 81, refutationWeight: 1, dependencyWeight: 10,
        refutationEmptyCellExponent: 2, dependencyEmptyCellExponent: 1.9, outputScale: 1_000_000 });
    }
  });

  test("scores prepared records with the recommended API defaults and preserves inputs", () => {
    const puzzle = ADDITIONAL_TEST_BOARDS_BY_NAME.ONLY_OBVIOUS_SINGLES.flat().join("");
    const solution = ADDITIONAL_TEST_BOARDS_BY_NAME.ONLY_OBVIOUS_SINGLES_SOLUTION;
    const rows = [{ record: { puzzle }, solution }];
    const before = JSON.stringify(rows);
    expect(scoreV4Difficulty(rows, V4_DIFFICULTY_TUNINGS[0].options)).toEqual([-93977]);
    expect(getRawDifficulty(getPuzzle(puzzle), solution)).toBe(-93977);
    scoreV4Difficulty(rows, V4_DIFFICULTY_TUNINGS[1].options);
    expect(scoreV4Difficulty(rows, V4_DIFFICULTY_TUNINGS[0].options)).toEqual([-93977]);
    expect(JSON.stringify(rows)).toBe(before);
  });

  test("correlates negative raw scores directly with seconds and leaves time errors unavailable", () => {
    expect(summarizeRawDifficulty("v4/difficulty-recommended", [10, 20, 30], [-30, -20, -10])).toEqual({
      procedure: "v4/difficulty-recommended", scores: { n: 3, spearman: 1, pearson: 1, logRmse: null, secondsMae: null },
    });
    expect(summarizeRawDifficulty("test", [10, 20], [0, 0]).scores.pearson).toBeNull();
    expect(() => summarizeRawDifficulty("test", [10], [])).toThrow("aligned");
  });

  test("shows five separate Cloud rows and labels personal results as calibration diagnostics", () => {
    const cloud = V4_DIFFICULTY_TUNINGS.map(tuning => summarizeRawDifficulty(tuning.procedure, [10, 20, 30], [-30, -20, -10]));
    const report = renderReport([], [], { unique: 3, personal: 3, siteAverage: 0, untimed: 0 }, null,
      undefined, [], cloud, undefined, cloud);
    const main = report.split("## How do approaches compare with legacy?")[1].split("## Top three")[0];
    for (const tuning of V4_DIFFICULTY_TUNINGS) expect(main).toContain(tuning.procedure);
    expect(report).toContain("calibration diagnostics");
    expect(report).toContain("0.8968778852");
    expect(report).toContain("without exponentiation");
    const personalOnly = renderReport([], [], { unique: 3, personal: 3, siteAverage: 0, untimed: 0 }, null,
      undefined, [], undefined, undefined, cloud);
    expect(personalOnly.split("### Eliminated procedures")[0]).toContain("v4/difficulty-recommended");
  });
});
