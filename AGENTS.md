# Working in this repository

This repository is the source of truth for Adi's agent skills and global harness instructions. Installed files are generated outputs. Change the repository, then run `node scripts/agent-setup.mjs apply`.

## Start with the check

Before you edit the repository, run:

```bash
node scripts/agent-setup.mjs check --repository-only
```

Resolve any failure that affects your task before you continue. Preserve unrelated work.

[`agent-setup.json`](./agent-setup.json) declares every skill, harness target, upstream source, license, instruction destination, and required integration. [`agent-setup.schema.json`](./agent-setup.schema.json) defines its shape.

## Use the setup commands

The command interface owns mechanical work:

```bash
# Validate this repository.
node scripts/agent-setup.mjs check --repository-only

# Validate this repository and the current Mac.
node scripts/agent-setup.mjs check --machine

# Make the current Mac match this checkout.
node scripts/agent-setup.mjs apply

# Refresh all vendored skills from upstream.
node scripts/agent-setup.mjs update
```

Use `--dry-run` with `apply` or `update` to inspect planned work. Run `pnpm test` after you change the setup command.

`apply` treats the repository as authoritative. It may replace managed skill directories and global instruction files. It also repairs requirements that declare an `apply` command. It does not manage credentials. If a harness or integration check still fails, fix it when the user's request authorizes that change. Otherwise, return the exact blocker.

`update` compares Git trees at each skill's `path`. It replaces unmodified upstream files exactly, preserves declared `localFiles`, and merges declared modifications against the new upstream tree. If a merge conflicts, the command leaves this repository unchanged and prints the temporary merge path. Stop and ask Adi how to resolve the conflict.

## Keep each skill complete

Every skill is one folder directly under `skills/`. Keep the tree flat. A folder contains `SKILL.md` and every file that the skill links to.

Claude Code reads the YAML frontmatter in `SKILL.md`. Codex also reads `agents/openai.yaml`. Add that file when the skill targets Codex. `short_description` must contain 25 to 64 characters.

Every skill in this repository is model-invoked. Remove `disable-model-invocation: true` and `policy.allow_implicit_invocation: false` when an upstream skill carries them. Record an edit to an upstream file with `modified: true` and a `note` in `agent-setup.json`.

## Add a custom skill

1. Add `skills/<name>/SKILL.md` and its referenced files.
2. Add an `origin: "custom"` entry to `agent-setup.json`.
3. Add `harnesses` only when the skill does not use `defaultHarnesses`.
4. Add `agents/openai.yaml` when the skill targets Codex.
5. Run `node scripts/agent-setup.mjs check --repository-only` and `pnpm test`.

The work is complete when both commands pass and the skill needs no file outside its folder.

## Add a vendored skill

1. Clone the upstream repository and record its current commit.
2. Copy the complete upstream skill folder into `skills/<name>/` without edits.
3. Add the upstream repository to `sources` in `agent-setup.json` if it is new.
4. Preserve the upstream license notice under `licenses/` and declare both license paths on the source.
5. Add an `origin: "vendored"` skill entry with `source`, `path`, `vendoredFrom`, and `modified: false`.
6. Add missing harness metadata as a `localFiles` entry. Record any upstream-file edit with `modified: true` and a merge `note`.
7. Run `node scripts/agent-setup.mjs check --repository-only` and `pnpm test`.

The work is complete when the local upstream files are byte-identical at `vendoredFrom`, apart from declared modifications and `localFiles`.

## Update vendored skills

Run:

```bash
node scripts/agent-setup.mjs update
node scripts/agent-setup.mjs check --repository-only
pnpm test
```

Inspect every changed skill and its merge note before you commit. The command updates upstream license notices and `vendoredFrom` commits as part of the same change.

## Write for agents and humans

Apply `technical-writing` and `unslop` to every document, commit message, and pull request description. Apply `writing-for-agents` when you change `AGENTS.md`, `CLAUDE.md`, or a skill.

When these skills are not installed, read their `SKILL.md` files from this repository before you write.
