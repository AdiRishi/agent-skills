# Minimize reader load

Measure maintainability by the work required to answer two questions:

1. How many layers must a reader trace?
2. How much hidden or mutable state must the reader remember?

The axes are independent. A deep adapter stack and a flat file with many globals can be equally difficult to understand.

## Reduce the work

- Collapse wrappers with one caller and adapters with no second implementation.
- Make adjacent layers change the abstraction. A pass-through layer adds no compression.
- Prefer interfaces that hide meaningful decisions over broad interfaces that mirror their implementations.
- Shrink mutable state from global to module, field, or local scope.
- Prefer returned values to mutations and derived values to synchronized copies.
- State an invariant once at its boundary rather than repeating it in every consumer.

Before adding a layer or mutable value, identify the reader load it removes elsewhere. If it removes none, keep the design direct.

A new reader should be able to find where an important value comes from and what can change it without tracing the whole system.
