import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import { defineConfig } from "../src/config.ts";
import { apply, checkMachine, machineSettingsPath } from "../src/machine.ts";
import { fixture, fixtureConfig, skill, write } from "./fixture.ts";

const quiet = { dryRun: false, log: () => {} };

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
