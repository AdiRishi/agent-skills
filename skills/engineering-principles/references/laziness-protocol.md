# Laziness protocol

Code is cheap to produce and expensive to keep. Solve the problem with the least code and coordination that leaves a complete, maintainable result.

- Look for deletion before addition.
- Keep the call hierarchy flat enough to trace.
- Collapse wrappers with one caller when they hide no meaningful work.
- Put a repeated decision behind one source of truth.
- Minimize the diff without leaving a partial implementation.
- Before threading a signal through types, schemas, and pipelines, look for a direct owner or a simpler path.
- Remove small pass-throughs, representation leaks, and duplicated choices before callers depend on them.

A rich interface may hide substantial work without adding reader load. An extra layer must compress complexity or enforce a real boundary. If it repeats the same arguments and methods, remove it.

Use the maintainer test. If understanding or changing the result would exhaust a competent engineer, simplify it.
