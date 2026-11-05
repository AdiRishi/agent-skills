---
name: pr-writing
description: Use whenever writing or updating a pull request description.
---

# PR writing

A reviewer spends most of their time picturing what the author already saw: the page they opened, the command they ran, the test that went green. Put that in the description. Prose that describes a change is a claim, not evidence.

## 1. Open with the problem

Open the description with a simple explanation of the problem based on the
user's original prompt, then briefly explain the solution. Do not lead with an
implementation inventory:

BAD

> ❌ Removed implicit workspace carry-over from every "new thread" entry point (cmd+n / cmd+shift+o, sidebar v1/v2 buttons, command palette). New threads inherit only the project from context; branch, worktree, and env mode always come from the configured defaults. Deleted buildContextualThreadOptions, startNewThreadInProjectFromContext, and the v1 sidebar's seed-context machinery.

GOOD

> ✅ My "new worktree" default was ignored when starting new threads on existing worktrees. Super unintuitive. Now your preferences always apply.

Keep the opening short and easy to read. Put technical details in the details section.

## 2. Add details that help the review

After the opening, explain what the reviewer needs to know beyond the problem and solution. Group related changes by behavior or area, not by file or commit.

Include details that explain a non-obvious implementation decision, affect compatibility or deployment, or identify a limitation. Describe the consequence for the reviewer, rather than listing code changes:

BAD

> X Added a status column, updated the job queries, regenerated the schema, and changed the worker.

GOOD

> ✅ Existing jobs start with a pending status. Deploy the migration before the new worker. Older workers ignore the new column, so they can continue running during deployment.

Use a short paragraph for one concern. Use bullets or subheadings when several concerns need separate explanations. Omit this section if the opening and evidence already give the reviewer enough context.

Keep technical explanations here. The opening must remain a simple explanation of the problem and solution.

## 3. Show it, with evidence that fits the change

| Change | Evidence |
|---|---|
| UI | Before and after screenshots of the same element, same viewport and crop. A short video for motion, hover, or a multi-step flow. A phone width when layout is involved. |
| CLI or build | The real output of the same command before and after, exit code included. Never retype or tidy it. |
| Bug fix | The input and the result before and after, and the regression test that failed first. |
| Performance | What you measured and how (machine, runs, inputs), the numbers on both sides, and how much they vary between runs. |
| AI or agent behaviour | The same set of real prompts on both sides, how answers were graded, time and cost per answer, and where the grading is unreliable. |
| New API or feature | The code someone would write to use it. A pure addition has no "before": show it on its own. |
| Anything else | A small table, a diagram, or an HTML page comparing both versions. |
