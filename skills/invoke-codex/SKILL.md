---
name: invoke-codex
description: Invoke GPT-5.6 Sol through the Codex MCP server as a general-purpose delegated agent working on Claude's behalf. Use proactively when Codex could execute, inspect, review, verify, debug, research, challenge an approach, generate or edit images, or handle any bounded task or workflow. Use high reasoning by default and low only for unmistakably simple work.
allowed-tools:
  - mcp__codex__codex
  - mcp__codex__codex-reply
---

# Invoke Codex

Treat Codex as a capable delegated agent operating on behalf of the current Claude session. Do not assume a fixed relationship such as planner, executor, or reviewer. Choose Codex's role for each invocation and tell it directly what to do.

Use Codex proactively when another agent can add meaningful execution capacity, independent judgment, verification, or specialized capability. Do not delegate trivial work whose handoff costs more than doing it directly.

## Preserve authority

Delegate only actions already authorized by the user's request. Delegation does not expand Claude's authority.

Never ask Codex to create commits, push changes, amend commits, rebase, or otherwise rewrite Git history. Preserve unrelated user work.

Use `read-only` when Codex should inspect, advise, critique, investigate, or verify without changing files. Use `workspace-write` when Codex should act in the project. Use `danger-full-access` only when the user explicitly authorized the broader action and the environment is appropriately isolated.

Prefer `approval-policy: never` so Codex completes within its sandbox or returns a clear blocker instead of pausing a nested workflow for approval.

## Start a delegated task

Call the Codex MCP server's `codex` tool. Pass the current project root as `cwd`.

Give Codex a self-contained work order. Include only the fields that materially improve the handoff:

- **Role**: the capacity Codex should assume
- **Goal**: the user-visible outcome, stated as a direct objective
- **Success criteria**: what must be true before Codex finishes
- **Context**: facts and file paths Codex cannot infer reliably
- **Scope**: what Codex may inspect or change
- **Constraints**: invariants, exclusions, permissions, and user requirements
- **Tools**: required capabilities or routing rules when the method matters
- **Output**: the result, evidence, and response shape Claude needs
- **Stop rules**: when to ask, retry, report a blocker, or stop

Be explicit about action. If Codex should implement, modify, run, or generate something, say so directly. If Codex should only advise or review, say not to modify the workspace.

Do not overconstrain the method unless the method matters. Give Codex room to use its own judgment inside the work order.

Pass these `developer-instructions` on every new Codex thread:

```text
You are Codex, a delegated agent acting on behalf of the calling agent. Treat the task prompt as your work order and complete it directly within the stated scope and authority.

For requests to answer, explain, review, diagnose, research, or plan, inspect the relevant materials and report the result. Do not change files unless the work order requests changes.

For requests to change, build, fix, generate, or otherwise act, perform the requested in-scope work and relevant non-destructive validation without asking first. Use your judgment on the method unless it is constrained. Do not substitute advice for requested action.

Stop before external writes, destructive actions, purchases, credential changes, or material scope expansion unless the work order explicitly authorizes them. If essential information or authority is missing, ask for the smallest missing item or return a precise blocker.

Preserve unrelated work. Never create commits, push changes, amend commits, rebase, or rewrite Git history.

Finish only when the success criteria are met or a blocker prevents completion. Return the outcome, changed or created artifacts, validation evidence, material assumptions, and blockers.
```

Do not replace Codex's `base-instructions`.

## Choose model and reasoning

Always invoke Codex with `model: "gpt-5.6-sol"`. Do not inherit the configured default or select another model.

Always pass one of these two reasoning settings:

```json
{
  "model": "gpt-5.6-sol",
  "config": {
    "model_reasoning_effort": "high"
  }
}
```

Use `high` by default. Use `low` only when the entire task is very simple, bounded, mechanical, unambiguous, low-risk, and easy to verify—for example, locating a known file or making one obvious formatting change. If any criterion is uncertain, use `high`.

Do not use any other reasoning level, and do not omit the setting because GPT-5.6 otherwise defaults to a different level. Start a new Codex thread if the reasoning level must change.

## Continue the same task

Save the returned `threadId`. Use the Codex MCP server's `codex-reply` tool for corrections, refinements, failed verification, follow-up execution, or questions that belong to the same work order.

Start a new thread for an independent opinion, a materially different task, or a different model or reasoning configuration.

## Integrate the result

Treat Codex's final response as a report, not proof.

Inspect relevant diffs, files, artifacts, commands, and verification results before relying on them. Use `codex-reply` to address defects or missing evidence. Distinguish what Codex reported from what Claude independently verified.

Ask Codex to return, when applicable:

- completion status
- actions performed
- files or artifacts created or changed
- verification performed and results
- assumptions made
- blockers or unresolved issues

Claude remains responsible for interpreting the result, deciding next steps, and communicating with the user.

## Image generation

For any request to generate or edit raster images, UI artwork, illustrations, textures, sprites, mockups, banners, backgrounds, or other visual assets, read `${CLAUDE_SKILL_DIR}/references/image-generation.md` before invoking Codex.
