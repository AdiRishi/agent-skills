# Working in this repository

This repository holds Adi's agent skills and the global instructions every harness reads. The copies under `~/.claude`, `~/.codex`, and `~/.cursor` are outputs. Change the repository, then run `node src/cli.ts apply`.

## Check your work

Run `pnpm check` before you edit. Resolve any failure that affects your task, and preserve unrelated work.

The work is complete when `pnpm check`, `pnpm typecheck`, and `pnpm test` pass.

[`dotagents.config.ts`](./dotagents.config.ts) declares each harness, the harnesses each skill installs into, and where each copied skill came from. Its types reject a harness name that the config does not declare.

## Apply to a machine

`apply` replaces each configured skill directory and global instruction file, then runs the machine check. It writes a `.dotagents` marker into every skill it installs, and it removes marked skills that the config no longer lists for that harness. It never touches a skill directory without the marker.

`~/.config/dotagents/machine.json` limits a machine to some harnesses, such as `{ "harnesses": ["claude-code", "codex"] }`. The machine owns that file, and the repository does not track it.

## Edit the global instructions

`apply` writes each harness's instruction file from [`global/AGENTS.md`](./global/AGENTS.md) plus the harness's `instructionsSection`, joined by one blank line.

Keep a rule in `global/AGENTS.md` when every harness follows it. Move it to the harness section, such as [`global/codex.md`](./global/codex.md), when it describes one harness's environment, tools, or vocabulary.

## Keep each skill complete

Every skill is one folder directly under `skills/`. A folder contains `SKILL.md` and every file the skill links to.

Claude Code and Cursor read the YAML frontmatter in `SKILL.md`. Codex also reads `agents/openai.yaml`, so a skill that targets Codex needs one.

Skills are model-invoked by default. Make a skill user-invoked only when Adi wants it invoked by name: set `disable-model-invocation: true` in `SKILL.md` and `policy.allow_implicit_invocation: false` in `agents/openai.yaml`. When an upstream skill carries these settings and Adi wants it model-invoked, remove them and describe the edit in the skill's `changes`.

## Add a skill

1. Add `skills/<name>/` with `SKILL.md` and its referenced files.
2. Add an entry for the skill to `dotagents.config.ts`. Set `harnesses` only when the skill does not use `defaultHarnesses`.
3. For a skill copied from another repository, copy the upstream folder unchanged first. Set `upstream` to the folder's GitHub tree URL at the copied commit, then describe every local edit in `changes`.
4. Add `agents/openai.yaml` when the skill targets Codex.
5. Add the skill to its group in the README's skills tables. For a copied skill from a new author, add the author to the README credits.

## Update copied skills

Follow [`update-skills`](./.claude/skills/update-skills/SKILL.md) to bring copied skills up to their latest upstream versions.

## Write for agents and humans

Apply `technical-writing` and `unslop` to every document, commit message, and pull request description. Apply `writing-for-agents` when you change `AGENTS.md` or a skill.

When these skills are not installed, read their `SKILL.md` files from this repository before you write.
