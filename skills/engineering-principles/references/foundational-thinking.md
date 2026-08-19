# Foundational thinking

Choose the data shape before writing the logic around it. The right structure makes common access paths clear and preserves room for later decisions. A poor structure spreads compensation code through every caller.

## Shape the foundation

- Define core types early.
- Trace how the data is created, read, updated, and removed.
- Choose structures that match the dominant access paths.
- Model shared invariants once instead of coordinating them across callers.
- Ask what another actor could change concurrently before sharing mutable state.

Keep code-level choices plain. Converge types and data models, but do not abstract three similar statements merely because they look alike. An abstraction must remove a repeated decision, invalid state, or meaningful body of work.

Sequence shared setup before work that depends on it. CI, linting, test infrastructure, and common types can be foundations when each later unit benefits from them. Keep each change coherent and independently understandable.

[Subtract before adding](subtract-before-you-add.md). A clean foundation starts by removing dead weight.
