---
name: expand-sudoku-strategy-tests
description: Add broad TDD coverage for a Sudokuru V4 strategy beyond its approved documentation examples. Use when a strategy stub and docs-contract tests exist and the implementation contract needs positive variants, deterministic ordering, null cases, targeted behavior, and immutability tests before production code is written.
---

# Expand Sudoku Strategy Tests

Define the complete behavioral contract around the docs examples while leaving production implementation untouched.

## Workflow

1. Read `V4/PLAN.md`, the strategy docs/demo, its docs-contract test, its stub, and `V4/Types.ts`.
2. Inspect `V4/tests/unit/wrongValue.test.ts` as the baseline pattern, then prefer a newer relevant strategy test when available.
3. Identify materially different matches, non-matches, ambiguity, precedence, and traversal cases for this strategy.
4. Add `V4/tests/unit/<lowerCamelStrategy>.test.ts`, using exact `Hint` equality.
5. Reuse `valuesToPuzzle`, `withNotes`/`withValues` from `V4/tests/utils/withCells.ts`, `expectHintWithoutMutation`, and production location helpers when applicable.

## Coverage Model

Adapt these categories to the strategy rather than adding meaningless cases:

- Each applicable unit or context: row, column, box, notes, values, or solution-based correction.
- Multiple possible matches: lock documented precedence and deterministic traversal order.
- Same behavior over several fixtures: use table-driven tests.
- `null` behavior: wrong cell type, already-correct state, no match, and targeted-only evaluation where applicable.
- Immutability: verify puzzle, solution, and other supplied context remain unchanged.
- Frontend contract: assert complete stages, location ordering, highlights, actions, and text.

## Boundaries

- Do not modify or implement production strategy code.
- Do not test malformed boards when the strategy contract says inputs are prevalidated.
- Do not duplicate approved docs fixtures; leave exact docs coverage in the docs test.
- Avoid thin wrapper helpers that only rename or compose one or two existing helpers. Call the existing helpers directly, using an intermediate variable or brief comment when setup needs clarification. For example, prefer `withNotes(withValues(emptyPuzzle(), basisCells), [target])` over a `puzzleWithBasisCells` wrapper.
- Add a helper only when it captures meaningful repeated logic or a substantive test-domain abstraction.
- Keep helpers local until reused. Put test-only reusable helpers in `V4/tests/utils/` with JSDoc and an eventual-graduation header.
- Promote a test helper into V4 production only later, when production code actually needs it.
- If docs do not settle a user-visible behavior, state the assumption before locking it into exact tests.

Do not treat expected red tests as task failure while the strategy remains unimplemented. Run only non-runtime checks unless the user asks to demonstrate the red state.
