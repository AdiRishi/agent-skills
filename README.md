<p align="center">
  <img src="docs/assets/agent-skills-icon-128.png" width="96" alt="Agent Skills">
</p>

# Agent skills

One installable set of agent skills collected from several upstream repos, plus the global instruction file my agents load on every project.

## Install

```bash
npx skills@latest add AdiRishi/agent-skills
```

The installer asks which skills to take and which agents to install them on. It writes to `~/.agents/skills/` and symlinks into each agent's directory, so every harness shares one copy on disk.

The global instruction file installs separately, by copying. [`AGENTS.md`](./AGENTS.md) has that procedure, along with how to add a skill and how to update the vendored ones.

## Skills

| Skill | What it does | From |
| ----- | ------------ | ---- |
| [`technical-writing`](./skills/technical-writing/SKILL.md) | Diátaxis structure, Google developer style, STE instruction rules, Global English syntax | [pstack](https://github.com/cursor/plugins/tree/main/pstack) |
| [`unslop`](./skills/unslop/SKILL.md) | Cuts AI tells from any writing | [pstack](https://github.com/cursor/plugins/tree/main/pstack) |
| [`writing-for-agents`](./skills/writing-for-agents/SKILL.md) | Covers writing documents agents consume: skills, `AGENTS.md`, `CLAUDE.md` | [mattpocock/skills](https://github.com/mattpocock/skills) |

You invoke `technical-writing` by name. The other two also fire on their own when their description matches the work.

## Global instructions

[`global/AGENTS.md`](./global/AGENTS.md) is the instruction file every agent loads on every project. Codex reads it from `~/.codex/AGENTS.md`, Claude Code from `~/.claude/CLAUDE.md`.

## Credit

Most of these skills are not mine.

- [pstack](https://github.com/cursor/plugins/tree/main/pstack), by Lauren Tan, MIT
- [mattpocock/skills](https://github.com/mattpocock/skills), by Matt Pocock, MIT

[`attribution.json`](./attribution.json) records the author, license, upstream path, and upstream commit for every skill here.

## License

MIT for the skills I wrote. Vendored skills keep their original licenses, recorded per skill in [`attribution.json`](./attribution.json).
