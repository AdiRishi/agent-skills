---
name: orchestrate-claude
description: Coordinate Claude subagents from the current session with clear ownership and deliberate model selection.
disable-model-invocation: true
---

# Orchestrate Claude

Deliver the requested outcome with strong judgment and economical execution. Lead from the current session, keeping your model and effort. Delegate where another agent can make useful progress with clear ownership.

## Keep the judgment

Own the user's intent, decisions that cross workstreams, and acceptance of the final result. Let each worker investigate, decide, implement, and validate within its assignment.

Keep a dependent chain of work with one agent when it fits in one context window. Delegate to gain useful parallel progress, keep bulky investigation out of your context, or move well-bounded work to a cheaper model. Account for the work of briefing, reviewing, and integrating the result when deciding whether delegation helps.

Give each worker a coherent outcome, including its implementation and tests. Preserve the context it needs to carry the work through completion.

## Pick the model

The main coordinator may choose any available model suited to the assignment, including a more capable model than itself. A delegated coordinator works within the model choices and delegation authority its parent gives it.

Choose each worker's model explicitly. Use these model and effort defaults as starting points for the assignment:

| `model`  | `effort` | Assign |
| -------- | -------- | ------ |
| `opus`   | omit     | Complex workstreams, difficult diagnosis, and decisions spanning substantial code. It can own local design and lead a workstream through validation. |
| `sonnet` | `high`   | Bounded features, fixes, refactors, and investigations with a clear outcome. Let it resolve local implementation choices. |
| `haiku`  | `xhigh`  | Focused search, extraction, repetitive changes, and small implementations with straightforward checks. |
| `fable`  | `medium` | A specifically justified difficult investigation or another perspective on a consequential question. |

Omit `effort` for Opus so it runs at the configured default. Choose based on the reasoning the assignment requires and how readily you can verify its result. Choose a stronger model where ambiguity or a mistaken conclusion would affect the rest of the work.

Search directly when you already know the file or symbol. Haiku suits finding call sites or extracting facts. Understanding an undocumented lifecycle can require a stronger model even when every action is a read.

## Write the brief

Explain how the assignment contributes to the overall outcome, what must remain true, and what evidence will establish completion. Give the worker enough context to act independently, including settled decisions, relevant sources, the files it may change, and applicable instructions from this conversation. Leave the approach to the worker within those boundaries.

Ask for findings with supporting evidence: a file path with a line number, a short quote, or a command result. Preserve the details that could change your decision, and keep the original sources accessible for review.

Give Sonnet and Haiku workers assignments to complete themselves. When a worker leads a workstream that benefits from further delegation, grant that authority explicitly and name the models it may use. Give it this skill and keep its responsibility focused on its assigned outcome.

For parallel edits in a shared checkout, give each worker its own files. Settle shared interfaces before assigning the code that uses them, and sequence edits to the same files.

## Coordinate through completion

While workers run, advance other parts of the task, review returned work, or settle open decisions. Continue with the same worker when its accumulated context helps.

Read the actual diff and evidence. Use a separate review when a fresh examination could change an important conclusion. Judge the combined result against the user's outcome and validate that the pieces work together.

Finish when the requested outcome is delivered, validation has run, and you have reviewed or explicitly excluded every subagent result.
