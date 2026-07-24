# AI-Assisted Strategy Development

Use the repository's strategy skills in the following order when implementing a new V4 Sudoku strategy:

1. Stub
2. Documentation tests
3. Remaining strategy tests
4. Implementation

This sequence preserves the docs-first, test-driven workflow described in `V4/PLAN.md`. Human developers should review and approve each stage before asking AI to continue to the next one.

## Prerequisite: Approved Strategy Documentation

Before starting, the strategy should have approved Markdown documentation and a matching Frontend demo fixture under `V4/docs/`. The documentation defines the staged hint behavior, affected cells, ordering, highlights, actions, and user-facing text.

## 1. Create the Strategy Stub

Use [`$create-sudoku-strategy-stub`](../.agents/skills/create-sudoku-strategy-stub/SKILL.md).

Example prompt:

```text
Use $create-sudoku-strategy-stub to create the V4 amend notes strategy stub.
```

The AI should create only the typed strategy module and declaration. It should not add tests or implementation logic yet.

Review the function name, inputs, return type, shared V4 types, and JSDoc before continuing.

## 2. Create Tests from Documentation

Use [`$create-sudoku-strategy-doc-tests`](../.agents/skills/create-sudoku-strategy-doc-tests/SKILL.md).

Example prompt:

```text
Use $create-sudoku-strategy-doc-tests to create exact tests for the amend notes documentation examples.
```

The AI should reuse exported Frontend demo fixtures and create a dedicated docs-contract test. These tests lock the approved hint stages exactly, including ordering, highlights, actions, and text.

The strategy is still unimplemented, so failing runtime tests are the expected TDD state.

## 3. Add the Remaining Strategy Tests

Use [`$expand-sudoku-strategy-tests`](../.agents/skills/expand-sudoku-strategy-tests/SKILL.md).

Example prompt:

```text
Use $expand-sudoku-strategy-tests to add comprehensive tests for the amend notes strategy.
```

The AI should add behavioral coverage beyond the documentation examples. Depending on the strategy, this includes additional matches, deterministic precedence, traversal order, targeted behavior, `null` cases, and input immutability.

Review any behavior inferred beyond the approved documentation. These tests become part of the implementation contract, so resolve questionable assumptions before continuing.

## 4. Implement the Strategy

Use [`$implement-sudoku-strategy`](../.agents/skills/implement-sudoku-strategy/SKILL.md).

Example prompt:

```text
Use $implement-sudoku-strategy to implement amend notes and get its tests passing.
```

The AI should treat the existing docs and tests as the contract, implement pure and deterministic production logic, preserve immutable inputs, and reuse or promote shared V4 helpers where appropriate. Test changes should remain minimal and require a demonstrated fixture or contract error.

Before considering the strategy complete, verify:

- Focused strategy and docs-contract tests pass.
- The complete V4 unit suite passes.
- Changed production TypeScript files compile.
- Broader repository failures, if any, are identified separately from strategy failures.
- `V4/PLAN.md` and the strategy implementation PR checklist are updated when applicable.
