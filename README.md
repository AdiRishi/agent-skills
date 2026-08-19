<p align="center">
  <img src="docs/assets/agent-skills-icon-128.png" width="96" alt="Agent Skills">
</p>

# Agent skills

One installable set of agent skills collected from several upstream repos, plus the global instruction file my agents load on every project.

## Install

```bash
npx skills@latest add AdiRishi/agent-skills
```

The installer asks which skills to take and which agents to install them on, so one run covers every harness. Leave `invoke-codex` out when it asks about Codex, since it drives Codex from Claude Code and does nothing inside Codex itself.

The global instruction file installs separately, by copying. [`AGENTS.md`](./AGENTS.md) has that procedure, along with how to add a skill and how to update the vendored ones.

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
