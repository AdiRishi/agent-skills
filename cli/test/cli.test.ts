import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { temporaryHome } from "./fixture.ts";

const cli = fileURLToPath(new URL("../src/cli.ts", import.meta.url));

/** Runs the CLI against the checked-in repository with `home` as the machine's home directory. */
async function run(home: string, ...args: string[]) {
	try {
		const { stdout } = await promisify(execFile)(process.execPath, [cli, ...args], {
			env: { ...process.env, HOME: home },
		});
		return { code: 0, stdout };
	} catch (error) {
		const { code, stdout } = error as { code: number; stdout: string };
		return { code, stdout };
	}
}

test("check passes on the checked-in repository", async (t) => {
	const { code, stdout } = await run(await temporaryHome(t), "check");
	assert.equal(code, 0);
	assert.equal(stdout, "PASS repository\n");
});

test("check --machine fails on a machine that has not run apply", async (t) => {
	const { code, stdout } = await run(await temporaryHome(t), "check", "--machine");
	assert.equal(code, 1);
	assert.match(stdout, /^FAIL machine$/mu);
});

test("apply installs the repository so the machine check passes", async (t) => {
	const home = await temporaryHome(t);
	const applied = await run(home, "apply");
	assert.equal(applied.code, 0);
	assert.match(applied.stdout, /^PASS machine$/mu);
	assert.ok(existsSync(join(home, ".claude", "skills", "unslop", "SKILL.md")));

	const checked = await run(home, "check", "--machine");
	assert.equal(checked.code, 0);
	assert.match(checked.stdout, /^PASS machine$/mu);
});

test("apply --dry-run lists changes without making them", async (t) => {
	const home = await temporaryHome(t);
	const { code, stdout } = await run(home, "apply", "--dry-run");
	assert.equal(code, 0);
	assert.match(stdout, /^COPY skills\/unslop -> /mu);
	assert.ok(!existsSync(home));
});

test("an unknown command prints usage and fails", async (t) => {
	const { code, stdout } = await run(await temporaryHome(t), "install");
	assert.equal(code, 1);
	assert.match(stdout, /^Usage: node cli\/src\/cli\.ts <command>/u);
});
