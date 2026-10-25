---
name: claude-code-review
description: Delegate a Claude Code review, validate which findings deserve changes, and fix the accepted findings.
disable-model-invocation: true
---

# Claude Code review

Keep the main conversation responsible for intent and judgment. Delegate the full review to a subagent, validate its findings, then delegate the accepted fixes.

## Brief the reviewer

Review the current task's committed and uncommitted changes, including relevant untracked files. Resolve the scope from the conversation and repository. Identify the base revision and included files before dispatch. Ask only when the conversation and repository leave materially different scopes possible.

Give one general-purpose subagent the scope, repository path, applicable instructions, and the purpose of the change. Include deliberate breaking changes, removed behavior, and decisions already settled with the user. Keep unknown requirements explicit.

Instruct the subagent to invoke Claude Code's built-in `code-review` skill with `high` effort and the resolved target. Use the Skill tool, not a shell command or a similarly named plugin. Run the complete review without `--fix` or `--comment`. Keep the review read-only and return findings to the main conversation. If the built-in skill is unavailable, report that blocker rather than substitute another review.

Have the reviewer perform every review and verification step itself, sequentially. Do not launch nested subagents, even if the built-in workflow requests them.

Wait for the completed review. Require each finding's location, claimed defect or maintenance cost, and supporting evidence. An interrupted or partial review is unfinished work, not a clean result.

## Decide what deserves a fix

Read [TRIAGE.md](TRIAGE.md) and assess every returned finding against the code and the user's intent. Treat the review's confidence and severity as claims to check.

Inspect the relevant callers, guards, contracts, and tests before accepting a finding. For a rejected finding, cite the evidence or requirement that defeats it. If a focused investigation would settle an uncertain claim, delegate that investigation before deciding.

Finish with a disposition and a short reason for every finding. Fix accepted findings without another approval round. Ask the user only about unresolved requirements that change the decision, and continue with independent accepted fixes.

## Delegate the fixes

If any findings qualify, give a second general-purpose subagent the accepted findings, supporting evidence, intended behavior, and files it may change. Keep rejected findings out of its assignment.

Have the fixer make the smallest complete correction and run the relevant checks. Add a regression test when it protects meaningful behavior, and name the failure it catches. Preserve unrelated work. If the code disproves a finding or the fix requires a new product decision, return the evidence to the main conversation before expanding the change.

Inspect the resulting diff and validation results. Confirm that each accepted finding is resolved and that the changes preserve the intended behavior. If the reviewed code changed in the meantime, revalidate affected findings against the current version.

## Report the result

Summarize what changed and how it was checked. State which findings were left alone and why, and identify unresolved findings or questions. If no finding deserves a fix, say so and leave the code unchanged.
