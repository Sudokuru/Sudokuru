---
name: create-sudoku-strategy-doc-tests
description: Create exact Sudokuru V4 strategy contract tests from approved Markdown documentation and Frontend demo fixtures. Use when a strategy has docs-first examples and needs a dedicated docs red-test specification without implementing the strategy.
---

# Create Sudoku Strategy Doc Tests

Turn approved staged-hint examples into executable tests without duplicating their fixture data.

## Workflow

1. Read the complete `V4/docs/<STRATEGY>.md` and matching `V4/docs/<STRATEGY>_FRONTEND_DEMO.ts`.
2. Inspect `V4/tests/unit/wrongValueDocs.test.ts` and the shared helpers under `V4/tests/utils/`.
3. Confirm the demo exports the prepared puzzle, solution, exact hint, and target location needed to call the strategy.
4. If a required demo constant is private, change only `const` to `export const`. Do not otherwise refactor or alter demo behavior.
5. Create `V4/tests/unit/<lowerCamelStrategy>Docs.test.ts` that imports those fixtures and the strategy function.
6. Assert each documented example with `expectHintWithoutMutation`, comparing the complete `Hint` object.

## Contract Rules

- Treat stage order, location order, highlight types, actions, and explanation text as exact contract data.
- Import approved demo fixtures instead of recreating cells, arrays, or expected hints in the test.
- Cover every distinct example documented in the Markdown/demo pair.
- Keep docs-contract tests separate from broader behavioral tests.
- Do not implement the strategy or weaken expected output to make a stub pass.
- When the strategy is still a declaration-only stub, do not require or report passing runtime tests; red is the expected TDD state.

Use `git diff --check` and verify imports and fixture names statically. Report which documented examples are now locked by tests.
