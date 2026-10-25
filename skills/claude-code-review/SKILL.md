---
name: claude-code-review
description: Run Claude Code's forked review, validate which findings deserve changes, and fix the accepted findings.
disable-model-invocation: true
---

# Claude Code review

Run the built-in review from the main conversation. Claude Code forks the review into its own context. Validate the returned findings in the main conversation, then delegate the accepted fixes.

## Run the review

Review the current task's committed and uncommitted changes, including relevant untracked files. Resolve the scope from the conversation and repository. Identify the base revision and included files before invocation. Ask only when the conversation and repository leave materially different scopes possible.

Prepare a short review brief with the scope, repository path, applicable instructions, and purpose of the change. Include deliberate breaking changes, removed behavior, and decisions already settled with the user. Keep unknown requirements explicit.

Invoke Claude Code's built-in `code-review` directly through the Skill tool. Do not launch an Agent to invoke it. Set `skill` to `code-review` and start `args` with `high`, followed by the resolved target and the review brief. Include the brief in `args`, because the fork receives that text but does not inherit the main conversation.

Include this instruction in the brief: "Complete every review and verification step yourself, sequentially. Do not launch subagents, even if the built-in workflow requests them. Keep the review read-only and return findings with their locations and supporting evidence."

Omit `--fix` and `--comment` from the invocation. If the built-in skill is unavailable, report that blocker rather than substitute another review.

Wait for the completed review. Require each finding's location, claimed defect or maintenance cost, and supporting evidence. An interrupted or partial review is unfinished work, not a clean result.

## Decide what deserves a fix

In the main conversation, use the Read tool to read `${CLAUDE_SKILL_DIR}/TRIAGE.md`. Apply its criteria to every returned finding against the code and the user's intent. Treat the review's confidence and severity as claims to check.

Inspect the relevant callers, guards, contracts, and tests before accepting a finding. For a rejected finding, cite the evidence or requirement that defeats it. If a focused investigation would settle an uncertain claim, delegate that investigation before deciding.

Finish with a disposition and a short reason for every finding. Fix accepted findings without another approval round. Ask the user only about unresolved requirements that change the decision, and continue with independent accepted fixes.

## Delegate the fixes

If any findings qualify, give one general-purpose subagent the accepted findings, supporting evidence, intended behavior, and files it may change. Keep rejected findings out of its assignment.

Have the fixer make the smallest complete correction and run the relevant checks. Add a regression test when it protects meaningful behavior, and name the failure it catches. Preserve unrelated work. If the code disproves a finding or the fix requires a new product decision, return the evidence to the main conversation before expanding the change.

Inspect the resulting diff and validation results. Confirm that each accepted finding is resolved and that the changes preserve the intended behavior. If the reviewed code changed in the meantime, revalidate affected findings against the current version.

## Report the result

Summarize what changed and how it was checked. State which findings were left alone and why, and identify unresolved findings or questions. If no finding deserves a fix, say so and leave the code unchanged.
