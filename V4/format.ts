/**
 * Formats a non-empty array of numbers as a user-facing English list.
 */
export function formatNumberAsList(numbers: number[]): string {
  if (numbers.length === 1) {
    return `${numbers[0]}`;
  }

  if (numbers.length === 2) {
    return `${numbers[0]} and ${numbers[1]}`;
  }

  return `${numbers.slice(0, -1).join(", ")}, and ${numbers.at(-1)}`;
}
