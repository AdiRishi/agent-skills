import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test, { type TestContext } from "node:test";
import config from "../dotagents.config.ts";
import { defineConfig } from "../src/config.ts";
import { apply, checkMachine, machineSettingsPath } from "../src/machine.ts";
import { checkRepository } from "../src/repository.ts";

const fixtureConfig = defineConfig({
	harnesses: {
		claude: { skills: "~/.claude/skills", instructions: "~/.claude/CLAUDE.md" },
		codex: {
			skills: "~/.codex/skills",
			instructions: "~/.codex/AGENTS.md",
			instructionsSection: "global/codex.md",
		},
		cursor: { skills: "~/.cursor/skills", instructions: "~/.cursor/AGENTS.md" },
	},
	defaultHarnesses: ["claude"],
	skills: {
		shared: {},
		"codex-only": { harnesses: ["codex"] },
	},
});

const skill = (name: string, extra = "") => `---
name: ${name}
description: A fixture skill.
${extra}---

# ${name}
`;

async function write(path: string, content: string) {
	await mkdir(dirname(path), { recursive: true });
	await writeFile(path, content);
}

async function fixture(t: TestContext) {
	const base = await mkdtemp(join(tmpdir(), "dotagents-test-"));
	t.after(() => rm(base, { recursive: true, force: true }));
	const root = join(base, "repository");
	const home = join(base, "home");
	await write(join(root, "global", "AGENTS.md"), "# Global\n\nShared rules.\n");
	await write(join(root, "global", "codex.md"), "## Codex\n\nCodex rules.\n");
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

const quiet = { dryRun: false, log: () => {} };

test("the checked-in repository passes its own check", async () => {
	const root = fileURLToPath(new URL("..", import.meta.url));
	assert.deepEqual(await checkRepository({ root, config }), []);
});

test("check reports skill folders and config entries that do not match", async (t) => {
	const { root } = await fixture(t);
	await write(join(root, "skills", "unlisted", "SKILL.md"), skill("unlisted"));
	await rm(join(root, "skills", "shared"), { recursive: true });

	const issues = await checkRepository({ root, config: fixtureConfig });
	assert.ok(issues.some((issue) => issue.includes("skills/unlisted has no entry")));
	assert.ok(issues.some((issue) => issue.includes("lists shared, but skills/shared does not exist")));
});

test("check requires Codex metadata that agrees with SKILL.md about model invocation", async (t) => {
	const { root } = await fixture(t);
	await write(
		join(root, "skills", "codex-only", "SKILL.md"),
		skill("codex-only", "disable-model-invocation: true\n"),
	);
	assert.equal((await checkRepository({ root, config: fixtureConfig })).length, 1);

	await write(
		join(root, "skills", "codex-only", "agents", "openai.yaml"),
		'interface:\n  short_description: "A fixture skill that only Codex loads"\npolicy:\n  allow_implicit_invocation: false\n',
	);
	assert.deepEqual(await checkRepository({ root, config: fixtureConfig }), []);

	await rm(join(root, "skills", "codex-only", "agents"), { recursive: true });
	assert.deepEqual(await checkRepository({ root, config: fixtureConfig }), [
		"skills/codex-only targets Codex but has no agents/openai.yaml.",
	]);
});

test("check reports broken relative links outside fenced code", async (t) => {
	const { root } = await fixture(t);
	await write(
		join(root, "skills", "shared", "SKILL.md"),
		`${skill("shared")}\nRead [the notes](references/notes.md) and [the guide](references/guide.md).\n\n~~~markdown\n[placeholder](link)\n~~~\n`,
	);

	assert.deepEqual(await checkRepository({ root, config: fixtureConfig }), [
		"skills/shared/SKILL.md links to the missing path references/guide.md.",
	]);
});

test("apply installs each skill for its harnesses and writes each harness's instructions", async (t) => {
	const { root, home } = await fixture(t);
	await apply({ root, config: fixtureConfig, home, ...quiet });

	assert.ok(existsSync(join(home, ".claude", "skills", "shared", "references", "notes.md")));
	assert.ok(existsSync(join(home, ".codex", "skills", "codex-only", "SKILL.md")));
	assert.ok(!existsSync(join(home, ".claude", "skills", "codex-only")));
	assert.ok(!existsSync(join(home, ".codex", "skills", "shared")));
	assert.equal(
		await readFile(join(home, ".claude", "CLAUDE.md"), "utf8"),
		"# Global\n\nShared rules.\n",
	);
	assert.equal(
		await readFile(join(home, ".codex", "AGENTS.md"), "utf8"),
		"# Global\n\nShared rules.\n\n## Codex\n\nCodex rules.\n",
	);
	assert.deepEqual(await checkMachine({ root, config: fixtureConfig, home }), []);
});

test("apply removes skills it installed once they leave the config, and nothing else", async (t) => {
	const { root, home } = await fixture(t);
	await apply({ root, config: fixtureConfig, home, ...quiet });
	await write(join(home, ".claude", "skills", "personal", "SKILL.md"), skill("personal"));

	const withoutShared = defineConfig({ ...fixtureConfig, skills: { "codex-only": { harnesses: ["codex"] } } });
	await rm(join(root, "skills", "shared"), { recursive: true });
	assert.deepEqual(await checkMachine({ root, config: withoutShared, home }), [
		`${join(home, ".claude", "skills", "shared")} is no longer configured for claude.`,
	]);

	await apply({ root, config: withoutShared, home, ...quiet });
	assert.ok(!existsSync(join(home, ".claude", "skills", "shared")));
	assert.ok(existsSync(join(home, ".claude", "skills", "personal", "SKILL.md")));
	assert.deepEqual(await checkMachine({ root, config: withoutShared, home }), []);
});

test("machine settings limit apply to the harnesses a machine runs", async (t) => {
	const { root, home } = await fixture(t);
	await write(machineSettingsPath(home), JSON.stringify({ harnesses: ["claude"] }));
	await apply({ root, config: fixtureConfig, home, ...quiet });

	assert.ok(existsSync(join(home, ".claude", "skills", "shared")));
	assert.ok(!existsSync(join(home, ".codex")));
	assert.deepEqual(await checkMachine({ root, config: fixtureConfig, home }), []);
});

test("machine settings that name an unknown harness are rejected", async (t) => {
	const { root, home } = await fixture(t);
	await write(machineSettingsPath(home), JSON.stringify({ harnesses: ["claude", "vscode"] }));
	await assert.rejects(apply({ root, config: fixtureConfig, home, ...quiet }), /must set "harnesses"/u);
});

test("the machine check reports an installed file that differs from the repository", async (t) => {
	const { root, home } = await fixture(t);
	await apply({ root, config: fixtureConfig, home, ...quiet });
	await writeFile(join(home, ".claude", "skills", "shared", "references", "notes.md"), "Edited.\n");

	assert.deepEqual(await checkMachine({ root, config: fixtureConfig, home }), [
		`${join(home, ".claude", "skills", "shared")} differs from the repository: references/notes.md.`,
	]);
});

test("a dry run changes nothing", async (t) => {
	const { root, home } = await fixture(t);
	await apply({ root, config: fixtureConfig, home, dryRun: true, log: () => {} });
	assert.ok(!existsSync(home));
});
