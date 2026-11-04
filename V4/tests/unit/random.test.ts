import { createSeededRandom } from "../../random";

describe("createSeededRandom", () => {
  // Literal uint32 vectors from the referenced Mulberry32 algorithm, checked
  // independently with unsigned integer arithmetic (not this implementation).
  it.each([
    [81, [3598250134, 1343044616, 1596529556, 2384588167, 28940331]],
    [0, [1144304738, 1416247, 958946056, 627933444, 2007157716]],
    [1, [2693262067, 11749833, 2265367787, 4213581821, 4159151403]],
    [-1, [3850105811, 813802916, 3073704848, 4054706436, 3630262831]],
  ] as const)("matches the Mulberry32 vector for seed %i", (seed, expected) => {
    const nextRandom = createSeededRandom(seed);

    for (const value of expected) {
      expect(nextRandom() * 4294967296).toBe(value);
    }
  });

  it.each([81, 81.9, 4294967377])(
    "normalizes seed %s to the default 32-bit seed",
    (seed) => {
      const nextRandom = createSeededRandom(seed);

      expect(nextRandom() * 4294967296).toBe(3598250134);
      expect(nextRandom() * 4294967296).toBe(1343044616);
    }
  );

  it("keeps interleaved instances independent and restarts the default sequence", () => {
    const first = createSeededRandom();
    const second = createSeededRandom();
    const other = createSeededRandom(0);

    expect(first() * 4294967296).toBe(3598250134);
    expect(first() * 4294967296).toBe(1343044616);
    expect(other() * 4294967296).toBe(1144304738);
    expect(second() * 4294967296).toBe(3598250134);
    expect(first() * 4294967296).toBe(1596529556);
    expect(second() * 4294967296).toBe(1343044616);
    expect(createSeededRandom()() * 4294967296).toBe(3598250134);
  });

  it.each([0, 81, -1])("keeps seed %i outputs in [0, 1)", (seed) => {
    const nextRandom = createSeededRandom(seed);

    for (let index = 0; index < 10000; index += 1) {
      const value = nextRandom();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});
