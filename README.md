<p align="center">
  <img src="docs/assets/agent-skills-icon-128.png" width="96" alt="Agent Skills">
</p>

# Agent skills

One installable set of agent skills collected from several upstream repos, plus the global instruction file my agents load on every project.

## Install

Most skills go to every harness:

```bash
npx skills@latest add AdiRishi/agent-skills -g -y \
  -s codebase-design technical-writing unslop writing-for-agents \
  -a claude-code codex
```

`invoke-codex` drives Codex from a Claude Code session, so it goes to Claude Code alone:

```bash
npx skills@latest add AdiRishi/agent-skills -g -y -s invoke-codex -a claude-code
```

Name the skills and harnesses as shown. A bare `npx skills add` installs everything to everything when an agent runs it, which puts `invoke-codex` on Codex.

The global instruction file installs separately, by copying. [`AGENTS.md`](./AGENTS.md) covers that, and the install, update, and vendoring procedures in full.

## Skills

| Skill | What it does | From |
| ----- | ------------ | ---- |
| [`codebase-design`](./skills/codebase-design/SKILL.md) | Vocabulary for designing deep modules: interfaces, seams, testability | [mattpocock/skills](https://github.com/mattpocock/skills) |
| [`invoke-codex`](./skills/invoke-codex/SKILL.md) | Delegates work to Codex from a Claude Code session. Claude Code only, and needs the Codex MCP server | Mine |
| [`technical-writing`](./skills/technical-writing/SKILL.md) | Diátaxis structure, Google developer style, STE instruction rules, Global English syntax | [pstack](https://github.com/cursor/plugins/tree/main/pstack) |
| [`unslop`](./skills/unslop/SKILL.md) | Cuts AI tells from any writing | [pstack](https://github.com/cursor/plugins/tree/main/pstack) |
| [`writing-for-agents`](./skills/writing-for-agents/SKILL.md) | Covers writing documents agents consume: skills, `AGENTS.md`, `CLAUDE.md` | [mattpocock/skills](https://github.com/mattpocock/skills) |

## Global instructions

[`global/AGENTS.md`](./global/AGENTS.md) is the instruction file every agent loads on every project. Codex reads it from `~/.codex/AGENTS.md`, Claude Code from `~/.claude/CLAUDE.md`.

## Credit

Most of these skills are not mine.

- [pstack](https://github.com/cursor/plugins/tree/main/pstack), by Lauren Tan, MIT
- [mattpocock/skills](https://github.com/mattpocock/skills), by Matt Pocock, MIT

[`attribution.json`](./attribution.json) records the author, license, upstream path, and upstream commit for every skill here.

## License

MIT for the skills I wrote. Vendored skills keep their original licenses, recorded per skill in [`attribution.json`](./attribution.json).
