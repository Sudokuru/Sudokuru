import { UNIT_PRECEDENCE } from "../../Types";
import type { CellProps } from "../../Types";
import { getUnitLocations } from "../../units";
import { safeRatio } from "./statistics";

/** Initial candidate-location counts across missing digits in rows, columns and boxes. */
export type UnitScarcityFeatures = {
  readonly unitMissingDigits: number;
  readonly unitOneLocation: number;
  readonly unitTwoLocations: number;
  readonly unitThreeLocations: number;
  readonly unitManyLocations: number;
  readonly unitTwoLocationFraction: number;
};

/** Measure candidate locations without changing the initialized board or placing values. */
export function unitScarcity(board: readonly (readonly CellProps[])[]): UnitScarcityFeatures {
  if (board.length !== 9 || board.some(row => row.length !== 9)) throw new Error("Unit scarcity requires a 9x9 board.");
  const counts = [0, 0, 0, 0];
  for (const unit of UNIT_PRECEDENCE) for (let i = 0; i < 9; i++) {
    const target = unit === "row" ? { r: i, c: 0 } : unit === "column" ? { r: 0, c: i } :
      { r: Math.floor(i / 3) * 3, c: (i % 3) * 3 };
    const cells = getUnitLocations(target, unit, 9).map(({ r, c }) => board[r][c]);
    for (let digit = 1; digit <= 9; digit++) {
      if (cells.some(cell => cell.type !== "note" && cell.value === digit)) continue;
      const locations = cells.filter(cell => cell.type === "note" && cell.notes.includes(digit)).length;
      if (locations === 0) throw new Error("A missing unit digit has no legal candidate location.");
      counts[Math.min(locations, 4) - 1]++;
    }
  }
  const missing = counts.reduce((sum, count) => sum + count, 0);
  return { unitMissingDigits: missing, unitOneLocation: counts[0], unitTwoLocations: counts[1],
    unitThreeLocations: counts[2], unitManyLocations: counts[3], unitTwoLocationFraction: safeRatio(counts[1], missing) };
}
