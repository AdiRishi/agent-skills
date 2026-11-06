# Decisions

These are the choices that shaped this repository, newest first. Each entry says what changed and why.

## An agent updates copied skills (November 2026)

The setup command used to update copied skills with a three-way Git merge between the old upstream, the new upstream, and the local copy. Some local edits are too large for a merge to keep. The `pr-writing` copy, for example, rebuilds the upstream skill into three sections. The merge tooling and its license records are gone. Each copied skill now records its upstream folder at a commit and a plain description of the local edits. The [`update-skills`](../.claude/skills/update-skills/SKILL.md) skill tells an agent how to bring in upstream changes and keep the intent of those edits.

## Skills install by copy (November 2026)

`apply` used to run the `skills` installer and then copy every skill over the installer's output, because the installer put Cursor installs in the shared `~/.agents/skills` directory. Now the copy is the only install step, and each harness gets its own directory. A `.dotagents` marker in each installed skill replaces the state file that tracked which directories `apply` owned.

## Pushes wait until related work is complete (October 2026)

A push to an open pull request can start a paid review. Agents keep related commits local and push them together when the current task or set of feedback is done.

## orchestrate-claude picks a model for every subagent (October 2026)

A subagent inherits the session model unless the call names one, so the skill names a model and effort on every call. Opus is the default for implementation and for any conclusion. Fable takes only rare, narrow questions that are too hard to reason through, or a second opinion on a decision the coordinator cannot settle. A subagent's default prompt tells it to do the work itself, so a subagent that leads a workstream gets explicit permission to delegate.

## The Codex delegate skill is gone (October 2026)

`orchestrate-claude` replaced it for Claude Code, and the Codex workflow it supported is no longer in use.

## Claude Code no longer delegates to Codex (September 2026)

The `invoke-codex` skill and the Codex MCP server it required are gone.

## TWG is not bundled (September 2026)

TWG ships as twelve skills. Bundling them as one skill with companion files under `references/` did not work, because the harnesses still loaded each nested `SKILL.md` as a separate skill.

## The research skill is gone (August 2026)

It did not earn its place in day-to-day work.
