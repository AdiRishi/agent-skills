# Separate before serializing shared state

When concurrent actors may mutate the same object, first determine whether they need one shared object. Give each actor its own state when their facts can remain independent. Merge those facts only at a read or reporting boundary.

Shared files, branches, keys, and in-memory objects create races that are difficult to reproduce. A convention that tells writers to take turns does not enforce ownership.

## Resolve the ownership

1. Identify every value that more than one actor can write.
2. Decide whether one canonical value is a real domain invariant.
3. If it is not, split ownership into separate files, keys, branches, or state objects.
4. If it is, enforce one writer or serialized access with a lock, sequential phase, transaction, or atomic comparison.

Treat a proposed lock as a prompt to inspect the state model. Serialization is correct when the domain truly owns one value. It is unnecessary coordination when the data can be separated.
