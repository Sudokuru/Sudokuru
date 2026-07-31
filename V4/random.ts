const DEFAULT_RANDOM_SEED = 81;

/**
 * Creates an isolated deterministic pseudo-random number generator.
 *
 * Each returned function owns its seed, so consumers cannot affect one
 * another's random sequence.
 *
 * Adapted from https://stackoverflow.com/a/19303725
 */
export function createSeededRandom(
  initialSeed: number = DEFAULT_RANDOM_SEED
): () => number {
  let seed = initialSeed;

  return (): number => {
    const value = Math.sin(seed) * 10000;
    seed += 1;
    return value - Math.floor(value);
  };
}
