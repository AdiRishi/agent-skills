# Working in this repo

## Layout

Every skill is one folder directly under `skills/`, holding `SKILL.md` plus any files it links to. Keep the tree flat.

## Every skill carries metadata for the harnesses it installs to

Claude Code reads the YAML frontmatter in `SKILL.md`. Codex reads `agents/openai.yaml` beside it. A skill needs both, and upstreams vary in how much they ship.

A skill scoped to one harness is the exception. It needs metadata only for the harnesses in its `harnesses` list, so a Claude Code skill ships `SKILL.md` alone.

`agents/openai.yaml` holds the Codex picker entry:

```yaml
interface:
  display_name: "Technical Writing"
  short_description: "Write docs to a layered standard"
```

`short_description` runs 25 to 64 characters. Codex documents that bound.

Every skill here is model-invoked, so the agent fires it when the description matches and Adi can still invoke it by name. Keep it that way. When you vendor a skill carrying `disable-model-invocation: true`, drop that line and any `policy.allow_implicit_invocation: false` beside it. Record the edit under the vendoring rules below.

That pairing matters if a skill ever does need restricting. The two settings are one decision written twice, so write both or neither. With only the frontmatter, the model cannot reach the skill in Claude Code but still fires it in Codex.

## Vendored skills stay byte-identical

Copy upstream skills in unchanged. A byte-identical copy lets a later diff separate an upstream change from a local edit. Once you edit a vendored file, every future update becomes a merge you judge by hand.

Adding a file upstream does not have is the exception. Metadata an upstream omits, such as `agents/openai.yaml`, is worth adding. List each added file in the skill's `localFiles` and leave `modified` alone, so updates to the upstream files stay automatic.

When you change a file that also exists upstream, set `modified` to `true` in the same commit and write a `note` saying what changed. Read that `note` before you merge, so a later update does not undo the edit.

## attribution.json

Top-level `harnesses` lists the agent ids every skill installs to by default. Installing reads it, so add a harness there when Adi starts using one.

`skills` holds one entry per folder in `skills/`. Every entry carries `origin`, `author`, and `license`.

An entry may also carry `harnesses`, which replaces the default set for that skill. Leave it out unless the skill suits some harnesses and not others. `invoke-codex` has `["claude-code"]`, because a skill that drives Codex from Claude has nothing to do inside Codex.

Entries with `origin: "vendored"` add these:

- `repo` and `path` locate the skill upstream.
- `ref` is the branch to check for changes.
- `vendoredFrom` is the upstream commit the copy was taken at.
- `modified` says whether any file that also exists upstream was changed here.
- `note` says what the local edit was and how to treat it on merge. Required when `modified` is `true`.
- `localFiles` lists files added here that upstream does not have. Optional.

Entries with `origin: "original"` carry none of them. Adi wrote them.

## Add a vendored skill

1. Clone the upstream repo and record its `HEAD` commit.
2. Copy the skill folder to `skills/<name>/`.
3. Run `diff -r <upstream-folder> skills/<name>` and confirm it prints nothing.
4. Add the entry to `attribution.json` with `modified: false`.
5. Write `agents/openai.yaml` if upstream omitted it, and list it in `localFiles`. Skip this when `harnesses` leaves Codex out.
6. Read the skill for links and Skill tool calls reaching outside its folder. Vendor what it depends on, or tell Adi what is missing.
7. Add a row to the skills table in `README.md`, and add the skill to the install command that matches its harnesses.

Done when the diff covers every upstream file, the skill has metadata for each harness it installs to, and every folder in `skills/` has an `attribution.json` entry.

## Update vendored skills

Run this when Adi asks you to update the skills. For each entry with `origin: "vendored"`:

1. Fetch the upstream repo at `ref`.
2. Compare the current commit for `path` against `vendoredFrom`. If they match, the skill is current. Move to the next entry.
3. If `modified` is `false`, copy the new version in. Update `vendoredFrom`.
4. If `modified` is `true`, merge three ways: upstream at `vendoredFrom`, upstream now, and the local copy. Apply clean merges. Stop and ask about conflicts.
5. Restore anything in `localFiles` that the copy overwrote. If upstream has since added a file of its own at that path, take upstream's, drop the entry from `localFiles`, and tell Adi.

Update the `README.md` row when a skill's description changes upstream.

Done when every vendored entry either matches its upstream commit or has a conflict you raised.

## Install on a new machine

`npx skills` clones the repo from GitHub. Confirm the local checkout matches what it will fetch, because the next step copies `global/AGENTS.md` from the local tree:

```bash
git fetch origin && git rev-parse HEAD origin/main
```

Stop and tell Adi if the two hashes differ.

Install targets come from flags. `npx skills` reads nothing from this repo about them, so group the skills yourself and run one command per group. Take the groups from `attribution.json`: top-level `harnesses` is the default set, and a skill's own `harnesses` overrides it. Rebuild the lists from that file rather than copying them from here, so a new skill is never left out.

Each command needs `-g` to install for the whole machine instead of the current project, and `-y` to skip the prompts. `-s` and `-a` take space-separated lists and read until the next flag.

Skills on the default set:

```bash
npx skills@latest add AdiRishi/agent-skills -g -y \
  -s codebase-design technical-writing unslop writing-for-agents \
  -a claude-code codex
```

Then one command per group that overrides it:

```bash
npx skills@latest add AdiRishi/agent-skills -g -y -s invoke-codex -a claude-code
```

Skills on the default set land in `~/.agents/skills/`, which every harness reads, with a symlink from each agent's own directory. A skill scoped to one harness is copied straight into that harness's directory and never appears in `~/.agents/skills/`. That is what keeps `invoke-codex` out of Codex, so check it:

```bash
ls ~/.agents/skills ~/.claude/skills
```

Done when every skill in `attribution.json` appears under the harnesses its entry names, `invoke-codex` is absent from `~/.agents/skills/`, and the global instruction file is synced.

Then sync the global instruction file, below.

## Sync the global instruction file

Codex reads `~/.codex/AGENTS.md`. Claude Code reads `~/.claude/CLAUDE.md`. Install `global/AGENTS.md` by copying it to both paths. Copy it rather than symlinking it. The installed files have to keep working on a machine where this repo is deleted, moved, or never cloned.

This step reads `global/AGENTS.md` from the local clone, so run it from the repo root.

The two destinations drift independently of the repo and of each other, so check each one before you overwrite it:

```bash
diff global/AGENTS.md ~/.codex/AGENTS.md
diff global/AGENTS.md ~/.claude/CLAUDE.md
```

Handle each destination on its own result:

- Missing file, which `diff` reports as `No such file or directory`. Copy `global/AGENTS.md` there. This is the normal case on a new machine.
- No output. That destination is current. Leave it.
- Any difference. Stop and show Adi the diff. Do not copy either way.

A difference does not say which side changed, and nothing here records what was last synced. Only Adi knows whether the file was edited on this machine, so let Adi choose whether the repo or the destination wins. To keep the machine's version, bring it into `global/AGENTS.md` and commit it before copying back out.

Confirm with `shasum -a 256 global/AGENTS.md ~/.codex/AGENTS.md ~/.claude/CLAUDE.md`. Done when all three hashes match.

## Writing

Apply `technical-writing` and `unslop` to every document here, commit messages and PR descriptions included. Both are model-invoked. When the harness has neither installed, read `skills/technical-writing/SKILL.md` and `skills/unslop/SKILL.md` from this repo instead.
