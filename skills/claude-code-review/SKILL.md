---
name: claude-code-review
description: Review the current change, validate which findings deserve a fix, and apply the accepted fixes.
disable-model-invocation: true
---

# Claude Code review

Review the current change with Claude Code's built-in `code-review` skill at `high` effort. Judge the findings against the code and the user's intent before making changes. Complete the review, triage, and accepted fixes in one workflow.

## Establish the scope and intent

Review the current task's committed and uncommitted changes, including relevant untracked files. Resolve the scope from the conversation and repository. Identify the base revision and included files. Ask only when the available context leaves materially different scopes possible.

Establish what the change must accomplish, what it deliberately breaks or removes, and what is out of scope. Use the conversation, requirements, and repository evidence. Keep unsettled requirements explicit, and carry this context into triage.

## Run the review

Invoke the built-in `code-review` through the Skill tool with `high` effort and the resolved target. Omit `--fix` and `--comment` so findings are assessed before any code changes or publication. If the built-in skill is unavailable, report that blocker.

Complete the review before triage. Each finding needs a location, a claimed defect or maintenance cost, and supporting evidence. An interrupted or partial review is unfinished work, not a clean result.

## Decide what deserves a fix

Read `${CLAUDE_SKILL_DIR}/TRIAGE.md` and apply its criteria to every finding. Treat the review's confidence and severity as claims to check.

Inspect the relevant callers, guards, contracts, and tests before accepting a finding. Investigate uncertain claims when the repository can settle them. Record a disposition and a short, evidence-backed reason for each finding.

Proceed with accepted fixes without another approval round. Ask the user only about unresolved requirements that change the decision, and continue with independent accepted fixes.

## Fix and verify

Delegate the accepted findings to a fixer with their evidence, intended behavior, and permitted scope. Have the fixer make the smallest complete correction, preserve unrelated work, and run the relevant checks. Add a regression test when it protects meaningful behavior, and name the failure it catches.

If implementation disproves a finding or reveals an unsettled requirement, reassess it before expanding the change. Inspect the resulting diff and check results. Confirm that each accepted finding is resolved and the intended behavior is preserved. Revalidate affected findings if the reviewed code has changed in the meantime.

## Report the result

Summarize what changed and how it was checked. State which findings were left alone and why, and identify unresolved findings or questions. If no finding deserves a fix, say so and leave the code unchanged.
