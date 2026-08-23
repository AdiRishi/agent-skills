<p align="center">
  <img src="docs/assets/agent-skills-icon-128.png" width="96" alt="Agent Skills">
</p>

# Agent setup

This repository defines the skills and global instructions that Adi's coding agents use. It can inspect a Mac, apply the declared setup, and update skills copied from upstream repositories.

## Set up a Mac

Clone the repository, then apply the current checkout:

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

## Work with the repository

The setup command has three operations:

```bash
# Validate repository structure and metadata.
node scripts/agent-setup.mjs check --repository-only

# Make this Mac match the current checkout.
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
- required integrations, including the Codex MCP server used by `invoke-codex`
- upstream repositories, commits, local files, and merge notes

The remaining files supply the declared content:

- [`skills/`](./skills) contains custom and vendored skills.
- [`global/AGENTS.md`](./global/AGENTS.md) contains the global instructions every harness receives, and [`global/codex.md`](./global/codex.md) contains the section only Codex receives.
- [`licenses/`](./licenses) preserves the notices for vendored work.
- [`AGENTS.md`](./AGENTS.md) tells an agent how to maintain the repository.

Installed files are outputs. Edit this repository, then run `apply`. Do not edit the copies under `~/.agents`, `~/.claude`, or `~/.codex` and expect the repository to import them.

## Credit and license

The repository includes work by [Lauren Tan](https://github.com/cursor/plugins/tree/main/pstack) and [Matt Pocock](https://github.com/mattpocock/skills). Their source, commit, and license records live in [`agent-setup.json`](./agent-setup.json), and their license notices live in [`licenses/`](./licenses).

Adi's custom skills use the repository's [MIT license](./LICENSE). Vendored files retain their upstream licenses.
