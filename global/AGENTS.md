# Global instructions

## About Adi

Adi is a senior engineer with more than eight years of industry experience and a background in fintech. He likes building complex systems with the simplest design that fits the real requirements.

Act once the scope is clear. Suggest a bold approach when it would materially improve the work, but keep the implementation practical.

## Writing

Keep the `unslop` skill loaded. Invoke it at the start of every session and after each compaction, before you write anything Adi will read.

## Engineering

### TypeScript

- Use TypeScript's type system. Prefer inference and types that make downstream code adapt when a contract changes.
- Do not use `any`.
- Do not write one-line casting wrappers.
- Write idiomatic TypeScript, not code translated from another language.
- Unless a project says otherwise, prefer pnpm, React, Tailwind CSS, and shadcn/ui.

### Maintainability

Long-term maintainability matters. Before you add behavior, look for existing logic that belongs in a shared module. Remove duplication when the shared rule is real, but do not create an abstraction for a hypothetical future use.

Change existing code when the design calls for it. Do not solve a shared problem with isolated caller-specific logic.

Delete code that is certainly unused. Do not preserve it through renamed `_variables`, obsolete re-exports, `removed` comments, feature flags, or compatibility shims.

### Scope and validation

Build the complete requested behavior. Do not add unfinished paths for possible future requirements.

Trust internal types and framework guarantees. Validate only at system boundaries, such as user input and external APIs. Do not add error handling or fallbacks for states that cannot occur.

Prefer three similar lines over a premature abstraction. If a substantially simpler design exists, use it or explain it before continuing.

### Tests

Write focused tests that protect durable behavior. Prefer tests through a module's public interface with real in-process collaborators and realistic fixtures. Replace only true external seams with controlled adapters.

A test must protect an outcome a caller cares about, an important invariant, or a failure and recovery path. It must remain useful after an internal refactor. Before you add one, name the regression it would catch.

Do not add tests that record the implementation process. Avoid old-versus-new comparisons, assertions about private helpers or internal call order, mock call counts, and expected values calculated with the implementation's own logic.

When behavior changes, update or delete tests for the obsolete contract. Keep each test focused on one logical behavior and use independently known expected values.

### Comments

Match the surrounding code's naming, idiom, and comment density. Keep public API documentation consistent with the project.

Default to no implementation comments. Add one only for a reason the code cannot show, such as a hidden constraint, a subtle invariant, or a specific workaround.

Do not narrate what the next line does. Do not mention the current task, a caller, or why the change is correct. Put that context in the commit or pull request description.

Keep existing comments accurate when behavior changes.

### Commits

Commit at meaningful, reviewable checkpoints. Keep unrelated changes separate. Use messages that describe the behavior or design change, and order commits so the history explains the implementation.

## Codex environment

The Codex sandbox may restrict the network, credential stores, host services, and writes outside the workspace. A wrapper can hide these failures or return a misleading negative result.

Before you diagnose an important in-scope tool or ask Adi to reauthenticate, reinstall, or reconfigure it, retry the direct authoritative command with scoped escalation and a concise reason. This rule applies to GitHub CLI, package-manager `@latest` commands, React Doctor, CoreSimulator, `simctl`, and similar tools.

Use `/bin/zsh -lc '<command>'` only when login-shell initialization is required.

## Delegation

One agent handles ordinary work in one pass. Use sub-agents only when independent breadth or an adversarial review justifies the handoff.

When delegation is authorized, use the fewest agents that the independent workstreams require. State file ownership before parallel edits so agents do not collide.
