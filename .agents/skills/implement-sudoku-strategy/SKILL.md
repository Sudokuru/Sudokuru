---
name: implement-sudoku-strategy
description: Implement a tested Sudokuru V4 strategy and verify its exact docs and behavioral contracts. Use when declaration-only strategy code, docs-contract tests, and broader unit tests already exist and Codex should write pure deterministic production logic, reuse or promote shared helpers, and get the strategy tests passing with minimal test changes.
---

# Implement Sudoku Strategy

Treat the existing tests as the approved contract and implement the smallest maintainable production solution.

## Workflow

1. Read `V4/PLAN.md`, `.github/PULL_REQUEST_TEMPLATE.md`, `V4/Types.ts`, all strategy docs/demo files, the stub, and every strategy test.
2. Inspect `V4/wrongValue.ts`, `V4/cellLocations.ts`, and newer implemented strategies for current patterns.
3. Replace the declaration with a real function while preserving its public function shape and strengthening non-mutating collection parameters with the readonly contracts in step 6.
4. Return `null` for non-applicable targeted states and exact staged hints for matches.
5. Encode precedence and traversal order explicitly. Prefer readable early-return loops over dense array chains when selecting the first match.
6. Keep inputs immutable and outputs freshly constructed. Mark every collection input readonly when the function does not mutate it: use `readonly T[]`, readonly nested board rows, and `ReadonlySet`/`ReadonlyMap` for read-only collections in both public strategies and private helpers. Functional code means no observable mutation; it does not require avoiding clear local loops.
7. Reuse shared V4 types, layouts, and helpers. When production now needs a generic test helper, promote it to a sensibly named V4 module, retain JSDoc, and update the smallest possible test import surface.

## Guardrails

- Do not change tests merely to fit the implementation. Change a test only for a demonstrated fixture or contract error, and explain it.
- Do not add validation fallbacks for impossible states when strategies receive prevalidated puzzles. Access validated puzzle and solution arrays directly instead of optional-chaining array indices so contract violations fail fast.
- Do not use type assertions to narrow data already validated at the API boundary. Give downstream helpers the natural runtime types they consume; keep supported-size validation and narrowing inside `V4/validate.ts`.
- Do not reveal solution values when the approved hint is corrective rather than solving.
- Preserve exact stage order, location order, highlights, actions, and text from docs-contract tests.
- Use `SudokuNumber` for numbers representing placed cell values, notes, candidates, or solution entries. Use plain `number` for coordinates, sizes, indices, and counts.
- Use shared types from `V4/Types.ts`; promote genuinely shared concepts there and update `V4/PLAN.md` terminology/changelog when necessary.
- Keep strategy-specific hint construction in the strategy module; move only genuinely reusable board/cell/location operations into shared modules.

## Verification

Run checks in increasing scope:

1. Focused strategy and docs-contract tests.
2. The complete V4 unit suite.
3. A production TypeScript check covering the changed V4 modules.
4. The repository-wide test suite when feasible.
5. `git diff --check` and a final diff audit.

Report exact pass counts. If broader checks fail because of an unrelated missing dependency or pre-existing failure, identify it separately and do not disguise it as strategy failure. Review `V4/PLAN.md`; update roadmap, terminology, revision, or changelog only when the implementation actually changes those items, and never invent a PR link.
