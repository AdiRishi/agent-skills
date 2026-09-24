---
name: delegate
description: Coordinate GPT-5.6 Sol subagents for execution while keeping planning and judgment with the current agent.
disable-model-invocation: true
---

# Delegate

Lead the current task using GPT-5.6 Sol workers. Keep your current model and reasoning effort. The user invoking this skill explicitly requests delegation through Codex's collaboration tools. Apply this workflow to the requested task until the user changes direction.

## Keep the decisions, delegate the execution

Own the requirements, design, difficult reasoning, and final judgment. Use Sol for implementation, mechanical edits, test execution, and focused evidence gathering. Delegate once you can describe the outcome and constraints well enough for a worker to proceed independently. Workers should have room to make ordinary implementation choices within that scope.

Actively look for useful execution work to delegate as the task develops. Choose assignments that can run alongside your own planning, investigation, or review and would improve speed or quality. Keep tightly coupled reasoning local. A small task or a shared resource may make coordination more expensive than doing the work yourself.

For parallel edits, give each worker clear file ownership and settle shared interfaces before assigning their consumers. Agents share the working directory and filesystem. Sequence work that would otherwise compete for the same files or mutable resources.

## Give Sol a bounded assignment

Use the live `spawn_agent` definition. Select `model: "gpt-5.6-sol"` explicitly and use `fork_turns: "none"` with a self-contained message. Full-history forks, including the default when `fork_turns` is omitted, inherit the parent model and reject model or effort overrides.

Set `reasoning_effort` for the assignment: `low` for straightforward work, `medium` for ordinary implementation, and `high` when the worker must trace complex logic or check difficult edge cases. Follow a user-specified worker effort when provided. If the harness cannot select Sol, report the limitation rather than silently substituting another model.

A useful assignment states the required result, relevant decisions and context, permitted edits, and how to establish completion. Pass applicable instructions that a fresh worker cannot discover in the workspace. Specify whether the worker should change files or return findings.

Ask workers to return concise results with changed-file or evidence references, validation results, and unresolved questions. Have them bring scope changes, design blockers, and requests for further delegation back to you.

## Coordinate through completion

While a worker runs, advance other parts of the task. Avoid repeating its assignment yourself. Use `send_message` to steer active work and `followup_task` to reuse a worker for related work or corrections. Use the other collaboration tools as needed to inspect progress, wait for a required result, or interrupt obsolete work.

Evaluate the returned evidence and actual changes against the user's requirements. Resolve conflicting findings and design questions yourself, then send bounded execution work back to Sol. Keep intermediate logs with the workers and bring the decisions and results into the main conversation.

Finish when the requested outcome is delivered, required validation is accounted for, and outstanding worker results have been reviewed or explicitly excluded from the result. Report remaining blockers accurately.
