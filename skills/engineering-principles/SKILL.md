---
name: engineering-principles
description: Apply engineering principles to non-trivial architecture, API and type design, migrations, refactors, debugging, concurrency, product tradeoffs, and verification. Select the relevant references before acting.
---

# Engineering principles

## Principles

Each entry states when its principle applies. Before acting, open every applicable link and read the reference in full.

**Core**

- [Laziness Protocol](references/principle-laziness-protocol.md). Refactoring, sizing a diff, or tempted to add abstractions, layers, or signal threading. Bias to deletion and the smallest change that solves the problem.
- [Foundational Thinking](references/principle-foundational-thinking.md). Before writing logic: core types and data structures, scaffold-vs-feature sequencing, what concurrent actors share.
- [Redesign from First Principles](references/principle-redesign-from-first-principles.md). Integrating a new requirement into an existing design. Redesign as if it had been foundational from day one.
- [Subtract Before You Add](references/principle-subtract-before-you-add.md). Sequencing an addition, refactor, or rewrite. Remove dead weight first, then build on the simpler base.
- [Minimize Reader Load](references/principle-minimize-reader-load.md). Reviewing or shaping code that's hard to trace. Count layers and hidden state, collapse one-caller wrappers, shrink mutable scope.
- [Outcome-Oriented Execution](references/principle-outcome-oriented-execution.md). Planned rewrites and migrations with explicit phase boundaries. Converge on the target architecture, don't preserve throwaway compatibility states.
- [Experience First](references/principle-experience-first.md). Product, UX, or feature-scope tradeoffs. Choose user delight over implementation convenience.

**Architecture**

- [Model the Domain](references/principle-model-the-domain.md). Writing stateful logic, or code that branches a lot or repeats a shape assumption across files. Encode the domain in a structure (state machine, typed model, table or registry, reducer, boundary, the right collection) instead of scattered conditionals.
- [Boundary Discipline](references/principle-boundary-discipline.md). Wiring validation, error handling, or framework adapters. Guards at system boundaries, trust internal types, keep business logic pure.
- [Type System Discipline](references/principle-type-system-discipline.md). Designing types or a signature in any typed language. Make illegal states unrepresentable, brand primitives, parse external data at boundaries.
- [Make Operations Idempotent](references/principle-make-operations-idempotent.md). Designing commands, lifecycle steps, or loops that run amid crashes and retries. Converge to the same end state.
- [Migrate Callers Then Delete Legacy APIs](references/principle-migrate-callers-then-delete-legacy-apis.md). Introducing a new internal API while old callers exist. Migrate and delete in one wave.
- [Separate Before Serializing Shared State](references/principle-separate-before-serializing-shared-state.md). Concurrent actors might write the same file, branch, key, or object. Eliminate the sharing first.

**Verification**

- [Prove It Works](references/principle-prove-it-works.md). After a task, before declaring done. Verify against the real artifact, not a proxy or "it compiles".
- [Fix Root Causes](references/principle-fix-root-causes.md). Debugging. Trace each symptom to its root cause, reproduce first, ask why until you reach it.
- [Sequence Work into Verifiable Units](references/principle-sequence-verifiable-units.md). Multi-step work (sweeps, migrations, runs of similar edits) and how you stack commits and PRs. Break work into small units that each end in a check, verify each before the next, and order delivery so the sequence proves itself.

**Meta**

- [Encode Lessons in Structure](references/principle-encode-lessons-in-structure.md). You catch yourself writing the same instruction a second time. Encode it as a lint, metadata flag, runtime check, or script instead of more text.
