<p align="center">
  <img src="docs/assets/agent-skills-icon-128.png" width="96" alt="dotagents">
</p>

# dotagents

This repository defines the skills and global instructions that Adi's coding agents use, and installs them on a Mac or Windows machine.

## Set up a machine

The setup command needs Node 22.18 or later. Clone the repository, then apply the current checkout:

```bash
git clone https://github.com/AdiRishi/dotagents
cd dotagents
node src/cli.ts apply
```

`apply` copies each skill into the skills directory of every harness it targets, writes each harness's global instructions, and removes skills it installed earlier that the config no longer lists. Then it checks the result. Run the check again at any time:

```bash
node src/cli.ts check --machine
```

To run fewer harnesses on a machine, list them in `~/.config/dotagents/machine.json`:

```json
{ "harnesses": ["claude-code", "codex"] }
```

## What the repository owns

- [`dotagents.config.ts`](./dotagents.config.ts) declares the harnesses, each skill's harnesses, and where each copied skill came from.
- [`skills/`](./skills) contains the skills.
- [`global/AGENTS.md`](./global/AGENTS.md) contains the global instructions every harness receives, and [`global/codex.md`](./global/codex.md) contains the section only Codex receives.
- [`AGENTS.md`](./AGENTS.md) tells an agent how to maintain the repository.

Adi's skills use the repository's [MIT license](./LICENSE).
