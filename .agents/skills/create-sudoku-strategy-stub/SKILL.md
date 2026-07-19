---
name: create-sudoku-strategy-stub
description: Create a declaration-only TypeScript stub for a documented Sudokuru V4 strategy. Use when starting a new strategy module, adding only its typed function signature, or preparing the first TDD step before strategy tests and implementation exist.
---

# Create Sudoku Strategy Stub

Create the smallest typed production artifact needed for the next docs-first strategy step.

## Workflow

1. Read `V4/PLAN.md`, `V4/Types.ts`, and the strategy's files under `V4/docs/`.
2. Inspect `V4/wrongValue.ts` and newer strategy modules for current naming and interface conventions.
3. Derive the module name, exported function name, required context, and return type from repository evidence. Ask only when product intent remains ambiguous.
4. Create `V4/<lowerCamelStrategy>.ts` with type-only imports, one explanatory JSDoc block, and one exported declaration.

Use the established shape when the docs do not require different context:

```ts
export declare function getStrategyHint(
  puzzle: CellProps[][],
  solution: SudokuValue[][],
  locationToCheck: CellLocation
): Hint | null;
```

## Boundaries

- Keep the file declaration-only: no function body, helpers, fixtures, or tests.
- Reuse public types from `V4/Types.ts`; do not create strategy-local substitutes.
- Preserve the required targeted-location contract unless the plan or approved docs explicitly say otherwise.
- Do not add speculative validation. Strategy inputs are prevalidated by the V4 architecture.
- Do not require runtime tests to pass at this stage; the declaration intentionally has no runtime implementation.

Finish with `git diff --check` and report the created signature and any contract assumption.
