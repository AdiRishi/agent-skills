# Working in this repo

## Layout

Every skill is one folder directly under `skills/`, holding `SKILL.md` plus any files it links to. Keep the tree flat.

## Every skill carries metadata for both harnesses

Claude Code reads the YAML frontmatter in `SKILL.md`. Codex reads `agents/openai.yaml` beside it. A skill needs both, and upstreams vary in how much they ship.

`agents/openai.yaml` holds the Codex picker entry:

```yaml
interface:
  display_name: "Technical Writing"
  short_description: "Write docs to a layered standard"
```

Invocation is one decision written twice. A skill with `disable-model-invocation: true` in its frontmatter also needs `policy.allow_implicit_invocation: false` in its YAML. Write both or neither. With only the frontmatter, the model cannot reach the skill in Claude Code but still fires it in Codex.

## Vendored skills stay byte-identical

Copy upstream skills in unchanged. A byte-identical copy lets a later diff separate an upstream change from a local edit. Once you edit a vendored file, every future update becomes a merge you judge by hand.

Adding a file upstream does not have is the exception. Metadata an upstream omits, such as `agents/openai.yaml`, is worth adding. List each added file in the skill's `localFiles` and leave `modified` alone, so updates to the upstream files stay automatic.

When you change a file that also exists upstream, set `modified` to `true` in the same commit.

## attribution.json

One entry per folder in `skills/`. Every entry carries `origin`, `author`, and `license`.

Entries with `origin: "vendored"` add four more:

- `repo` and `path` locate the skill upstream.
- `ref` is the branch to check for changes.
- `vendoredFrom` is the upstream commit the copy was taken at.
- `modified` says whether any file that also exists upstream was changed here.
- `localFiles` lists files added here that upstream does not have. Optional.

Entries with `origin: "original"` carry none of the five. Adi wrote them.

## Add a vendored skill

1. Clone the upstream repo and record its `HEAD` commit.
2. Copy the skill folder to `skills/<name>/`.
3. Run `diff -r <upstream-folder> skills/<name>` and confirm it prints nothing.
4. Add the entry to `attribution.json` with `modified: false`.
5. Write `agents/openai.yaml` if upstream omitted it, and list it in `localFiles`.
6. Read the skill for links and Skill tool calls reaching outside its folder. Vendor what it depends on, or tell Adi what is missing.
7. Add a row to the skills table in `README.md`.

Done when the diff covers every upstream file, the skill has both harnesses' metadata, and every folder in `skills/` has an `attribution.json` entry.

## Update vendored skills

Run this when Adi asks you to update the skills. For each entry with `origin: "vendored"`:

1. Fetch the upstream repo at `ref`.
2. Compare the current commit for `path` against `vendoredFrom`. If they match, the skill is current. Move to the next entry.
3. If `modified` is `false`, copy the new version in. Update `vendoredFrom`.
4. If `modified` is `true`, merge three ways: upstream at `vendoredFrom`, upstream now, and the local copy. Apply clean merges. Stop and ask about conflicts.
5. Restore anything in `localFiles` that the copy overwrote. If upstream has since added a file of its own at that path, take upstream's, drop the entry from `localFiles`, and tell Adi.

Update the `README.md` row when a skill's description changes upstream.

Done when every vendored entry either matches its upstream commit or has a conflict you raised.

## Sync the global instruction file

Codex reads `~/.codex/AGENTS.md`. Claude Code reads `~/.claude/CLAUDE.md`. Install `global/AGENTS.md` by copying it to both paths. Copy it rather than symlinking it. The installed files have to keep working on a machine where this repo is deleted, moved, or never cloned.

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

Then sync the global instruction file, above.

## Writing

Read `skills/technical-writing/SKILL.md` and apply it before you write or edit any document here, commit messages and PR descriptions included. Read the file directly, because that skill is user-invoked and the Skill tool cannot reach it.
