---
name: write-sudoku-v4-tests
description: Create, expand, refactor, or review tests for the Sudokuru V4 rewrite while keeping fixtures maintainable and verification isolated from the legacy codebase. Use whenever Codex writes or changes files under V4/tests, including API tests, strategy tests, docs-contract tests, regression tests, and TDD red suites.
---

# Write Sudoku V4 Tests

Apply these shared rules to every V4 test task. More specialized testing skills add workflow-specific requirements on top of this baseline.

## Workflow

1. Read the relevant V4 contract, production signature or stub, nearby tests, and `V4/Types.ts`.
2. Search `V4/tests/utils/` before creating any fixture, factory, clone, mutation, or assertion helper. Then check V4 production helpers and relevant tests for compatible behavior.
3. Define the smallest meaningful behavioral matrix: positive cases, absence or `null` cases, deterministic order or precedence, repeated matches, and immutability as applicable.
4. Write tests against public behavior. Keep production implementation unchanged during a tests-only TDD step.
5. Verify a focused V4 test path first, then the complete V4 unit suite when useful.

## Expected Values

- Express expected results as literal contract data. Keep values, locations, order, text, highlights, actions, and complete staged hints explicit.
- Import approved exported docs/demo fixtures when they are the contract; do not copy them into tests.
- Never calculate expected output with the production function under test, another production strategy, or a local expectation builder.
- Never reproduce production traversal, matching, precedence, formatting, pluralization, or stage-assembly logic in a test helper. Mirrored logic can preserve the same defect on both sides of an assertion.
- Reuse a named literal expected value only when the complete expected output is genuinely identical.
- State any user-visible assumption that is not settled by documentation before encoding it in an exact test.

## Helpers and Fixtures

- Reuse a compatible helper from `V4/tests/utils/` when one exists. Otherwise reuse a V4 production helper with identical semantics.
- If no compatible helper exists, add it to the appropriate file under `V4/tests/utils/`; create a sensibly named utility file when no existing file fits.
- Never duplicate a helper between suites. If the needed behavior is currently local to another test, move it into `V4/tests/utils/` and update every caller.
- Add JSDoc to reusable test helpers. Keep test-only abstractions in `V4/tests/utils/` until production code independently needs them.
- Avoid thin wrappers that only rename or compose one or two existing helpers. Prefer direct composition with a clear intermediate variable.
- Use table-driven tests when the same contract applies across several literal fixtures.

## V4-Only Verification

- Run only tests whose path is under `V4/`. Never run legacy `Generator/tests`, `npm test`, or an unscoped Jest command.
- Use `npx --no-install` for lockfile-managed tools. If a local executable is missing, stop and report it instead of downloading code during verification.
- Use a focused command such as:

```text
npx --no-install jest V4/tests/unit/<name>.test.ts --runInBand --coverage=false --watchman=false
```

- Use this command for the complete V4 unit suite:

```text
npx --no-install jest V4/tests/unit --runInBand --coverage=false --watchman=false
```

- For an intentional TDD red suite, confirm its failures come from the missing implementation and that every other V4 suite remains green. Report red tests as expected, not as task failure.
- Run `git diff --check`. Use `npx --no-install tsc --noEmit` when changed production TypeScript or declarations need compilation verification; do not treat it as test execution.

## Boundaries

- Do not test malformed inputs when the V4 contract says inputs are prevalidated.
- Do not weaken literal expectations to fit current implementation output.
- Do not implement production behavior during a tests-only request.
- Keep test descriptions behavioral and make failures identify the broken contract.
