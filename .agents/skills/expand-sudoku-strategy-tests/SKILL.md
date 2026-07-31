---
name: expand-sudoku-strategy-tests
description: Add broad TDD coverage for a Sudokuru V4 strategy beyond its approved documentation examples. Use when a strategy stub and docs-contract tests exist and the implementation contract needs positive variants, deterministic ordering, null cases, targeted behavior, and immutability tests before production code is written.
---

# Expand Sudoku Strategy Tests

Define the complete behavioral contract around the docs examples while leaving production implementation untouched.

Before starting, read and follow the shared [`write-sudoku-v4-tests`](../write-sudoku-v4-tests/SKILL.md) skill. It owns the common rules for literal expectations, helper discovery and promotion, TDD red states, and V4-only test execution. The rules below are specific to broad strategy coverage.

## Workflow

1. Read `V4/PLAN.md`, the strategy docs/demo, its docs-contract test, its stub, and `V4/Types.ts`.
2. Inspect `V4/tests/unit/wrongValue.test.ts` as the baseline pattern, then prefer a newer relevant strategy test when available.
3. Identify materially different matches, non-matches, ambiguity, precedence, and traversal cases for this strategy.
4. Add `V4/tests/unit/<lowerCamelStrategy>.test.ts`.

## Coverage Model

Adapt these categories to the strategy rather than adding meaningless cases:

- Each applicable unit or context: row, column, box, notes, values, or solution-based correction.
- Multiple possible matches: lock documented precedence and deterministic traversal order.
- Same behavior over several fixtures: use table-driven tests.
- `null` behavior: wrong cell type, already-correct state, no match, and targeted-only evaluation where applicable.
- Immutability: verify puzzle, solution, and other supplied context remain unchanged.
- Frontend contract: assert complete stages, location ordering, highlights, actions, and text.

## Boundaries

- Do not duplicate approved docs fixtures; leave exact docs coverage in the docs test.

Use the shared skill's intentional-red verification workflow while the strategy remains unimplemented.
