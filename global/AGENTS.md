# Global Scope User Instructions

I'm Adi. You are my agent. We will be working together a lot so I thought it would be worth introducing myself.

I'm a senior engineer Who has been working in the industry for over eight years. I have a background in fintech but I love all things software engineering.

I love to build. I focus on building complex things as simple as possible. I love to find ways to reduce complexity when solving problems.

I wanted to share some of my preferences here so we can be more aligned as we work together.

## Writing

Always keep the `unslop` skill loaded. Invoke it at the start of every session, and again after a compaction, before you write anything I will read.

## Coding Preferences

### General

- TypeScript is useful. Take advantage of it.
- Don't be scared to propose bold ideas if they can meaningfully benefit our work.
- Tests are good. Endless smoke tests, regression tests for feature deletions, etc., much less good. Tests should be focused not slop.
- Keep comments up to date. When making changes it is important to keep things in sync.

### Typescript focused

- `any` is the enemy. Invert types are our friends. Our system should adapt to changes instead of requiring changes everywhere.
- If your TS code looks like a Python dev wrote it, it is bad TS code.
- Avoid one-liner functions that are just casting wrappers.
- Write TypeScript in a way that Matt Pocock would be proud of.
- If not already specified in a project, I generally like to use pnpm, React, Tailwind, and shadcn UI.

### Maintainability

Long term maintainability is a core priority. If you add new functionality, first check if there is shared logic that can be extracted to a separate module. Duplicate logic across multiple files is a code smell and should be avoided. Don't be afraid to change existing code. Don't take shortcuts by just adding local logic to solve a problem.

Avoid backwards-compatibility hacks like renaming unused _vars, re-exporting types, adding // removed comments for removed code, etc. If you are certain that something is unused, you can delete it completely.

### Scope and Simplicity

Don’t add error handling, fallbacks, or validation for scenarios that can’t happen. Trust internal code and framework guarantees. Only validate at system boundaries (user input, external APIs). Don’t use feature flags or backwards-compatibility shims when you can just change the code.

Don't design for hypothetical future requirements. Three similar lines is better than a premature abstraction. No half-finished implementations either.

### Tests

Write high-signal tests that protect durable behavior. Prefer integration-style tests through a module's public interface, using real in-process collaborators and realistic fixtures; replace only true external seams with controlled adapters. A test should describe an outcome a caller or user cares about, protect an important invariant or failure/recovery path, and remain valid after an internal refactor.

Do not add tests merely to record the implementation journey. Avoid old-versus-new comparisons, tests for transient scaffolding, assertions about private helpers or internal call order, mock call-count tests, and expectations recomputed with the same logic as the implementation. When behavior changes, update or remove tests for obsolete contracts instead of preserving both histories. Before adding a test, be able to name the durable regression it would catch. Keep each test focused on one logical behavior and use independently known expected values.

### Code Style

- Prefer concise, simple solutions over clever or heavy abstractions. Channel "YAGNI" principles .
- If a substantially simpler approach exists, use it or surface it clearly.
- When using TypeScript, take advantage of TypeScript's type system. Trust it. Don't check things that the type system guarantees.
- Don't write one-line wrappers and casting functions in TypeScript. You are not a Python dev. TS should be written like TS not like Python.

### Code Comments

Write code that reads like the surrounding code: match its comment density, naming, and idiom.

Documentation comments and docstrings that define a public API contract should follow the surrounding codebase's conventions; the rules below concern explanatory implementation comments.

Default to writing no comments. Only add one when the WHY is non-obvious: a hidden constraint, a subtle invariant, a workaround for a specific bug, behavior that would surprise a reader. If removing the comment wouldn't confuse a future reader, don't write it.

Comments should capture only a constraint or non-obvious reason the code itself can't show. Never use them to say where the code came from, what the next line does, or why your change is correct; that's you talking to the reviewer, not the next reader, and it's noise the moment the PR merges.

Don't explain WHAT the code does, since well-named identifiers already do that. Don't reference the current task, fix, or callers ("used by X", "added for the Y flow", "handles the case from issue #123"), since those belong in the PR description and rot as the codebase evolves.

### Commit Discipline

Commit throughout development at meaningful, reviewable checkpoints instead of waiting until the end. Use focused messages that describe the behavior or architectural change, keep unrelated work in separate commits, and avoid vague checkpoint or catch-all commits. Order commits so the history tells the implementation story: each commit should be coherent on its own, and the sequence should make the motivation, foundations, behavior changes, and validation easy for a reviewer to follow.

### Match ceremony to the task

- Do not spawn sub-agents or a multi-agent panel for work. A single agent finishes in one pass. Delegation is for breadth or adversarial review not for ordinary tasks.
- When several agents do work in parallel, state file ownership up front so they do not collide.

## Instructions specific to the Codex Harness

Commands may run in a sandbox that restricts network access, credential/keychain stores, host services, and writes outside the workspace. These restrictions can produce misleading errors or be swallowed by wrappers as successful empty or negative results.

Before diagnosing an important in-scope tool, accepting a consequential negative discovery result, or asking the user to reauthenticate, reinstall, or reconfigure it, retry the direct authoritative command with scoped escalation and a concise access justification. This applies to GitHub CLI, package-manager `@latest` commands and React Doctor, CoreSimulator/`simctl`, and similar networked or host-integrated tools.

Use `/bin/zsh -lc '<command>'` only when login-shell environment initialization is specifically required.

### Interaction Guidelines

When explaining something to the user, look for opportunities to use the Visualize plugin. Use it whenever a visualisation would meaningfully improve understanding, and skip it only for simple concepts where it would add little or no explanatory value.

### Sub-agent sizing

This policy does not itself authorize delegation. When delegation is otherwise authorized and no count is specified, treat the configured limit as a ceiling and use only the minimum number justified by naturally independent workstreams. Never subdivide work merely to fill available slots.

