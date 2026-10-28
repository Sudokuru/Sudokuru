import { describe, expect, test } from "bun:test";
import { summarizeV4Refutation } from "../v4Refutation";

describe("V4 refutation evaluation", () => {
  test("reports correlation on raw scores without inventing seconds predictions", () => {
    const result = summarizeV4Refutation([10, 20, 30], [0, 1, 2]);
    expect(result).toEqual({ procedure: "v4/refutation", scores: { n: 3, spearman: 1, pearson: 1,
      logRmse: null, secondsMae: null } });
    expect(summarizeV4Refutation([10, 20, 30], [0, 0, 0]).scores.spearman).toBeNull();
    expect(() => summarizeV4Refutation([10], [])).toThrow("aligned");
  });
});
