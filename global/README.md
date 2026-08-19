# Global instructions

[`AGENTS.md`](./AGENTS.md) is Adi's global user instruction file. It is the same content every agent should load on every project, and it lives here so all machines can share one copy.

It is not this repo's own instruction file. Nothing in it is specific to working on the skills collection, and keeping it out of the repo root leaves that spot free for real repo-specific instructions later.

## Installing it

Two harnesses read it, each from its own path:

| Harness     | Path                 |
| ----------- | -------------------- |
| Codex       | `~/.codex/AGENTS.md` |
| Claude Code | `~/.claude/CLAUDE.md` |

Symlink both to this file rather than copying it:

```bash
REPO="$(git rev-parse --show-toplevel)"
mkdir -p ~/.codex ~/.claude
ln -sfn "$REPO/global/AGENTS.md" ~/.codex/AGENTS.md
ln -sfn "$REPO/global/AGENTS.md" ~/.claude/CLAUDE.md
```

Symlinks are what make this worth doing. Copies drift, and drift is the problem this repo exists to solve. Both paths held identical copies before this file existed, and nothing would have caught it if one had been edited. With symlinks, `git pull` updates both harnesses at once, and an edit made through either path lands in the repo as an uncommitted change you can review and commit.

`npx skills` already installs this way, symlinking each agent's skill directory to one folder under `~/.agents/skills/`. This matches that.

## If a path is already a real file

`ln -sfn` will overwrite it without asking. Check first, because an existing file may hold edits that were never committed here:

```bash
diff ~/.claude/CLAUDE.md global/AGENTS.md
```

If it differs, the local copy is ahead. Bring the changes into `global/AGENTS.md`, commit them, and then symlink.

## Verifying

```bash
ls -l ~/.codex/AGENTS.md ~/.claude/CLAUDE.md
```

Both should print as symlinks pointing into this repo. If either shows as a regular file, something replaced the link. Editing through a harness UI that rewrites the file in place can do this, so re-check after any tool edits your global memory.
