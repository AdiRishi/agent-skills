<p align="center">
  <img src="docs/assets/agent-skills-icon-128.png" width="96" alt="Agent Skills">
</p>

# Agent skills

Every agent skill I use, in one repository, with each one credited to whoever wrote it.

## Why this exists

I install skills with [`npx skills`](https://skills.sh), and the part it gets right is bookkeeping. It hashes each skill folder and records the repo, ref, and path it came from, so it knows when an installed copy has drifted from its source.

What it does not fix is fragmentation. My skills come from several repos on different release cadences, and getting a new machine to match an old one meant replaying install commands in the right order and trusting my memory for the list. The lock file that makes any single skill trackable lives in `~/.agents/.skill-lock.json`, which is per-machine state. It cannot be committed and shared.

So this repo becomes the one upstream. Skills are collected here, attributed, and installed from a single source. Syncing a machine is one command, and updating a borrowed skill is a job I can hand to an agent.

## Status

Early. The structure below is the target. Skills are still being pulled in, so expect the tree to fill out before the install commands are worth running.

## Install

```bash
npx skills@latest add AdiRishi/agent-skills
```

The installer asks which skills to take and which agents to install them on. It writes to `~/.agents/skills/` and symlinks into each agent's directory, so Claude Code, Codex, Cursor, and the rest share one copy on disk.

To pull later changes:

```bash
npx skills@latest update
```

A `.claude-plugin/` manifest is planned so the set can also be installed as a Claude Code plugin. That route is read-only and updates on `git pull`, which suits machines I do not want to hand-edit skills on.

## Layout

```
skills/
  <category>/
    <skill-name>/
      SKILL.md              # the skill itself, plus Claude Code frontmatter
      agents/openai.yaml    # Codex metadata
      *.md                  # supporting references the skill links to
global/
  AGENTS.md                 # global user instructions, shared by every harness
  README.md                 # how to install them on a machine
attribution.json            # where every skill came from
.claude-plugin/
  plugin.json               # the skills this repo ships as a plugin
  marketplace.json          # makes the repo its own single-plugin marketplace
docs/assets/                # icon
```

Both reference repos nest skills under category folders and `npx skills` walks the tree recursively, so categories cost nothing at install time. They earn their keep as a staging area: a skill can live here without being listed in `plugin.json`, which keeps half-finished work out of the shipped set.

## Global instructions

Skills are half the setup. The other half is the global instruction file every agent loads on every project, which lives in [`global/AGENTS.md`](./global/AGENTS.md).

Codex reads it from `~/.codex/AGENTS.md` and Claude Code from `~/.claude/CLAUDE.md`. Before it lived here those were two independent copies of the same 7406 bytes, with nothing to catch a divergence. [`global/README.md`](./global/README.md) has the install steps, which symlink both paths at the one file.

## How a skill is built

Claude Code and Codex read different files, so a skill that works properly in both carries two pieces of metadata.

Claude Code reads YAML frontmatter at the top of `SKILL.md`:

```yaml
---
name: unslop
description: Cut AI tells from any writing. Must always apply.
disable-model-invocation: true # optional, see below
---
```

Codex reads `agents/openai.yaml` beside it:

```yaml
interface:
  display_name: "Unslop"
  short_description: "Cut AI tells from any writing"
policy:
  allow_implicit_invocation: false # optional, see below
```

The one axis that matters is who can invoke a skill. A model-invoked skill fires on its own when the description matches what is happening, so its `description` carries trigger phrasing. A user-invoked skill runs only when I type its name, which takes `disable-model-invocation: true` in the frontmatter and `policy.allow_implicit_invocation: false` in the YAML. Those two settings are one decision expressed twice. A skill is user-invoked in both harnesses or in neither.

## Attribution

Most of these skills are not mine. `attribution.json` records where each one came from, and it is the file an agent reads when I ask it to update everything.

```json
{
  "skills": {
    "unslop": {
      "origin": "vendored",
      "author": "Lauren Tan",
      "license": "MIT",
      "repo": "https://github.com/cursor/plugins",
      "path": "pstack/skills/unslop",
      "ref": "main",
      "vendoredFrom": "a1b2c3d4e5f6...",
      "modified": false
    }
  }
}
```

`origin` is `vendored` for anything copied from elsewhere and `original` for skills I wrote, which carry no `repo`, `path`, `ref`, or `vendoredFrom`.

`vendoredFrom` is the field that makes updates precise. It pins the exact upstream commit a skill was copied at, so an agent can ask what changed in that path between then and now instead of blindly overwriting. `modified` says whether my copy is still byte-identical to upstream at that commit.

Keeping vendored skills unmodified is worth the discipline. Once a local edit lands, a plain diff against upstream can no longer separate my change from theirs, and every future update becomes a judgment call.

## Updating

The workflow this is built for is telling an agent to go update my skills. For each entry in `attribution.json` where `origin` is `vendored`:

1. Fetch the upstream repo at `ref` and read the current commit for `path`.
2. If it matches `vendoredFrom`, the skill is current. Move on.
3. If `modified` is `false`, copy the new version in and update `vendoredFrom`.
4. If `modified` is `true`, three-way merge: upstream at `vendoredFrom`, upstream now, and my copy. Clean merges apply. Conflicts stop and ask.

Step 4 is the default I want, and it is the only step with a real choice in it. The alternatives are always discarding my edits or always keeping them, and both throw away information the merge can use.

After any skill is added, renamed, or removed, `.claude-plugin/plugin.json` needs the same change. The plugin ships exactly what that array lists.

## Sources

- [cursor/plugins](https://github.com/cursor/plugins/tree/main/pstack/skills) (pstack), by Lauren Tan, MIT
- [mattpocock/skills](https://github.com/mattpocock/skills), by Matt Pocock, MIT

Both are worth reading in full. Skills taken from them keep their attribution in `attribution.json`, and their MIT terms travel with the files.

## License

MIT, for the skills I wrote. Vendored skills stay under their original licenses, recorded per skill in `attribution.json`.
