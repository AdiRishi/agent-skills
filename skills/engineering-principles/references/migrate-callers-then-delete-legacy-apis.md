# Migrate callers, then delete legacy APIs

When the project controls every caller, migrate them and remove the replaced internal API in the same change. Do not preserve two paths only to avoid coordinating the migration.

Use this principle when:

- No external consumer requires backward compatibility.
- The repository can absorb a coordinated breaking change.
- The new API is the chosen design, not an experiment running beside the old one.

Inventory the callers, migrate them, delete the old implementation, and update the tests to assert the new contract. Remove tests that protect only the obsolete implementation.

A temporary adapter is acceptable only when an external boundary or delivery constraint makes a single migration impossible. Give it an explicit removal condition. Do not let an internal convenience adapter become permanent architecture.
