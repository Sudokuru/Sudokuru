---
name: typescript-best-practices
description: Apply repository-wide TypeScript best practices. Always use for every task that reads, writes, reviews, refactors, tests, or discusses TypeScript or TSX code, including type declarations and API design.
---

# TypeScript Best Practices

- Always specify all three generator type arguments: `Generator<TYield, TReturn, TNext>`. Do not rely on their defaults. Use `void` for `TReturn` when the generator returns no final value and for `TNext` when callers should not pass values to `next()`.
