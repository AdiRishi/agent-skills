# Fix root causes

Reproduce a problem, trace the causal chain, and fix the first incorrect state or decision. A guard that only hides the final symptom leaves the defect in place.

## Investigate the cause

- Reproduce the symptom before changing code.
- Ask why each incorrect state exists until you reach the decision that created it.
- Inspect real values and errors. Instrument the system when the evidence is missing.
- Search for other instances of the same faulty pattern.
- Reject a workaround that needs a long comment to explain why the underlying behavior remains wrong.

When a problem appears after a restart, inspect persistent state before assuming the code changed. Configuration, caches, lock files, and serialized state often distinguish the failing run from the successful one. If clearing state removes the symptom, determine why the system accepted or retained that state.

Verify the repair through the original reproduction. A new test can preserve the behavior after that direct proof exists.
