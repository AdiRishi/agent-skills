---
name: engineering-principles
description: Apply engineering principles to non-trivial architecture, API and type design, migrations, refactors, debugging, concurrency, product tradeoffs, and verification. Select the relevant references before acting.
---

# Engineering principles

Use this skill when a task needs engineering judgment rather than mechanical execution.

## Apply the relevant principles

1. Scan the index before deciding how to approach the task.
2. Select only the principles that can change a decision in the current work.
3. Read each selected reference in full before acting.
4. Apply the principles within the active instructions and authorized scope.
5. Name a principle in the final response only when it explains a non-obvious decision or the user asks for the reasoning.

Stop after the scan when no principle would change the work. A broad design or migration may need several references.

## Simplicity and design

- [Laziness protocol](references/laziness-protocol.md). Use when refactoring, sizing a diff, or considering another abstraction, layer, or threaded signal. Prefer deletion and the smallest complete change.
- [Foundational thinking](references/foundational-thinking.md). Use before writing logic when core types, data structures, sequencing, or shared state will shape the rest of the work.
- [Redesign from first principles](references/redesign-from-first-principles.md). Use when adding a requirement to an existing design. Integrate it as though it had been a requirement from the start.
- [Subtract before you add](references/subtract-before-you-add.md). Use when sequencing an addition, refactor, or rewrite. Remove dead weight before building on the remaining design.
- [Minimize reader load](references/minimize-reader-load.md). Use when code is hard to trace or requires too much hidden state in the reader's head.
- [Outcome-oriented execution](references/outcome-oriented-execution.md). Use for planned rewrites and migrations with explicit phase boundaries. Converge on the intended design without preserving throwaway intermediate APIs.
- [Experience first](references/experience-first.md). Use for product, API, developer-experience, or feature-scope tradeoffs. Judge the result from the consumer's point of view.

## Architecture

- [Model the domain](references/model-the-domain.md). Use when stateful logic branches repeatedly or several files repeat the same shape assumption.
- [Boundary discipline](references/boundary-discipline.md). Use when placing validation, error handling, parsing, or framework adapters.
- [Type system discipline](references/type-system-discipline.md). Use when designing types or function signatures in a statically typed language.
- [Make operations idempotent](references/make-operations-idempotent.md). Use for commands, lifecycle steps, and processing loops that may run again after retries or partial failure.
- [Migrate callers, then delete legacy APIs](references/migrate-callers-then-delete-legacy-apis.md). Use when replacing an internal API whose callers can move in the same change.
- [Separate before serializing shared state](references/separate-before-serializing-shared-state.md). Use when concurrent actors may write the same file, branch, key, or state object.

## Verification

- [Prove it works](references/prove-it-works.md). Use before declaring work complete. Check the real artifact or behavior, not a proxy or self-report.
- [Fix root causes](references/fix-root-causes.md). Use when debugging. Reproduce the symptom, trace its cause, and repair the cause rather than suppressing the symptom.
- [Sequence work into verifiable units](references/sequence-verifiable-units.md). Use for migrations, sweeps, or other multi-step work whose units can each end in a checked state.

## Durable learning

- [Encode lessons in structure](references/encode-lessons-in-structure.md). Use when the same correction or instruction recurs. Prefer an enforceable mechanism over another reminder.
