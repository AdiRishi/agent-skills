<p align="center">
  <img src="docs/assets/agent-skills-icon-128.png" width="96" alt="Agent Skills">
</p>

# Agent skills

Every agent skill I use, in one repository, credited to whoever wrote it.

## Why this exists

I install skills with [`npx skills`](https://skills.sh), and the bookkeeping is the part it gets right. It hashes each skill folder and records the repo, ref, and path the skill came from. It knows when an installed copy has drifted from its source.

Fragmentation is the part it cannot fix. My skills come from several repos on different release cadences. Matching a new machine to an old one meant replaying install commands in the right order, and trusting my memory for the list. The lock file that tracks all of it sits at `~/.agents/.skill-lock.json`. That is per-machine state. You cannot commit it and share it.

So this repo is the one upstream. Skills are collected here, credited, and installed from a single source. A machine syncs with one command, and updating a borrowed skill is a job I hand to an agent.

## Skills

| Skill | What it does | From |
| ----- | ------------ | ---- |
| [`technical-writing`](./skills/technical-writing/SKILL.md) | Diátaxis structure, Google developer style, STE instruction rules, Global English syntax | [pstack](https://github.com/cursor/plugins/tree/main/pstack) |
| [`unslop`](./skills/unslop/SKILL.md) | Cuts AI tells from any writing | [pstack](https://github.com/cursor/plugins/tree/main/pstack) |
| [`writing-for-agents`](./skills/writing-for-agents/SKILL.md) | Covers writing documents agents consume: skills, `AGENTS.md`, `CLAUDE.md` | [mattpocock/skills](https://github.com/mattpocock/skills) |

You invoke `technical-writing` by name. The other two also fire on their own when their description matches the work.

## Global instructions

[`global/AGENTS.md`](./global/AGENTS.md) is the instruction file every agent loads on every project. Codex reads it from `~/.codex/AGENTS.md` and Claude Code from `~/.claude/CLAUDE.md`.

Installing copies the file to both paths instead of symlinking it, so it keeps working on a machine that does not have this repo. Copies drift, so [`AGENTS.md`](./AGENTS.md) covers how to tell which side is ahead before you overwrite either one.

## Install

```bash
npx skills@latest add AdiRishi/agent-skills
```

The installer asks which skills to take and which agents to install them on. It writes to `~/.agents/skills/` and symlinks into each agent's directory, so every harness shares one copy on disk.

The global instruction file installs separately. [`AGENTS.md`](./AGENTS.md) has that procedure, along with how to update a vendored skill and how to add a new one.

## Credit

Most of these skills are not mine.

- [pstack](https://github.com/cursor/plugins/tree/main/pstack), by Lauren Tan, MIT
- [mattpocock/skills](https://github.com/mattpocock/skills), by Matt Pocock, MIT

Both repos hold far more than I have taken, and both are worth reading in full.

[`attribution.json`](./attribution.json) records the author, license, upstream path, and exact upstream commit for every skill here. It is the file an agent reads when I ask it to update everything.

## License

MIT for the skills I wrote. Vendored skills keep their original licenses, recorded per skill in [`attribution.json`](./attribution.json).
