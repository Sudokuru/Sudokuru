/**
 * Seeded pseudo random number generator.
 * Credit: https://stackoverflow.com/a/19303725
 */

const INITIAL_SEED: number = 81;
let seed: number = INITIAL_SEED;

/**
 * Generates a pseudo random number between 0 and 1.
 * @returns a pseudo random number between 0 and 1.
 */
export function next(): number {
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

/**
 * Resets the seed to the initial value.
 */
export function resetSeed(): void {
    seed = INITIAL_SEED;
}