---
name: orchestrate-claude
description: Coordinate Opus, Sonnet, and Haiku subagents from a Fable session. Each assignment goes to the cheapest model that does it well.
disable-model-invocation: true
---

# Orchestrate Claude

Lead the current task as the coordinator and assign execution to subagents on cheaper models. This skill runs from a Fable session. Keep your current model and effort, and apply this workflow until the user changes direction.

## Keep the judgment

Own the requirements, ambiguous decisions, architecture, root-cause reasoning, and final review. Assign work once you can state its outcome and constraints. The subagent must be able to finish it without this conversation.

Every subagent starts cold and returns a summary that loses detail. Do the work yourself, or assign it to one subagent, when it is a single dependent chain that fits in one context window. Fan out when the work splits into independent pieces, or when reading the material would flood your context.

Assign a feature and its tests to one subagent. A split between planning, implementation, testing, and review loses context at every handoff.

## Pick the model

A subagent inherits your model unless the Agent call names one. An Agent call without `model` from this session runs on Fable. Pass `model` on every Agent call, and pass `effort` where the table sets one.

| `model`  | `effort` | Assign                                                                                                                                             |
| -------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `opus`   | omit     | A workstream that needs judgment: a feature with its tests, a hard bug, a refactor across modules. It can lead its own Sonnet and Haiku subagents. |
| `sonnet` | `high`   | Implementation against a settled design, mechanical edits across files, test runs and fixes, reading and condensing sources.                       |
| `haiku`  | `xhigh`  | Narrow lookups: codebase search, facts from logs or documents, lists and classifications. Keep design choices with a stronger model.               |
| `fable`  | omit     | An independent second opinion on a decision you cannot settle alone.                                                                               |

Omit `effort` for Opus and Fable so they run at the configured default. If an assignment fits two models, pick the stronger one. A failed attempt and its retry cost more than the price difference.

For a broad search across many files, call the `Explore` agent with `model: "haiku"`. Search directly when you already know the file or symbol. In a Fable session, `Explore` runs on Opus unless the call names a model.

## Write the brief

Make each brief self-contained. State the result you need, the decisions already made, the files or sources in scope, the files the subagent may change, and how to establish completion. Include each instruction from this conversation that the subagent cannot find in the repository.

Ask for each conclusion with its evidence: a file path with a line number, a short quote, or a command result. A cheap reader can summarize away the detail that mattered, and the citation lets you check the source. Keep quotes to the lines that support the conclusion.

Tell Sonnet and Haiku subagents to do the assignment themselves and spawn no subagents of their own. When an Opus subagent leads a workstream, tell it to fan out the independent pieces to subagents of its own. A subagent's default prompt tells it to do the work itself, so the brief must grant this. Copy the model table and the brief rules into its brief, and name the models it may spawn.

For parallel edits, give each subagent its own files. Settle shared interfaces before you assign the code that uses them. Subagents share the working directory, so run assignments that change the same files one after another.

## Coordinate through completion

While subagents run, plan the next assignment, review returned work, or settle open decisions. Steer a running or finished subagent with `SendMessage` instead of spawning a replacement.

Read the actual diff and evidence from each subagent. Send corrections back as new assignments with the same brief rules.

Finish when the requested outcome is delivered, validation has run, and you have reviewed or explicitly excluded every subagent result.
