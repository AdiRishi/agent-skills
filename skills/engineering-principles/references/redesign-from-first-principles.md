# Redesign from first principles

When adding a requirement to an existing design, work out what the system would look like if that requirement had existed from the start. Use that answer to reshape the current design instead of attaching another special case.

1. Read the affected implementation, types, tests, documentation, and examples.
2. State the requirement as a foundational constraint.
3. Design the simplest coherent system that assumes the constraint from the beginning.
4. Compare that design with the current system and identify what must change.
5. Propagate the change through every owned representation.
6. Deliver the redesign in verifiable increments.

This principle does not require rewriting unrelated code. Its purpose is to prevent the new requirement from living as a permanent exception at the edge of the old model.
