import { bootstrapRankDifference, metrics, pearson, ranks, spearman } from "../statistics";

describe("research statistics", () => {
  test("preserves non-perfect Pearson correlations and readonly inputs", () => {
    const x = Object.freeze([1, 2, 3]);
    const y = Object.freeze([1, 2, 4]);
    expect(pearson(x, y)).toBeCloseTo(0.981980506061966, 12);
    expect(pearson([1, 2, 3], [1, 3, 2])).toBeCloseTo(0.5, 12);
    expect(pearson([1, 2, 3], [1, 2, 1])).toBe(0);
    expect(x).toEqual([1, 2, 3]);
    expect(y).toEqual([1, 2, 4]);
    expect(pearson([1, 2, 3], [2, 2, 2])).toBeNull();
    expect(pearson([1, Infinity], [1, 2])).toBeNull();
    expect(pearson([1, 2], [1, NaN])).toBeNull();
  });

  test("handles tied ranks, signed correlations, and unavailable coefficients", () => {
    expect(ranks([4, 2, 2, 1])).toEqual([4, 2.5, 2.5, 1]);
    expect(pearson([1, 2, 3], [6, 4, 2])).toBeCloseTo(-1);
    expect(spearman([4, 2, 2, 1], [40, 20, 20, 10])).toBeCloseTo(1);
    expect(pearson([1, 1, 1], [1, 2, 3])).toBeNull();
    expect(pearson([1], [2])).toBeNull();
    expect(pearson([], [])).toBeNull();
    expect(spearman([1, NaN, 3], [1, 2, 3])).toBeNull();
    expect(() => metrics([1], [Infinity])).toThrow("finite predictions");
    expect(() => pearson([1], [])).toThrow();
  });

  test("reports perfect predictions and reproducible paired differences", () => {
    expect(metrics([1, Math.E, Math.E ** 2], [0, 1, 2])).toMatchObject({ n: 3, spearman: 1, logRmse: 0 });
    const result = bootstrapRankDifference([10, 20, 30, 40], [1, 2, 3, 4], [1, 2, 3, 4]);
    expect(result).toMatchObject({ difference: 0, lower95: 0, upper95: 0, repeats: 2000, seed: 711 });
    expect(bootstrapRankDifference([10, 20, 30, 40], [1, 2, 3, 4], [1, 2, 3, 4])).toEqual(result);
  });
});
