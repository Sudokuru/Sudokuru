const DEFAULT_RANDOM_SEED = 81;

/**
 * Creates an isolated Mulberry32 generator returning values in [0, 1).
 * Seeds are normalized to 32-bit integers; zero is a valid seed.
 *
 * Adapted from https://github.com/bryc/code/blob/master/jshash/PRNGs.md#mulberry32
 */
export function createSeededRandom(
  initialSeed: number = DEFAULT_RANDOM_SEED
): () => number {
  let state = initialSeed | 0;

  return (): number => {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), state | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}
