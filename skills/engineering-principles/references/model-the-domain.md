# Model the domain

Represent domain rules in a data structure instead of repeating them across conditionals.

Scattered booleans, synchronized fields, and repeated shape assumptions spread one invariant across several files. A structure that matches the domain can remove invalid states and branches.

Choose the structure that fits the actual rules and access patterns. Common choices include:

- A state machine instead of separate lifecycle booleans.
- A typed model instead of loose parameters.
- A map, registry, lookup table, or discriminated union instead of repeated branching.
- A reducer or command model instead of unrelated mutations.
- A module organized around one body of domain knowledge rather than execution phases.
- A queue, cache, index, graph, tree, or normalized collection when access patterns call for one.

Do not force an abstraction onto code that is already clear and local. A useful abstraction removes duplicated rules, invalid states, branches, or lifecycle risk. Indirection alone is not domain modeling.

A growing conditional chain or a second boolean that must remain synchronized with the first often signals a missing domain model.
