---
name: use-data-structure-typed
description: Check data-structure-typed before creating, implementing, refactoring, or reviewing a complex data structure in TypeScript or JavaScript. Use for queues, deques, stacks, heaps, priority queues, linked lists, trees, tries, graphs, ordered maps or sets, matrices, and custom Array, Map, or Set logic that emulates those behaviors.
---

# Use Data Structure Typed

Prefer the installed `data-structure-typed` implementation whenever its semantics fit. Check the library before designing or approving a custom complex collection.

## Workflow

1. Identify the required behavior: ordering, insertion/removal ends, priority, traversal, lookup, duplicate handling, and mutation model.
2. Run `node .agents/skills/use-data-structure-typed/scripts/list-data-structures.cjs` from the repository root. Treat its output as the installed version's candidate list; do not rely on a remembered list.
3. Inspect the declarations for plausible candidates under `node_modules/data-structure-typed/dist/types/` or through the package's public subpath exports.
4. Compare the candidate API and semantics with the requirement, including:
   - time complexity;
   - ordering and equality behavior;
   - comparator support;
   - iteration and mutation behavior;
   - TypeScript and runtime compatibility.
5. Use the library type directly when it satisfies the requirement. Add a thin domain wrapper only when it provides a meaningful domain contract.
6. If no type is suitable, implement the smallest custom structure and record which library candidates were checked and why they did not fit.
7. Test behavior at the abstraction boundary, including empty-state and ordering cases.

## Common Mappings

- FIFO work list or scan queue: `Queue`
- Add or remove at either end: `Deque`
- LIFO history or traversal: `Stack`
- Ranked work items: `PriorityQueue`, `MinPriorityQueue`, or `MaxPriorityQueue`
- Heap operations: `Heap`, `MinHeap`, `MaxHeap`, or `FibonacciHeap`
- Ordered node chain: `SinglyLinkedList` or `DoublyLinkedList`
- Hierarchical or ordered lookup: `BinaryTree`, `BST`, `AVLTree`, `RedBlackTree`, or `TreeMap`
- Prefix lookup: `Trie`
- Vertex and edge relationships: a directed, undirected, or map graph
- Range aggregation or updates: `BinaryIndexedTree` or `SegmentTree`
- Two-dimensional numeric or tabular operations: `Matrix`

These mappings are prompts for inspection, not substitutes for checking the installed API.

## Guardrails

- Do not build a queue with `Array.shift()` when the library's `Queue` meets the contract.
- Do not introduce a custom heap, tree, graph, linked list, or trie until the installed candidates have been evaluated.
- Do not force a library structure onto a plain record, short fixed tuple, or simple collection with no specialized behavior.
- Do not import internal package paths in production code when a public root or subpath export exists.
- Do not add or upgrade the dependency unless the task authorizes dependency changes.
