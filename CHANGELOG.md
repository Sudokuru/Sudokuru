# Changelog

## 3.4.0 - 2025-07-22

### Changed

- Fixed various bugs with the ways drills were generated
- Tightened strategy finding logic to remove low quality drills like obvious pair that contains an obvious single

### Added

- Added getDrillPuzzleString function to Drill API

## 3.3.0 - 2024-11-02

### Changed

- **Breaking:** Rename Naked strategies to Obvious strategies. This affects NAKED_SINGLE, NAKED_PAIR, NAKED_TRIPLET, and NAKED_QUADRUPLET. ([#99](https://github.com/Sudokuru/Sudokuru/pull/99)) (Thomas Gallant)

### Removed

- **Breaking:** Remove type `SudokuStrategyArray`. Instead, use `SudokuStrategy[]`. ([#99](https://github.com/Sudokuru/Sudokuru/pull/99)) (Thomas Gallant)