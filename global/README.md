# Global instructions

[`AGENTS.md`](./AGENTS.md) is Adi's global user instruction file. It is the same content every agent should load on every project, and it lives here so all machines can share one copy.

It is not this repo's own instruction file. Nothing in it is specific to working on the skills collection, and keeping it out of the repo root leaves that spot free for real repo-specific instructions later.

## Installing it

Two harnesses read it, each from its own path:

| Harness     | Path                  |
| ----------- | --------------------- |
| Codex       | `~/.codex/AGENTS.md`  |
| Claude Code | `~/.claude/CLAUDE.md` |

Copy the file to both. Do not symlink. The installed copies have to keep working after this repo is deleted, moved, or never cloned again on that machine, and a symlink would leave both harnesses pointing at nothing.

```bash
mkdir -p ~/.codex ~/.claude
cp global/AGENTS.md ~/.codex/AGENTS.md
cp global/AGENTS.md ~/.claude/CLAUDE.md
```

## Updating an existing install

Copies drift, so check before overwriting. Both destinations may have been edited in place, and an edit made on a machine is worth keeping.

```bash
diff global/AGENTS.md ~/.codex/AGENTS.md
diff global/AGENTS.md ~/.claude/CLAUDE.md
```

What the result means:

- **No output from both.** Everything is current. Nothing to do.
- **Only the repo has changed.** Copy over the installed files.
- **An installed file has changes the repo lacks.** The machine is ahead. Bring those edits into `global/AGENTS.md` and commit them, then copy back out so both harnesses match.
- **Both sides changed.** Reconcile by hand into `global/AGENTS.md`, then copy out. Do not overwrite either side blind.

The two installed paths can also differ from each other, since nothing keeps them in step. Diff both separately rather than checking one and assuming the other matches.

## Verifying

```bash
shasum -a 256 global/AGENTS.md ~/.codex/AGENTS.md ~/.claude/CLAUDE.md
```

Three matching hashes means the machine is in sync with the repo.
