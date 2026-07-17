## Checklist

- [ ] Update `V4/PLAN.md`

### Strategy implementation

Complete this section when the PR implements or changes a Sudoku strategy.

- [ ] The strategy follows the V4 `board + context → Hint | null` interface and uses shared V4 types.
- [ ] Approved docs and Frontend demo fixtures define the exact staged hint output.
- [ ] Docs-contract tests reuse the demo fixtures instead of duplicating them.
- [ ] Unit tests cover documented examples, additional matches, and applicable `null` cases.
- [ ] Deterministic precedence and traversal order are documented and tested when multiple matches are possible.
- [ ] The implementation is functional and deterministic, and tests verify that inputs are not mutated.
- [ ] Strategy tests pass.
