const DEFAULT_RANDOM_SEED = 81;
const DEFAULT_RANDOM_CACHE_SIZE = 1 << 20;
const defaultRandomValues = new Float64Array(DEFAULT_RANDOM_CACHE_SIZE);
let cachedDefaultRandomValueCount = 0;

/**
 * Returns a cached value from the default deterministic sequence.
 */
function getDefaultRandomValue(index: number): number {
  if (index < cachedDefaultRandomValueCount) {
    return defaultRandomValues[index];
  }

  if (index >= DEFAULT_RANDOM_CACHE_SIZE) {
    const uncachedValue = Math.sin(DEFAULT_RANDOM_SEED + index) * 10000;
    return uncachedValue - Math.floor(uncachedValue);
  }

  for (
    let cacheIndex = cachedDefaultRandomValueCount;
    cacheIndex <= index;
    cacheIndex += 1
  ) {
    const value = Math.sin(DEFAULT_RANDOM_SEED + cacheIndex) * 10000;
    defaultRandomValues[cacheIndex] = value - Math.floor(value);
  }

  cachedDefaultRandomValueCount = index + 1;
  return defaultRandomValues[index];
}

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
  if (initialSeed === DEFAULT_RANDOM_SEED) {
    let index = 0;

    return (): number => {
      const value = getDefaultRandomValue(index);
      index += 1;
      return value;
    };
  }

  let seed = initialSeed;

  return (): number => {
    const value = Math.sin(seed) * 10000;
    seed += 1;
    return value - Math.floor(value);
  };
}
