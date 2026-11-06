import assert from "node:assert/strict";
import { rm } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import config from "../../dotagents.config.ts";
import { checkRepository } from "../src/repository.ts";
import { fixture, fixtureConfig, skill, write } from "./fixture.ts";

test("the checked-in repository passes its own check", async () => {
	const root = fileURLToPath(new URL("../..", import.meta.url));
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

test("check reports a skill the README does not list", async (t) => {
	const { root } = await fixture(t);
	await write(join(root, "README.md"), "- [shared](skills/shared)\n");

	assert.deepEqual(await checkRepository({ root, config: fixtureConfig }), [
		"README.md does not list skills/codex-only.",
	]);
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

test("check ignores nested checkouts such as Git worktrees", async (t) => {
	const { root } = await fixture(t);
	await write(join(root, ".claude", "worktrees", "old", ".git"), "gitdir: elsewhere\n");
	await write(join(root, ".claude", "worktrees", "old", "README.md"), "[gone](missing.md)\n");

	assert.deepEqual(await checkRepository({ root, config: fixtureConfig }), []);
});
