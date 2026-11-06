<p align="center">
  <img src="docs/assets/icon-128.png" width="96" alt="">
</p>

# dotagents

This is how I work with coding agents. It holds the rules every agent I run follows, the skills they load, and a small TypeScript CLI that installs both on each of my machines. Claude Code, Codex, and Cursor all start from this repository.

## The working agreement

Every harness reads [`instructions/base.md`](./instructions/base.md) as its global instructions. In short:

- Build the simplest design that fits the real requirements. Build the complete requested behavior, with no unfinished paths for requirements that might come later.
- Trust internal types and framework guarantees. Validate only at system boundaries, such as user input and external APIs.
- Delete code that is certainly unused. No renamed `_variables`, compatibility shims, or `removed` comments.
- A test protects an outcome a caller cares about and still passes after an internal refactor. No mock call counts, and no expected values computed with the implementation's own logic.
- Comments explain only what the code cannot show, such as a hidden constraint or a workaround.
- Anything I will read goes through [`unslop`](skills/unslop) first.
- Commit at reviewable checkpoints. Pushes to an open PR can start paid reviews, so related commits go up together.

Codex also gets [`instructions/codex.md`](./instructions/codex.md), which covers its sandbox and browser tools.

## Skills

Skills marked "mine" are written here. The rest are copies of other people's skills, and "edited" means I changed more than the Codex metadata. [`dotagents.config.ts`](./dotagents.config.ts) links each copy to its upstream folder and describes my edits.

### Plan and design

| Skill | What it does | From |
| --- | --- | --- |
| [grilling](skills/grilling) | Questions me about a plan or decision until every branch is settled. | Matt Pocock |
| [wayfinder](skills/wayfinder) | Plans work too large for one agent session as decision tickets on the issue tracker, then resolves them one at a time. | Matt Pocock |
| [codebase-design](skills/codebase-design) | Gives a shared vocabulary for designing deep modules and deciding where seams go. | Matt Pocock |
| [engineering-principles](skills/engineering-principles) | Indexes 24 engineering principles, such as "fix root causes" and "subtract before you add", and loads each one only when it applies. | Mine, with pstack's principles |

### Build

| Skill | What it does | From |
| --- | --- | --- |
| [typescript-best-practices](skills/typescript-best-practices) | Applies TypeScript rules whenever an agent reads or edits a `.ts` file: discriminated unions, branded types, and no `as` casts. | pstack, edited |
| [frontend-design](skills/frontend-design) | Sets a visual direction and typography for new UI so it does not look templated. | Anthropic |
| [game-development](skills/game-development) | Builds a game through visual direction and play, where I judge how it feels. Codex only. | Mine |
| [typesafe-ai](skills/typesafe-ai) | Replaces prompt-and-parse steps with TypeSafe's typed AI judgments. | TypeSafe AI |
| [cf-cli](skills/cf-cli) | Runs Cloudflare's `cf` CLI for DNS, Workers, D1, KV, and R2. | Cloudflare |

### Coordinate agents

| Skill | What it does | From |
| --- | --- | --- |
| [orchestrate-claude](skills/orchestrate-claude) | Runs Claude subagents with clear ownership and an explicit model and effort for each one. | Mine |
| [orchestrate-codex](skills/orchestrate-codex) | Runs Codex subagents with clear ownership on the current thread's model. | Mine |

### Verify

| Skill | What it does | From |
| --- | --- | --- |
| [create-verification-skill](skills/create-verification-skill) | Generates a project skill that drives the app the way a user does. | pstack, edited |
| [maintain-verification-skill](skills/maintain-verification-skill) | Keeps that skill and its feature map accurate as the app changes. | pstack, edited |
| [create-formal-verification-skill](skills/create-formal-verification-skill) | Generates a project skill that formally verifies the code where a bug costs the most and tests reach the least. | pstack |
| [maintain-formal-verification-skill](skills/maintain-formal-verification-skill) | Updates the formal models after the verified code changes. | pstack |
| [statechart](skills/statechart) | Draws a system's states as a Mermaid statechart from a TLA+ model, with each bug as a numbered path. | pstack |

### Review and ship

| Skill | What it does | From |
| --- | --- | --- |
| [claude-code-review](skills/claude-code-review) | Runs Claude Code's review, checks each finding against the code and my intent, and fixes the findings that hold up. | Mine |
| [file-pr](skills/file-pr) | Files a concise pull request. | Theo Browne, edited |
| [pr-writing](skills/pr-writing) | Writes a PR description: a short opening, optional reviewer details, and evidence. | HugoRCD, edited |
| [babysit-pr](skills/babysit-pr) | Watches a pull request through review and CI. | Theo Browne |
| [leaving-pr-comments](skills/leaving-pr-comments) | Sets the rules for comments on GitHub. | Theo Browne |

### Write and explain

| Skill | What it does | From |
| --- | --- | --- |
| [unslop](skills/unslop) | Removes AI writing patterns. Every harness loads it before writing anything I read. | pstack, edited |
| [technical-writing](skills/technical-writing) | Applies a layered standard: Diátaxis, Google developer style, Simplified Technical English, and Global English. | pstack, edited |
| [writing-for-agents](skills/writing-for-agents) | Shows how to write skills and `AGENTS.md` files that an agent follows the same way on every run. | Matt Pocock |
| [walk-me-through](skills/walk-me-through) | Explains work I could not follow so that I understand it on the first read. | Mine |

## How it works

```text
instructions/        the rules every harness reads, plus harness-specific sections
skills/              one folder per skill
cli/src/             the CLI that checks the repository and installs it on a machine
cli/test/            one test file for each CLI module
docs/assets/         the repository icon
dotagents.config.ts  harnesses, and where each skill installs and came from
```

[`dotagents.config.ts`](./dotagents.config.ts) declares the harnesses and the harnesses each skill installs into. A typo in a harness name fails the type check.

`node cli/src/cli.ts apply` copies each skill into the skills directory of every harness it targets. Then it writes each harness's instruction file from `instructions/base.md` and that harness's optional section. Each installed skill gets a `.dotagents` marker file. A later `apply` uses the marker to remove skills that left the config, and it leaves skills from anywhere else alone.

Copied skills have no merge tooling. Some of my edits, such as the `pr-writing` restructure, are too large for a three-way merge to keep, so an agent does the update. Ask Claude Code in this repository to update the skills, and the project's [`update-skills`](./.agents/skills/update-skills/SKILL.md) skill takes it from there.

CI runs `pnpm check`, `pnpm typecheck`, and `pnpm test`. The check confirms that each skill folder has a config entry, that `SKILL.md` and the Codex metadata agree about invocation, that relative links resolve, and that this README lists every skill.

## Use it

To take one skill, copy its folder into your harness's skills directory, such as `~/.claude/skills/unslop`, or use the [`skills`](https://github.com/vercel-labs/skills) CLI:

```bash
npx skills add AdiRishi/dotagents --skill unslop
```

To set up one of my machines, use Node 26 or later:

```bash
git clone https://github.com/AdiRishi/dotagents
cd dotagents
node cli/src/cli.ts apply
```

Run `node cli/src/cli.ts check --machine` at any time to compare the machine with the repository. To run fewer harnesses on a machine, list them in `~/.config/dotagents/machine.json`:

```json
{ "harnesses": ["claude-code", "codex"] }
```

## Credits

This repository includes skills from:

- [Anthropic](https://github.com/anthropics/skills)
- [Cloudflare](https://github.com/cloudflare/skills)
- [HugoRCD](https://github.com/HugoRCD/hr-folio)
- [Lauren Tan](https://github.com/cursor/plugins/tree/main/pstack), through pstack
- [Matt Pocock](https://github.com/mattpocock/skills)
- [Theo Browne](https://github.com/t3dotgg/tstack), through tstack
- [TypeSafe AI](https://github.com/typesafe-ai/skills)

Thank you all. My own skills and code use the [MIT license](./LICENSE).
