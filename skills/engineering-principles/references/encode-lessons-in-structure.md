# Encode lessons in structure

When the same correction appears twice, move the rule into a mechanism that applies without relying on memory. Use a type, lint rule, banned API, canonical helper, runtime check, metadata field, or script.

Text remains appropriate when a decision needs human or agent judgment. Mechanical rules belong in mechanisms.

## Choose the strongest practical mechanism

Prefer mechanisms in this order when the codebase supports them:

1. A type that makes the invalid state impossible.
2. A build or lint check that rejects it.
3. A canonical API that makes the correct path natural.
4. A runtime check at the relevant boundary.
5. A written instruction for decisions that cannot be enforced mechanically.

When a person corrects the work or a test exposes a recurring pattern, decide whether it is an isolated mistake or a missing system rule. If it is a system rule, add the mechanism now or record a concrete task with an owner and location.

Do not keep a written warning after a stronger mechanism makes it redundant. The mechanism becomes the source of truth.
