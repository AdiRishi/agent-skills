# Working in this repo

This repo holds agent skills collected from several upstreams, plus the global instruction file every agent loads. It is the one source a machine installs from.

## Layout

```
skills/<name>/SKILL.md    the skill, with Claude Code frontmatter
skills/<name>/agents/openai.yaml    Codex metadata, when the skill has it
global/AGENTS.md          the global instruction file, installed to two paths
attribution.json          where each skill came from
```

`skills/` is flat. Skill names are unique across the set, because the name is what an agent invokes.

## Vendored skills stay byte-identical

Copy each upstream skill in unchanged. A byte-identical copy lets a later diff separate an upstream change from a local edit. Once you edit a vendored file, every future update becomes a merge you have to judge by hand.

To change a vendored skill, set its `modified` field to `true` in `attribution.json` in the same commit.

## attribution.json

One entry per folder in `skills/`. Every entry carries `origin`, `author`, and `license`.

Entries with `origin: "vendored"` add four fields:

- `repo` and `path` locate the skill upstream.
- `ref` is the branch to check for changes.
- `vendoredFrom` is the upstream commit the copy was taken at.
- `modified` says whether the local copy still matches upstream at that commit.

Entries with `origin: "original"` carry none of the four. Adi wrote them.

`vendoredFrom` is what makes an update precise. It lets you ask what changed in `path` between that commit and now, instead of overwriting and hoping.

## Add a vendored skill

1. Clone the upstream repo and record its `HEAD` commit.
2. Copy the skill folder to `skills/<name>/`.
3. Run `diff -r <upstream-folder> skills/<name>` and confirm it prints nothing.
4. Add the entry to `attribution.json` with `modified: false`.
5. Add a row to the skills table in `README.md`.

Done when the diff is empty and every folder in `skills/` has an `attribution.json` entry.

## Update vendored skills

Run this when Adi asks you to update the skills. For each entry with `origin: "vendored"`:

1. Fetch the upstream repo at `ref`.
2. Compare the current commit for `path` against `vendoredFrom`. If they match, the skill is current. Move to the next entry.
3. If `modified` is `false`, copy the new version in. Update `vendoredFrom`.
4. If `modified` is `true`, merge three ways: upstream at `vendoredFrom`, upstream now, and the local copy. Apply clean merges. Stop and ask about conflicts.

Update the `README.md` row when a skill's description changes upstream.

Done when every vendored entry either matches its upstream commit or has a conflict you raised.

## Sync the global instruction file

Codex reads `~/.codex/AGENTS.md`. Claude Code reads `~/.claude/CLAUDE.md`. Install `global/AGENTS.md` by copying it to both paths.

Copy it. Do not symlink it. The installed files have to keep working on a machine where this repo is deleted, moved, or never cloned.

Both destinations drift independently, so diff each one before you overwrite anything:

```bash
diff global/AGENTS.md ~/.codex/AGENTS.md
diff global/AGENTS.md ~/.claude/CLAUDE.md
```

Act on what the diffs show:

- If both print nothing, the machine is current.
- If only the repo changed, copy `global/AGENTS.md` to both paths.
- If a destination holds edits the repo lacks, bring them into `global/AGENTS.md` first. Commit them. Then copy back out.
- If both sides changed, reconcile them into `global/AGENTS.md` by hand. Then copy out.

Confirm with `shasum -a 256 global/AGENTS.md ~/.codex/AGENTS.md ~/.claude/CLAUDE.md`. Done when all three hashes match.

## Install on a new machine

```bash
npx skills@latest add AdiRishi/agent-skills
```

Then follow **Sync the global instruction file** above.

## Writing

Apply the `technical-writing` and `unslop` skills to every document here, including commit messages and PR descriptions.
