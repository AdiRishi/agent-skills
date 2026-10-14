---
name: orchestrate-claude
description: Coordinate Claude subagents from the current session with clear ownership and deliberate model selection.
disable-model-invocation: true
---

# Orchestrate Claude

Deliver the requested outcome with strong judgment and efficient execution. Lead from the current session, keeping your model and effort. Delegate where a subagent can make useful progress with clear ownership.

## Keep the judgment

You are responsible for the correctness and completeness of the final output, including the code and conclusions produced by subagents. Own the user's intent and decisions that cross workstreams. Let each subagent investigate, decide, implement, and validate within its assignment.

Keep a dependent chain of work with one agent when it fits in one context window. Delegate to gain useful parallel progress, keep bulky investigation out of your context, or assign focused evidence gathering to a cheaper model. Account for the work of briefing, reviewing, and integrating the result when deciding whether delegation helps.

Give each subagent a coherent outcome, including its implementation and tests. Preserve the context it needs to carry the work through completion.

## Pick the model

The main coordinator may choose any available model suited to the assignment, including a more capable model than itself. A delegated coordinator works within the model choices and delegation authority its parent gives it.

Prefer Opus for code, implementation, and work that draws conclusions, even when Sonnet could complete the assignment. This is a preference for stronger judgment over the lowest model cost.

Choose each subagent's model and effort explicitly using these defaults:

| `model`  | `effort` | Assign |
| -------- | -------- | ------ |
| `opus`   | `high`   | The default for implementation, debugging, refactoring, review, and research that requires synthesis or conclusions. It can own local design and lead a workstream through validation. |
| `sonnet` | `high`   | Find, read, and organize sources. Return evidence and source summaries, leaving synthesis and conclusions to the coordinator or an Opus subagent. |
| `haiku`  | `xhigh`  | Focused search, extraction, lists, and classifications with straightforward checks. |
| `fable`  | `medium` | Rarely. A specifically justified difficult investigation or another perspective on a consequential question. |

Search directly when you already know the file or symbol. Haiku suits finding call sites or extracting facts. Assign interpretation of an undocumented lifecycle to Opus even when every action is a read.

## Write the brief

Explain how the assignment contributes to the overall outcome, what must remain true, and what evidence will establish completion. Give the subagent enough context to act independently, including settled decisions, relevant sources, the files it may change, and applicable instructions from this conversation. Leave the approach to the subagent within those boundaries.

Ask for findings with supporting evidence: a file path with a line number, a short quote, or a command result. Preserve the details that could change your decision, and keep the original sources accessible for review.

Subagents should usually complete their assignments themselves. Grant further delegation when independent work can make useful parallel progress or a separate examination would improve confidence. Keep tightly coupled work with the agent that already understands it.

Give Sonnet and Haiku subagents assignments to complete themselves. When a subagent leads a workstream that benefits from further delegation, grant that authority explicitly and name the models it may use. Give it this skill. Its ownership includes collecting, reviewing, and integrating its subagents' results into the assigned outcome.

For parallel edits in a shared checkout, give each subagent its own files. Settle shared interfaces before assigning the code that uses them, and sequence edits to the same files. Keep changes that must be designed and validated together under one owner through integration.

Assign a clear owner to shared processes and environments. Transfer that ownership explicitly when work moves between subagents.

## Coordinate through completion

While subagents run, advance other parts of the task, review returned work, or settle open decisions. Continue with the same subagent when its accumulated context helps.

Base your confidence in subagent work on actual verification: inspect the diff, check claims against source evidence, and validate behavior with relevant checks. Use a separate review when a fresh examination could change an important conclusion. Judge the combined result against the full requested scope. Verify that the pieces work together, and make clear what the evidence covers, what remains unverified, and which review findings remain unresolved.

Finish when the requested outcome is delivered, validation has run, and you have reviewed or explicitly excluded every subagent result.
