# Outcome-oriented execution

For a planned rewrite or migration, optimize for the verified final design rather than keeping every intermediate state production-ready.

Temporary compatibility code often survives its migration and leaves two architectures behind. Avoid it when the work has explicit phases, the repository controls the callers, and temporary breakage stays local and reversible.

## Set the boundaries

- Define the intended final state before editing.
- Identify which intermediate states may be temporarily incomplete.
- Keep focused checks around the area under active change.
- Remove transitional code before the work finishes.
- Run the full relevant static and runtime verification at the final boundary.

Do not use this principle to excuse an unplanned broken main branch, an unreviewable batch, or missing proof. It applies only when the migration has a clear scope and completion condition.
