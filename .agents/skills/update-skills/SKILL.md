---
name: update-skills
description: Update the skills this repository copied from other repositories to their latest upstream versions. Use when asked to update, refresh, or sync skills.
---

# Update skills

A copied skill is an entry in [`dotagents.config.ts`](../../../dotagents.config.ts) with an `upstream` URL. The URL names the upstream repository, the commit the copy came from, and the folder:

```text
https://github.com/<owner>/<repo>/tree/<commit>/<path>
```

`changes` describes every edit this repository made to that copy. An update brings in the new upstream version and keeps those edits.

## Steps

1. **Choose the skills.** Update the skills Adi names, or every skill with an `upstream` URL. Run `pnpm check` and confirm `git status` shows no changes under `skills/` or in `dotagents.config.ts`.

2. **Fetch each upstream repository once.** Clone it into a temporary directory with `git clone --filter=blob:none <repository>`. Skills from the same repository share the clone.

3. **Find what changed upstream.** For each skill, run `git diff <commit> HEAD -- <path>` in the clone. An empty diff means the skill is current; record that result and move on.

4. **Bring in the upstream changes.**
   - Without `changes`, replace `skills/<name>/` with the upstream folder at `HEAD`, including deleted files.
   - With `changes`, apply the upstream diff to the local copy and keep each local edit `changes` describes. When upstream rewrote text that a local edit touched, apply the edit's intent to the new text.

   The step is done when `skills/<name>/` matches upstream `HEAD` except for the edits `changes` describes.

5. **Stop on a conflict.** When upstream moved or deleted the folder, or a local edit's intent no longer fits the new text, leave that skill unchanged and ask Adi. Continue with the other skills.

6. **Record the new version.** Replace the commit in each updated skill's `upstream` URL with the upstream `HEAD` commit. Rewrite `changes` when the local edits changed.

7. **Verify.** Run `pnpm check`, `pnpm typecheck`, and `pnpm test`, and fix any failure.

8. **Commit per upstream repository**, for example `chore: update pstack skills to 4382e68`. List the updated skills and the upstream changes that alter their behavior in the body.

## Report

List every skill from step 1 with one result: current, updated from one commit to another, or waiting on Adi with the reason.
