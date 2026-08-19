# Subtract before you add

Remove unnecessary complexity before adding behavior. A smaller base makes the next change easier to understand and less brittle.

- Delete dead code, obsolete APIs, and unused configuration before reshaping nearby code.
- Remove redundant validators and guards when the boundary or type system already owns the invariant.
- Design for observed requirements rather than speculative cases.
- Remove prompt instructions that repeat stronger rules.
- Delete a reference that contains no unique information instead of leaving a stub.
- Reduce the feature set before polishing the remaining experience.

Do not delete code merely to make the diff smaller. Confirm that callers, tests, generated outputs, and documentation no longer depend on it. The goal is a simpler source of truth, not hidden breakage.
