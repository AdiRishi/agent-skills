import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import type { TestContext } from "node:test";
import { defineConfig } from "../src/config.ts";

export const fixtureConfig = defineConfig({
	harnesses: {
		claude: { skills: "~/.claude/skills", instructions: "~/.claude/CLAUDE.md" },
		codex: {
			skills: "~/.codex/skills",
			instructions: "~/.codex/AGENTS.md",
			instructionsSection: "instructions/codex.md",
		},
		cursor: { skills: "~/.cursor/skills", instructions: "~/.cursor/AGENTS.md" },
	},
	defaultHarnesses: ["claude"],
	skills: {
		shared: {},
		"codex-only": { harnesses: ["codex"] },
	},
});

export const skill = (name: string, extra = "") => `---
name: ${name}
description: A fixture skill.
${extra}---

# ${name}
`;

export async function write(path: string, content: string) {
	await mkdir(dirname(path), { recursive: true });
	await writeFile(path, content);
}

/** Creates an empty home directory path that the test removes when it ends. */
export async function temporaryHome(t: TestContext) {
	const base = await mkdtemp(join(tmpdir(), "dotagents-test-"));
	t.after(() => rm(base, { recursive: true, force: true }));
	return join(base, "home");
}

/** Creates a repository for `fixtureConfig` and an empty home directory path. */
export async function fixture(t: TestContext) {
	const home = await temporaryHome(t);
	const root = join(dirname(home), "repository");
	await write(join(root, "instructions", "base.md"), "# Global\n\nShared rules.\n");
	await write(join(root, "instructions", "codex.md"), "## Codex\n\nCodex rules.\n");
	await write(join(root, "README.md"), "- [shared](skills/shared)\n- [codex-only](skills/codex-only)\n");
	await write(join(root, "skills", "shared", "SKILL.md"), skill("shared"));
	await write(join(root, "skills", "shared", "references", "notes.md"), "Notes.\n");
	await write(join(root, "skills", "codex-only", "SKILL.md"), skill("codex-only"));
	await write(
		join(root, "skills", "codex-only", "agents", "openai.yaml"),
		'interface:\n  short_description: "A fixture skill that only Codex loads"\n',
	);
	return { root, home };
}
