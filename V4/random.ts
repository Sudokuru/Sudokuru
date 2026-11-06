const DEFAULT_RANDOM_SEED = 81;
// Number of distinct 32-bit values; also scales unsigned output into [0, 1).
const UINT32_RANGE = 2 ** 32;
// Fixed state increment defined by the Mulberry32 algorithm.
const MULBERRY32_INCREMENT = 0x6d2b79f5;

/**
 * Creates an isolated Mulberry32 generator returning values in [0, 1).
 * The default seed is 81. Seeds are normalized to signed 32-bit integers;
 * zero is valid. Generators with the same normalized seed produce the same
 * sequence, and advancing one generator does not affect another.
 *
 * Adapted from https://github.com/bryc/code/blob/master/jshash/PRNGs.md#mulberry32
 */
export function createSeededRandom(
  initialSeed: number = DEFAULT_RANDOM_SEED
): () => number {
  // Keep only the low 32 bits without relying on bitwise truncation. The
  // modulo also prevents the state from growing beyond exact integer range.
  let state = Number.isFinite(initialSeed) ? Math.trunc(initialSeed) % UINT32_RANGE : 0;

  return (): number => {
    state = (state + MULBERRY32_INCREMENT) % UINT32_RANGE;
    let value = Math.imul(state ^ (state >>> 15), state | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / UINT32_RANGE;
  };
}
