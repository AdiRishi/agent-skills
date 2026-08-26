import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cp, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";

const repositoryRoot = new URL("../", import.meta.url).pathname;
const setupCommand = join(repositoryRoot, "scripts", "agent-setup.mjs");

function run(command, args, cwd) {
	const result = spawnSync(command, args, { cwd, encoding: "utf8" });
	if (result.status !== 0) {
		throw new Error(`${command} ${args.join(" ")} failed:\n${result.stdout}${result.stderr}`);
	}
	return `${result.stdout}${result.stderr}`;
}

function runSetup(root, ...args) {
	return spawnSync(process.execPath, [setupCommand, ...args, "--root", root], {
		cwd: root,
		encoding: "utf8",
	});
}

async function write(path, content) {
	await mkdir(dirname(path), { recursive: true });
	await writeFile(path, content);
}

function git(cwd, ...args) {
	return run("git", args, cwd).trim();
}

async function initializeGitRepository(root) {
	git(root, "init", "--quiet", "--initial-branch=main");
	git(root, "config", "user.name", "Agent Setup Test");
	git(root, "config", "user.email", "agent-setup-test@localhost");
	git(root, "config", "commit.gpgSign", "false");
}

async function commit(root, message) {
	git(root, "add", "--all");
	git(root, "commit", "--quiet", "-m", message);
	return git(root, "rev-parse", "HEAD");
}

const plainSkill = (body) => `---
name: plain
description: A plain fixture skill used to test exact vendored updates.
---

# Plain

${body}

~~~markdown
[A fenced placeholder link](link)
~~~
`;

const customSkill = (localLine, upstreamLine) => `---
name: custom
description: A custom fixture skill used to test three-way vendored updates.
---

# Custom

${localLine}

Stable one.
Stable two.
Stable three.
Stable four.

${upstreamLine}
`;

async function createFixture(t, options = {}) {
	const fixtureRoot = await mkdtemp(join(tmpdir(), "agent-setup-test-"));
	const upstream = join(fixtureRoot, "upstream");
	const setup = join(fixtureRoot, "setup");
	await mkdir(upstream);
	await mkdir(setup);
	t.after(() => rm(fixtureRoot, { recursive: true, force: true }));

	await initializeGitRepository(upstream);
	await write(join(upstream, "LICENSE"), "old license\n");
	await write(join(upstream, "skills", "plain", "SKILL.md"), plainSkill("Old upstream."));
	await write(join(upstream, "skills", "plain", "OBSOLETE.md"), "remove me\n");
	await write(
		join(upstream, "skills", "custom", "SKILL.md"),
		customSkill("Local base.", "Upstream base."),
	);
	const oldCommit = await commit(upstream, "old upstream");

	await cp(join(upstream, "skills", "plain"), join(setup, "skills", "plain"), {
		recursive: true,
	});
	await cp(join(upstream, "skills", "custom"), join(setup, "skills", "custom"), {
		recursive: true,
	});
	await write(join(setup, "skills", "plain", "LOCAL.md"), "keep me\n");
	await write(
		join(setup, "skills", "custom", "SKILL.md"),
		options.conflict
			? customSkill("Local conflict.", "Upstream base.")
			: customSkill("Local choice.", "Upstream base."),
	);
	await write(join(setup, "global", "AGENTS.md"), "# Global\n");
	await write(join(setup, "licenses", "upstream.txt"), "old license\n");
	await write(join(setup, "README.md"), "# Fixture\n");
	await write(join(setup, "AGENTS.md"), "# Fixture agent instructions\n");
	await symlink("AGENTS.md", join(setup, "CLAUDE.md"));
	await write(join(setup, "agent-setup.schema.json"), "{}\n");

	const manifest = {
		$schema: "./agent-setup.schema.json",
		schemaVersion: 1,
		installer: { package: "skills", version: "1.5.23" },
		sharedSkillsDirectory: "~/.agents/skills",
		stateFile: "~/.config/agent-skills/state.json",
		defaultHarnesses: ["claude-code"],
		harnesses: {
			"claude-code": {
				installerAgent: "claude-code",
				skillsDirectory: "~/.claude/skills",
				readsSharedSkills: false,
				globalInstructions: "~/.claude/CLAUDE.md",
				check: { command: process.execPath, args: ["--version"], outputIncludes: ["v"] },
			},
		},
		requirements: {},
		globalInstructions: { source: "global/AGENTS.md" },
		sources: {
			fixture: {
				repo: pathToFileURL(upstream).href,
				ref: "main",
				author: "Fixture",
				license: "Test",
				licenseFile: "licenses/upstream.txt",
				upstreamLicensePath: "LICENSE",
			},
		},
		skills: {
			plain: {
				origin: "vendored",
				source: "fixture",
				path: "skills/plain",
				vendoredFrom: oldCommit,
				modified: false,
				localFiles: ["LOCAL.md"],
			},
			custom: {
				origin: "vendored",
				source: "fixture",
				path: "skills/custom",
				vendoredFrom: oldCommit,
				modified: true,
				note: "Keep the local choice.",
			},
		},
	};
	await write(join(setup, "agent-setup.json"), `${JSON.stringify(manifest, null, 2)}\n`);
	await initializeGitRepository(setup);
	await commit(setup, "setup fixture");

	await write(join(upstream, "LICENSE"), "new license\n");
	await write(join(upstream, "skills", "plain", "SKILL.md"), plainSkill("New upstream."));
	await rm(join(upstream, "skills", "plain", "OBSOLETE.md"));
	await write(join(upstream, "skills", "plain", "NEW.md"), "new file\n");
	await write(
		join(upstream, "skills", "custom", "SKILL.md"),
		options.conflict
			? customSkill("Upstream conflict.", "Upstream base.")
			: customSkill("Local base.", "Upstream choice."),
	);
	const newCommit = await commit(upstream, "new upstream");

	return { setup, newCommit };
}

test("the checked-in repository satisfies its setup contract", () => {
	const result = runSetup(repositoryRoot, "check", "--repository-only");
	assert.equal(result.status, 0, result.stderr);
	assert.match(result.stdout, /PASS repository/u);
});

test("check accepts declared user invocation and detects metadata drift", async (t) => {
	const { setup } = await createFixture(t);
	const manifestPath = join(setup, "agent-setup.json");
	const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
	manifest.harnesses.codex = {
		installerAgent: "codex",
		skillsDirectory: "~/.codex/skills",
		readsSharedSkills: true,
		globalInstructions: "~/.codex/AGENTS.md",
		check: { command: process.execPath, args: ["--version"] },
	};
	manifest.skills.explicit = {
		origin: "custom",
		author: "Fixture",
		license: "Test",
		harnesses: ["claude-code", "codex"],
		allowModelInvocation: false,
	};
	await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
	await write(
		join(setup, "skills", "explicit", "SKILL.md"),
		`---
name: explicit
description: A fixture skill available only when the user invokes it by name.
disable-model-invocation: true
---
`,
	);
	const openaiMetadataPath = join(setup, "skills", "explicit", "agents", "openai.yaml");
	await write(
		openaiMetadataPath,
		`interface:
  short_description: "Run the explicit fixture skill by name"
policy:
  allow_implicit_invocation: false
`,
	);

	const valid = runSetup(setup, "check", "--repository-only");
	assert.equal(valid.status, 0, `${valid.stdout}${valid.stderr}`);

	await write(
		openaiMetadataPath,
		`interface:
  short_description: "Run the explicit fixture skill by name"
policy:
  allow_implicit_invocation: true
`,
	);
	const codexDrift = runSetup(setup, "check", "--repository-only");
	assert.notEqual(codexDrift.status, 0);
	assert.match(codexDrift.stderr, /allows implicit Codex invocation/u);

	await write(
		openaiMetadataPath,
		`interface:
  short_description: "Run the explicit fixture skill by name"
policy:
  allow_implicit_invocation: false
`,
	);
	await write(
		join(setup, "skills", "explicit", "SKILL.md"),
		`---
name: explicit
description: A fixture skill available only when the user invokes it by name.
---
`,
	);
	const claudeDrift = runSetup(setup, "check", "--repository-only");
	assert.notEqual(claudeDrift.status, 0);
	assert.match(claudeDrift.stderr, /allows model invocation/u);
});

test("update mirrors upstream, preserves local files, and merges declared changes", async (t) => {
	const { setup, newCommit } = await createFixture(t);
	const result = runSetup(setup, "update");
	assert.equal(result.status, 0, `${result.stdout}${result.stderr}`);

	assert.equal(await readFile(join(setup, "skills", "plain", "LOCAL.md"), "utf8"), "keep me\n");
	assert.equal(await readFile(join(setup, "skills", "plain", "NEW.md"), "utf8"), "new file\n");
	await assert.rejects(readFile(join(setup, "skills", "plain", "OBSOLETE.md")), {
		code: "ENOENT",
	});
	const custom = await readFile(join(setup, "skills", "custom", "SKILL.md"), "utf8");
	assert.match(custom, /Local choice\./u);
	assert.match(custom, /Upstream choice\./u);
	assert.equal(await readFile(join(setup, "licenses", "upstream.txt"), "utf8"), "new license\n");

	const manifest = JSON.parse(await readFile(join(setup, "agent-setup.json"), "utf8"));
	assert.equal(manifest.skills.plain.vendoredFrom, newCommit);
	assert.equal(manifest.skills.custom.vendoredFrom, newCommit);
	assert.equal(manifest.skills.custom.modified, true);
	assert.equal(git(setup, "status", "--porcelain", "--", "skills/plain/OBSOLETE.md").length > 0, true);
	assert.match(result.stdout, /PASS updated repository/u);
});

test("apply plans a declared repair when a requirement check fails", async (t) => {
	const { setup } = await createFixture(t);
	const manifestPath = join(setup, "agent-setup.json");
	const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
	manifest.requirements.fixture = {
		description: "A repairable fixture requirement",
		requiredBy: ["plain"],
		check: {
			command: process.execPath,
			args: ["-e", "process.exit(1)"],
		},
		apply: {
			command: process.execPath,
			args: ["-e", "console.log('repair fixture')"],
		},
	};
	await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

	const result = runSetup(setup, "apply", "--dry-run", "--home", join(setup, "home"));
	assert.equal(result.status, 0, `${result.stdout}${result.stderr}`);
	assert.match(result.stdout, /repair fixture/u);
});

test("an update conflict leaves the repository unchanged", async (t) => {
	const { setup } = await createFixture(t, { conflict: true });
	const before = git(setup, "status", "--porcelain");
	const result = runSetup(setup, "update");
	assert.notEqual(result.status, 0);
	assert.match(result.stderr, /The repository is unchanged/u);
	assert.equal(git(setup, "status", "--porcelain"), before);
	const custom = await readFile(join(setup, "skills", "custom", "SKILL.md"), "utf8");
	assert.match(custom, /Local conflict\./u);
	assert.doesNotMatch(custom, /Upstream conflict\./u);

	const mergePath = result.stderr.match(/Resolve the merge in (.+)\.\n/u)?.[1];
	if (mergePath) {
		const tempRoot = dirname(dirname(dirname(mergePath)));
		if (tempRoot.startsWith(join(tmpdir(), "agent-skills-update-"))) {
			await rm(tempRoot, { recursive: true, force: true });
		}
	}
});

test("each harness receives only its own global instruction sections", async (t) => {
	const { setup } = await createFixture(t);
	const home = join(setup, "home");
	const manifestPath = join(setup, "agent-setup.json");
	const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
	manifest.harnesses.codex = {
		installerAgent: "codex",
		skillsDirectory: "~/.codex/skills",
		readsSharedSkills: true,
		globalInstructions: "~/.codex/AGENTS.md",
		check: { command: process.execPath, args: ["--version"] },
	};
	manifest.globalInstructions.harnessSections = { codex: "global/codex.md" };
	await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
	await write(join(setup, "global", "codex.md"), "## Codex environment\n\nSandbox rules.\n");
	await write(join(home, ".claude", "CLAUDE.md"), "# Global\n");
	await write(join(home, ".codex", "AGENTS.md"), "# Global\n\n## Codex environment\n\nSandbox rules.\n");

	const matching = runSetup(setup, "check", "--machine", "--home", home);
	assert.doesNotMatch(`${matching.stdout}${matching.stderr}`, /global instructions/u);

	await write(join(home, ".claude", "CLAUDE.md"), "# Global\n\n## Codex environment\n\nSandbox rules.\n");
	const leaked = runSetup(setup, "check", "--machine", "--home", home);
	assert.match(leaked.stderr, /claude-code global instructions differ from global\/AGENTS\.md\./u);
});


test("a cursor-only skill must not be installed in the shared skills directory", async (t) => {
	const { setup } = await createFixture(t);
	const home = join(setup, "home");
	const manifestPath = join(setup, "agent-setup.json");
	const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
	manifest.harnesses.cursor = {
		installerAgent: "cursor",
		skillsDirectory: "~/.cursor/skills",
		readsSharedSkills: true,
		globalInstructions: "~/.cursor/AGENTS.md",
		check: { command: process.execPath, args: ["--version"] },
	};
	manifest.skills.cursorOnly = {
		origin: "custom",
		author: "Fixture",
		license: "Test",
		harnesses: ["cursor"],
	};
	await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
	await write(
		join(setup, "skills", "cursorOnly", "SKILL.md"),
		`---
name: cursorOnly
description: A fixture skill installed only for Cursor.
---
`,
	);
	await write(join(home, ".claude", "CLAUDE.md"), "# Global\n");
	await write(join(home, ".cursor", "AGENTS.md"), "# Global\n");
	await cp(join(setup, "skills", "cursorOnly"), join(home, ".cursor", "skills", "cursorOnly"), {
		recursive: true,
	});
	await cp(join(setup, "skills", "cursorOnly"), join(home, ".agents", "skills", "cursorOnly"), {
		recursive: true,
	});

	const result = runSetup(setup, "check", "--machine", "--home", home);
	assert.match(result.stderr, /cursorOnly must not be installed in the shared skills directory\./u);
});

test("check reports a global instruction section that names an unknown harness", async (t) => {
	const { setup } = await createFixture(t);
	const manifestPath = join(setup, "agent-setup.json");
	const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
	manifest.globalInstructions.harnessSections = { codex: "global/codex.md" };
	await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
	await write(join(setup, "global", "codex.md"), "## Codex environment\n");

	const result = runSetup(setup, "check", "--repository-only");
	assert.notEqual(result.status, 0);
	assert.match(result.stderr, /unknown harness codex/u);
});
