<p align="center">
  <img src="docs/assets/agent-skills-icon-128.png" width="96" alt="Agent Skills">
</p>

# Agent setup

This repository defines the skills and global instructions that Adi's coding agents use. It can inspect a Mac or a Windows machine, apply the declared setup, and update skills copied from upstream repositories.

## Set up a machine

The setup command needs Node 22 or later and Git. Clone the repository, then apply the current checkout:

```bash
git clone https://github.com/AdiRishi/agent-skills
cd agent-skills
node scripts/agent-setup.mjs apply
```

`apply` installs each skill into its declared harness, repairs declared integrations, copies the global instruction file, removes misplaced managed skills, and checks the result. It does not store credentials or complete an interactive sign-in.

Run the machine check again at any time:

```bash
node scripts/agent-setup.mjs check --machine
```

On Windows, run the same commands from PowerShell or Git Bash. Unless symlinks are enabled, Git for Windows checks `CLAUDE.md` out as a plain file that holds the text `AGENTS.md`. The repository check accepts that file on Windows.

## Choose the harnesses a machine runs

By default, `apply` and `check --machine` manage every harness in `agent-setup.json` and run each harness's `check` command. To manage fewer harnesses on a machine, list them in `~/.config/agent-skills/machine.json`, next to the state file:

```json
{
	"harnesses": ["claude-code", "codex"],
	"skipHarnessChecks": ["codex"]
}
```

- `harnesses` names the harnesses this machine runs. `apply` installs skills and global instructions for these harnesses only. It skips a skill that targets none of them and leaves the files of other harnesses alone.
- `skipHarnessChecks` names harnesses whose `check` command does not run. Use it for a harness installed without its command-line tool, such as the Codex desktop app on Windows.

The file belongs to the machine. The repository does not track it.

## Work with the repository

The setup command has three operations:

```bash
# Validate repository structure and metadata.
node scripts/agent-setup.mjs check --repository-only

# Make this machine match the current checkout.
node scripts/agent-setup.mjs apply

# Fetch and merge every vendored skill from its declared upstream.
node scripts/agent-setup.mjs update
```

`apply --dry-run` prints the install and copy operations. `update --dry-run` fetches upstream repositories and reports what would change.

## What the repository owns

[`agent-setup.json`](./agent-setup.json) is the source of truth. It declares:

- the supported harnesses and their instruction paths
- each skill's installation targets
- the pinned `skills` installer version
- upstream repositories, commits, local files, and merge notes

The remaining files supply the declared content:

- [`skills/`](./skills) contains custom and vendored skills.
- [`global/AGENTS.md`](./global/AGENTS.md) contains the global instructions every harness receives, and [`global/codex.md`](./global/codex.md) contains the section only Codex receives. Cursor has no extra section yet. `apply` still writes [`global/AGENTS.md`](./global/AGENTS.md) to `~/.cursor/AGENTS.md`.
- [`licenses/`](./licenses) preserves the notices for vendored work.
- [`AGENTS.md`](./AGENTS.md) tells an agent how to maintain the repository.

Installed files are outputs. Edit this repository, then run `apply`. Do not edit the copies under `~/.agents`, `~/.claude`, `~/.codex`, or `~/.cursor` and expect the repository to import them.

## Credit and license

The repository includes work by [Anthropic](https://github.com/anthropics/skills), [Lauren Tan](https://github.com/cursor/plugins/tree/main/pstack), [Matt Pocock](https://github.com/mattpocock/skills), and [Cursor](https://github.com/cursor/plugins/tree/main/pr-review-canvas). Their source, commit, and license records live in [`agent-setup.json`](./agent-setup.json), and their license notices live in [`licenses/`](./licenses).

Adi's custom skills use the repository's [MIT license](./LICENSE). Vendored files retain their upstream licenses.
