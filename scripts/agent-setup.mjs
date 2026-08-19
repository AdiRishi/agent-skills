#!/usr/bin/env node

import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import {
	cp,
	lstat,
	mkdir,
	mkdtemp,
	readFile,
	readdir,
	readlink,
	realpath,
	rm,
	writeFile,
} from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const scriptRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifestName = "agent-setup.json";

class SetupError extends Error {}

function fail(message) {
	throw new SetupError(message);
}

function parseArguments(argv) {
	const [command = "help", ...rest] = argv;
	const options = {
		root: scriptRoot,
		home: homedir(),
		dryRun: false,
		machine: false,
		repositoryOnly: false,
	};

	for (let index = 0; index < rest.length; index += 1) {
		const argument = rest[index];
		if (argument === "--dry-run") {
			options.dryRun = true;
		} else if (argument === "--machine") {
			options.machine = true;
		} else if (argument === "--repository-only") {
			options.repositoryOnly = true;
		} else if (argument === "--root" || argument === "--home") {
			const value = rest[index + 1];
			if (!value) fail(`${argument} needs a path.`);
			options[argument === "--root" ? "root" : "home"] = resolve(value);
			index += 1;
		} else {
			fail(`Unknown option: ${argument}`);
		}
	}

	return { command, options };
}

function printUsage() {
	console.log(`Usage: node scripts/agent-setup.mjs <command> [options]

Commands:
  check [--machine]            Validate the repository and optionally the Mac
  apply [--dry-run]            Make the Mac match this checkout
  update [--dry-run]           Refresh every vendored skill from upstream

Options:
  --repository-only            Validate only repository state
  --root <path>                Use another repository root
  --home <path>                Use another home directory
  --dry-run                    Print writes without applying them`);
}

function run(command, args, options = {}) {
	const result = spawnSync(command, args, {
		cwd: options.cwd,
		encoding: "utf8",
		stdio: options.inherit ? "inherit" : "pipe",
		timeout: options.timeout ?? 120_000,
	});

	if (result.error) {
		return { ok: false, output: result.error.message, status: result.status };
	}

	const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
	return { ok: result.status === 0, output, status: result.status };
}

function runOrFail(command, args, options = {}) {
	const result = run(command, args, options);
	if (!result.ok) {
		fail(
			[`Command failed: ${formatCommand(command, args)}`, result.output.trim()]
				.filter(Boolean)
				.join("\n"),
		);
	}
	return result.output;
}

function formatCommand(command, args) {
	return [command, ...args]
		.map((part) => (/^[A-Za-z0-9_./:@=-]+$/.test(part) ? part : JSON.stringify(part)))
		.join(" ");
}

function expandHome(path, home) {
	if (!path.startsWith("~/")) fail(`Expected a home-relative path, received ${path}.`);
	return join(home, path.slice(2));
}

function repositoryPath(root, path) {
	const absolute = resolve(root, path);
	if (absolute !== root && !absolute.startsWith(`${root}${sep}`)) {
		fail(`Path escapes the repository: ${path}`);
	}
	return absolute;
}

async function pathExists(path) {
	try {
		await lstat(path);
		return true;
	} catch (error) {
		if (error.code === "ENOENT") return false;
		throw error;
	}
}

async function readManifest(root) {
	const path = join(root, manifestName);
	let raw;
	try {
		raw = await readFile(path, "utf8");
	} catch (error) {
		fail(`Cannot read ${manifestName}: ${error.message}`);
	}

	let manifest;
	try {
		manifest = JSON.parse(raw);
	} catch (error) {
		fail(`${manifestName} is not valid JSON: ${error.message}`);
	}

	return { manifest, raw, path };
}

function skillHarnesses(manifest, skill) {
	return [...(skill.harnesses ?? manifest.defaultHarnesses)].sort();
}

function sameValues(left, right) {
	return (
		left.length === right.length &&
		[...left].sort().every((value, index) => value === [...right].sort()[index])
	);
}

function parseFrontmatter(skillDocument) {
	const block = skillDocument.match(/^---\r?\n([\s\S]*?)\r?\n---/u)?.[1] ?? "";
	const value = (key) => {
		const match = block.match(new RegExp(`^${key}:\\s*(.+)$`, "mu"));
		return match?.[1].trim().replace(/^(["'])(.*)\1$/u, "$2");
	};
	return { block, name: value("name"), description: value("description") };
}

async function listSkillDirectories(root) {
	const entries = await readdir(join(root, "skills"), { withFileTypes: true });
	return entries
		.filter((entry) => entry.isDirectory())
		.map((entry) => entry.name)
		.sort();
}

async function markdownFiles(root) {
	const files = [];
	async function visit(directory) {
		for (const entry of await readdir(directory, { withFileTypes: true })) {
			if (entry.name === ".git") continue;
			const path = join(directory, entry.name);
			if (entry.isDirectory()) await visit(path);
			else if (entry.isFile() && entry.name.endsWith(".md")) files.push(path);
		}
	}
	await visit(root);
	return files;
}

async function checkMarkdownLinks(root, issues) {
	for (const file of await markdownFiles(root)) {
		const content = await readFile(file, "utf8");
		for (const match of content.matchAll(/\]\(([^)]+)\)/gu)) {
			const target = match[1].replace(/^<|>$/gu, "").split("#", 1)[0];
			if (!target || /^(?:[a-z]+:|#|\$|\/)/iu.test(target)) continue;
			const decoded = decodeURIComponent(target);
			const destination = resolve(dirname(file), decoded);
			if (!(await pathExists(destination))) {
				issues.push(
					`${relative(root, file)} links to missing path ${target}.`,
				);
			}
		}
	}
}

function isNonEmptyString(value) {
	return typeof value === "string" && value.length > 0;
}

function validateCommand(check, label, issues) {
	if (!check || !isNonEmptyString(check.command) || !Array.isArray(check.args)) {
		issues.push(`${label} needs a command and an args array.`);
	}
}

async function checkRepository(root) {
	const issues = [];
	const { manifest, raw } = await readManifest(root);

	if (manifest.schemaVersion !== 1) issues.push("schemaVersion must be 1.");
	if (!isNonEmptyString(manifest.installer?.package)) {
		issues.push("installer.package must be a non-empty string.");
	}
	if (!isNonEmptyString(manifest.installer?.version)) {
		issues.push("installer.version must be a non-empty string.");
	}
	if (!isNonEmptyString(manifest.sharedSkillsDirectory)) {
		issues.push("sharedSkillsDirectory must be set.");
	}
	if (!isNonEmptyString(manifest.stateFile)) issues.push("stateFile must be set.");

	const harnessEntries = Object.entries(manifest.harnesses ?? {});
	const harnessNames = new Set(harnessEntries.map(([name]) => name));
	if (harnessEntries.length === 0) issues.push("harnesses must not be empty.");
	for (const [name, harness] of harnessEntries) {
		if (!isNonEmptyString(harness.installerAgent)) {
			issues.push(`harnesses.${name}.installerAgent must be set.`);
		}
		for (const key of ["skillsDirectory", "globalInstructions"]) {
			if (!isNonEmptyString(harness[key]) || !harness[key].startsWith("~/")) {
				issues.push(`harnesses.${name}.${key} must start with ~/.`);
			}
		}
		if (typeof harness.readsSharedSkills !== "boolean") {
			issues.push(`harnesses.${name}.readsSharedSkills must be a boolean.`);
		}
		validateCommand(harness.check, `harnesses.${name}.check`, issues);
	}

	if (!Array.isArray(manifest.defaultHarnesses) || manifest.defaultHarnesses.length === 0) {
		issues.push("defaultHarnesses must not be empty.");
	} else {
		for (const name of manifest.defaultHarnesses) {
			if (!harnessNames.has(name)) issues.push(`Unknown default harness: ${name}.`);
		}
	}

	const globalSource = manifest.globalInstructions?.source;
	if (!isNonEmptyString(globalSource)) {
		issues.push("globalInstructions.source must be set.");
	} else if (!(await pathExists(repositoryPath(root, globalSource)))) {
		issues.push(`Global instruction source does not exist: ${globalSource}.`);
	}

	const sources = manifest.sources ?? {};
	for (const [name, source] of Object.entries(sources)) {
		for (const key of [
			"repo",
			"ref",
			"author",
			"license",
			"licenseFile",
			"upstreamLicensePath",
		]) {
			if (!isNonEmptyString(source[key])) issues.push(`sources.${name}.${key} must be set.`);
		}
		if (
			isNonEmptyString(source.licenseFile) &&
			!(await pathExists(repositoryPath(root, source.licenseFile)))
		) {
			issues.push(`License file does not exist: ${source.licenseFile}.`);
		}
	}

	const skills = manifest.skills ?? {};
	const skillNames = Object.keys(skills).sort();
	const directories = await listSkillDirectories(root);
	if (!sameValues(skillNames, directories)) {
		issues.push(
			`Skill directories and manifest entries differ. Directories: ${directories.join(", ")}. Manifest: ${skillNames.join(", ")}.`,
		);
	}

	for (const [name, skill] of Object.entries(skills)) {
		const skillRoot = join(root, "skills", name);
		const skillDocumentPath = join(skillRoot, "SKILL.md");
		if (!(await pathExists(skillDocumentPath))) {
			issues.push(`${name} has no SKILL.md.`);
			continue;
		}

		const document = await readFile(skillDocumentPath, "utf8");
		const frontmatter = parseFrontmatter(document);
		if (frontmatter.name !== name) {
			issues.push(`${name}/SKILL.md declares name ${frontmatter.name ?? "<missing>"}.`);
		}
		if (!frontmatter.description) issues.push(`${name}/SKILL.md has no description.`);
		if (/^disable-model-invocation:\s*true$/mu.test(frontmatter.block)) {
			issues.push(`${name} disables model invocation.`);
		}

		const harnesses = skillHarnesses(manifest, skill);
		for (const harness of harnesses) {
			if (!harnessNames.has(harness)) issues.push(`${name} targets unknown harness ${harness}.`);
		}

		const targetsCodex = harnesses.some(
			(name) => manifest.harnesses?.[name]?.installerAgent === "codex",
		);
		const openaiMetadata = join(skillRoot, "agents", "openai.yaml");
		if (targetsCodex && !(await pathExists(openaiMetadata))) {
			issues.push(`${name} targets Codex but has no agents/openai.yaml.`);
		} else if (await pathExists(openaiMetadata)) {
			const metadata = await readFile(openaiMetadata, "utf8");
			const shortDescription = metadata.match(/^\s*short_description:\s*["']?(.+?)["']?\s*$/mu)?.[1];
			if (!shortDescription || shortDescription.length < 25 || shortDescription.length > 64) {
				issues.push(`${name} has a Codex short_description outside 25 to 64 characters.`);
			}
			if (/allow_implicit_invocation:\s*false/mu.test(metadata)) {
				issues.push(`${name} disables implicit invocation in agents/openai.yaml.`);
			}
		}

		if (skill.origin === "vendored") {
			if (!sources[skill.source]) issues.push(`${name} names unknown source ${skill.source}.`);
			if (!isNonEmptyString(skill.path)) issues.push(`${name} has no upstream path.`);
			if (!/^[0-9a-f]{40}$/u.test(skill.vendoredFrom ?? "")) {
				issues.push(`${name} has an invalid vendoredFrom commit.`);
			}
			if (typeof skill.modified !== "boolean") issues.push(`${name} has no modified flag.`);
			if (skill.modified && !isNonEmptyString(skill.note)) {
				issues.push(`${name} is modified but has no merge note.`);
			}
			for (const localFile of skill.localFiles ?? []) {
				if (!(await pathExists(repositoryPath(skillRoot, localFile)))) {
					issues.push(`${name} declares missing local file ${localFile}.`);
				}
			}
		} else if (skill.origin === "original") {
			if (!isNonEmptyString(skill.author) || !isNonEmptyString(skill.license)) {
				issues.push(`${name} needs an author and license.`);
			}
		} else {
			issues.push(`${name} has unknown origin ${skill.origin}.`);
		}
	}

	for (const [name, requirement] of Object.entries(manifest.requirements ?? {})) {
		if (!isNonEmptyString(requirement.description)) {
			issues.push(`requirements.${name}.description must be set.`);
		}
		if (!Array.isArray(requirement.requiredBy) || requirement.requiredBy.length === 0) {
			issues.push(`requirements.${name}.requiredBy must not be empty.`);
		} else {
			for (const skill of requirement.requiredBy) {
				if (!skills[skill]) issues.push(`${name} is required by unknown skill ${skill}.`);
			}
		}
		validateCommand(requirement.check, `requirements.${name}.check`, issues);
	}

	const claudeInstructions = join(root, "CLAUDE.md");
	try {
		const stats = await lstat(claudeInstructions);
		if (!stats.isSymbolicLink() || (await readlink(claudeInstructions)) !== "AGENTS.md") {
			issues.push("CLAUDE.md must be a symlink to AGENTS.md.");
		}
	} catch (error) {
		if (error.code === "ENOENT") issues.push("CLAUDE.md is missing.");
		else throw error;
	}

	await checkMarkdownLinks(root, issues);
	return { issues, manifest, raw };
}

function printCheck(label, issues) {
	if (issues.length === 0) {
		console.log(`PASS ${label}`);
		return;
	}
	console.error(`FAIL ${label}`);
	for (const issue of issues) console.error(`- ${issue}`);
}

function excluded(relativePath, exclusions) {
	return exclusions.some(
		(exclusion) => relativePath === exclusion || relativePath.startsWith(`${exclusion}${sep}`),
	);
}

async function directoryEntries(root, exclusions = []) {
	const entries = new Map();
	const actualRoot = await realpath(root);

	async function visit(directory) {
		for (const entry of await readdir(directory, { withFileTypes: true })) {
			if (entry.name === ".DS_Store" || entry.name === ".git") continue;
			const path = join(directory, entry.name);
			const relativePath = relative(actualRoot, path);
			if (excluded(relativePath, exclusions)) continue;
			if (entry.isDirectory()) {
				await visit(path);
			} else if (entry.isSymbolicLink()) {
				entries.set(relativePath, `link:${await readlink(path)}`);
			} else if (entry.isFile()) {
				const content = await readFile(path);
				entries.set(relativePath, `file:${createHash("sha256").update(content).digest("hex")}`);
			}
		}
	}

	await visit(actualRoot);
	return entries;
}

async function compareDirectories(expected, actual, exclusions = []) {
	if (!(await pathExists(actual))) return [`missing ${actual}`];
	const [expectedEntries, actualEntries] = await Promise.all([
		directoryEntries(expected, exclusions),
		directoryEntries(actual, exclusions),
	]);
	const differences = [];
	for (const path of new Set([...expectedEntries.keys(), ...actualEntries.keys()])) {
		if (expectedEntries.get(path) !== actualEntries.get(path)) differences.push(path);
	}
	return differences.sort();
}

async function sourceHash(root, rawManifest, manifest) {
	const hash = createHash("sha256").update(rawManifest);
	const globalPath = repositoryPath(root, manifest.globalInstructions.source);
	hash.update(await readFile(globalPath));
	for (const name of Object.keys(manifest.skills).sort()) {
		for (const [path, value] of await directoryEntries(join(root, "skills", name))) {
			hash.update(name).update(path).update(value);
		}
	}
	return hash.digest("hex");
}

function expectedSkillLocations(manifest, name, skill, home) {
	const harnesses = skillHarnesses(manifest, skill);
	if (sameValues(harnesses, manifest.defaultHarnesses)) {
		return [
			join(expandHome(manifest.sharedSkillsDirectory, home), name),
			...harnesses
				.filter((harness) => !manifest.harnesses[harness].readsSharedSkills)
				.map((harness) =>
					join(expandHome(manifest.harnesses[harness].skillsDirectory, home), name),
				),
		];
	}
	return harnesses.map((harness) =>
		join(expandHome(manifest.harnesses[harness].skillsDirectory, home), name),
	);
}

async function checkCommand(check, label) {
	const result = run(check.command, check.args, { timeout: 30_000 });
	if (!result.ok) return `${label} failed: ${result.output.trim() || "command not found"}`;
	if (check.outputIncludes && !result.output.includes(check.outputIncludes)) {
		return `${label} output does not include ${JSON.stringify(check.outputIncludes)}.`;
	}
	return undefined;
}

async function checkMachine(root, home, manifest, rawManifest) {
	const issues = [];
	for (const [name, harness] of Object.entries(manifest.harnesses)) {
		const issue = await checkCommand(harness.check, `${name} check`);
		if (issue) issues.push(issue);
	}
	for (const [name, requirement] of Object.entries(manifest.requirements)) {
		const issue = await checkCommand(requirement.check, `${name} check`);
		if (issue) issues.push(issue);
	}

	const globalSource = repositoryPath(root, manifest.globalInstructions.source);
	for (const [name, harness] of Object.entries(manifest.harnesses)) {
		const destination = expandHome(harness.globalInstructions, home);
		if (!(await pathExists(destination))) {
			issues.push(`${name} global instructions are missing at ${destination}.`);
		} else if ((await readFile(globalSource)).compare(await readFile(destination)) !== 0) {
			issues.push(`${name} global instructions differ from ${manifest.globalInstructions.source}.`);
		}
	}

	const sharedDirectory = expandHome(manifest.sharedSkillsDirectory, home);
	for (const [name, skill] of Object.entries(manifest.skills)) {
		const source = join(root, "skills", name);
		const harnesses = skillHarnesses(manifest, skill);
		for (const location of expectedSkillLocations(manifest, name, skill, home)) {
			const differences = await compareDirectories(source, location);
			if (differences.length > 0) {
				issues.push(
					`${name} differs at ${location}: ${differences.slice(0, 5).join(", ")}${differences.length > 5 ? ", ..." : ""}.`,
				);
			}
		}

		if (!sameValues(harnesses, manifest.defaultHarnesses)) {
			const sharedLocation = join(sharedDirectory, name);
			if (await pathExists(sharedLocation)) {
				issues.push(`${name} must not be installed in the shared skills directory.`);
			}
		}
		for (const [harnessName, harness] of Object.entries(manifest.harnesses)) {
			if (harnesses.includes(harnessName)) continue;
			const excludedLocation = join(expandHome(harness.skillsDirectory, home), name);
			if (await pathExists(excludedLocation)) {
				issues.push(`${name} must not be installed for ${harnessName}.`);
			}
		}
	}

	const statePath = expandHome(manifest.stateFile, home);
	if (!(await pathExists(statePath))) {
		issues.push(`Managed state is missing at ${statePath}. Run apply.`);
	} else {
		try {
			const state = JSON.parse(await readFile(statePath, "utf8"));
			const expectedHash = await sourceHash(root, rawManifest, manifest);
			if (state.sourceHash !== expectedHash) {
				issues.push("Managed state was applied from different repository content. Run apply.");
			}
		} catch (error) {
			issues.push(`Managed state is invalid: ${error.message}`);
		}
	}

	return issues;
}

function installGroups(manifest) {
	const groups = new Map();
	for (const [name, skill] of Object.entries(manifest.skills)) {
		const harnesses = skillHarnesses(manifest, skill);
		const key = harnesses.join("\0");
		const group = groups.get(key) ?? { harnesses, skills: [] };
		group.skills.push(name);
		groups.set(key, group);
	}
	return [...groups.values()].map((group) => ({
		...group,
		skills: group.skills.sort(),
	}));
}

function managedSkillRoots(manifest, home) {
	return [
		expandHome(manifest.sharedSkillsDirectory, home),
		...Object.values(manifest.harnesses).map((harness) =>
			expandHome(harness.skillsDirectory, home),
		),
	];
}

function isManagedSkillLocation(path, roots) {
	return roots.some((root) => dirname(path) === root && basename(path).length > 0);
}

async function loadState(path) {
	if (!(await pathExists(path))) return undefined;
	try {
		return JSON.parse(await readFile(path, "utf8"));
	} catch (error) {
		fail(`Cannot read managed state ${path}: ${error.message}`);
	}
}

async function applySetup(root, home, manifest, rawManifest, dryRun) {
	const packageSpec = `${manifest.installer.package}@${manifest.installer.version}`;
	for (const group of installGroups(manifest)) {
		const agents = group.harnesses.map(
			(harness) => manifest.harnesses[harness].installerAgent,
		);
		const args = [
			"--yes",
			packageSpec,
			"add",
			root,
			"-g",
			"-y",
			"-s",
			...group.skills,
			"-a",
			...agents,
		];
		console.log(`RUN ${formatCommand("npx", args)}`);
		if (!dryRun) runOrFail("npx", args, { cwd: root, inherit: true, timeout: 300_000 });
	}

	const roots = managedSkillRoots(manifest, home);
	const desiredLocations = new Set();
	for (const [name, skill] of Object.entries(manifest.skills)) {
		for (const location of expectedSkillLocations(manifest, name, skill, home)) {
			desiredLocations.add(location);
		}
	}
	const statePath = expandHome(manifest.stateFile, home);
	const previousState = await loadState(statePath);
	const cleanup = new Set(
		Object.values(previousState?.skills ?? {}).flatMap((skill) => skill.locations ?? []),
	);
	for (const [name, skill] of Object.entries(manifest.skills)) {
		const harnesses = skillHarnesses(manifest, skill);
		if (!sameValues(harnesses, manifest.defaultHarnesses)) {
			cleanup.add(join(expandHome(manifest.sharedSkillsDirectory, home), name));
		}
		for (const [harnessName, harness] of Object.entries(manifest.harnesses)) {
			if (!harnesses.includes(harnessName)) {
				cleanup.add(join(expandHome(harness.skillsDirectory, home), name));
			}
		}
	}
	for (const location of cleanup) {
		if (desiredLocations.has(location) || !(await pathExists(location))) continue;
		if (!isManagedSkillLocation(location, roots)) fail(`Refusing to remove unmanaged path ${location}.`);
		console.log(`REMOVE ${location}`);
		if (!dryRun) await rm(location, { recursive: true, force: true });
	}

	const globalSource = repositoryPath(root, manifest.globalInstructions.source);
	for (const harness of Object.values(manifest.harnesses)) {
		const destination = expandHome(harness.globalInstructions, home);
		console.log(`COPY ${globalSource} -> ${destination}`);
		if (!dryRun) {
			await mkdir(dirname(destination), { recursive: true });
			await cp(globalSource, destination);
		}
	}

	if (dryRun) return;
	const skills = {};
	for (const [name, skill] of Object.entries(manifest.skills)) {
		const candidateLocations = [
			join(expandHome(manifest.sharedSkillsDirectory, home), name),
			...Object.values(manifest.harnesses).map((harness) =>
				join(expandHome(harness.skillsDirectory, home), name),
			),
		];
		skills[name] = {
			harnesses: skillHarnesses(manifest, skill),
			locations: [],
		};
		for (const location of candidateLocations) {
			if (await pathExists(location)) skills[name].locations.push(location);
		}
	}
	const state = {
		schemaVersion: 1,
		appliedAt: new Date().toISOString(),
		sourceHash: await sourceHash(root, rawManifest, manifest),
		skills,
		globalInstructions: Object.fromEntries(
			Object.entries(manifest.harnesses).map(([name, harness]) => [
				name,
				expandHome(harness.globalInstructions, home),
			]),
		),
	};
	await mkdir(dirname(statePath), { recursive: true });
	await writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`);
}

async function replaceDirectory(source, destination, exclusions = []) {
	await rm(destination, { recursive: true, force: true });
	await mkdir(destination, { recursive: true });
	await cp(source, destination, {
		recursive: true,
		preserveTimestamps: true,
		filter: (path) => {
			const relativePath = relative(source, path);
			return !relativePath || !excluded(relativePath, exclusions);
		},
	});
}

async function replaceWorktree(source, destination, exclusions = []) {
	for (const entry of await readdir(destination)) {
		if (entry !== ".git") await rm(join(destination, entry), { recursive: true, force: true });
	}
	for (const entry of await readdir(source)) {
		if (excluded(entry, exclusions)) continue;
		await cp(join(source, entry), join(destination, entry), {
			recursive: true,
			preserveTimestamps: true,
			filter: (path) => {
				const relativePath = relative(source, path);
				return !excluded(relativePath, exclusions);
			},
		});
	}
}

function git(args, cwd) {
	return runOrFail("git", args, { cwd }).trim();
}

async function createWorktree(repository, revision, destination) {
	git(["worktree", "add", "--quiet", "--detach", destination, revision], repository);
}

async function prepareMerge(base, upstream, local, localFiles, tempRoot) {
	const mergeRoot = join(tempRoot, "merge");
	await mkdir(mergeRoot, { recursive: true });
	git(["init", "--quiet"], mergeRoot);
	git(["config", "user.name", "agent-setup"], mergeRoot);
	git(["config", "user.email", "agent-setup@localhost"], mergeRoot);
	await replaceWorktree(base, mergeRoot);
	git(["add", "--all"], mergeRoot);
	git(["commit", "--quiet", "--allow-empty", "-m", "base"], mergeRoot);
	const baseCommit = git(["rev-parse", "HEAD"], mergeRoot);

	git(["switch", "--quiet", "-c", "local"], mergeRoot);
	await replaceWorktree(local, mergeRoot, localFiles);
	git(["add", "--all"], mergeRoot);
	git(["commit", "--quiet", "--allow-empty", "-m", "local"], mergeRoot);
	const localCommit = git(["rev-parse", "HEAD"], mergeRoot);

	git(["switch", "--quiet", "-c", "upstream", baseCommit], mergeRoot);
	await replaceWorktree(upstream, mergeRoot);
	git(["add", "--all"], mergeRoot);
	git(["commit", "--quiet", "--allow-empty", "-m", "upstream"], mergeRoot);
	const result = run("git", ["merge", "--quiet", "--no-edit", localCommit], { cwd: mergeRoot });
	if (!result.ok) return { conflict: true, path: mergeRoot, output: result.output.trim() };
	return { conflict: false, path: mergeRoot };
}

async function restoreLocalFiles(localRoot, upstreamRoot, stagedRoot, skill) {
	const retained = [];
	const claimed = [];
	for (const localFile of skill.localFiles ?? []) {
		const upstreamFile = repositoryPath(upstreamRoot, localFile);
		if (await pathExists(upstreamFile)) {
			claimed.push(localFile);
			continue;
		}
		const source = repositoryPath(localRoot, localFile);
		const destination = repositoryPath(stagedRoot, localFile);
		await mkdir(dirname(destination), { recursive: true });
		await cp(source, destination, { recursive: true, preserveTimestamps: true });
		retained.push(localFile);
	}
	return { retained, claimed };
}

async function ensureRevision(repository, revision) {
	const available = run("git", ["cat-file", "-e", `${revision}^{commit}`], { cwd: repository });
	if (!available.ok) git(["fetch", "--quiet", "origin", revision], repository);
}

async function assertUpdatePathsClean(root, manifest) {
	const paths = [
		manifestName,
		...Object.keys(manifest.skills).map((name) => `skills/${name}`),
		...Object.values(manifest.sources).map((source) => source.licenseFile),
	];
	const output = git(["status", "--porcelain", "--", ...paths], root);
	if (output) fail(`Commit or move changes in update targets before updating:\n${output}`);
}

async function updateVendoredSkills(root, manifest, dryRun) {
	if (!dryRun) await assertUpdatePathsClean(root, manifest);
	const tempRoot = await mkdtemp(join(tmpdir(), "agent-skills-update-"));
	const prepared = [];
	const messages = [];

	try {
		for (const [sourceName, source] of Object.entries(manifest.sources)) {
			const repository = join(tempRoot, sourceName, "repository");
			await mkdir(dirname(repository), { recursive: true });
			git(["clone", "--quiet", "--filter=blob:none", "--no-checkout", source.repo, repository], root);
			git(["fetch", "--quiet", "origin", source.ref], repository);
			const upstreamCommit = git(["rev-parse", "FETCH_HEAD"], repository);

			const license = git(["show", `${upstreamCommit}:${source.upstreamLicensePath}`], repository);
			prepared.push({ type: "file", destination: repositoryPath(root, source.licenseFile), content: `${license}\n` });

			for (const [name, skill] of Object.entries(manifest.skills)) {
				if (skill.origin !== "vendored" || skill.source !== sourceName) continue;
				await ensureRevision(repository, skill.vendoredFrom);
				const upstreamTree = git(["rev-parse", `${upstreamCommit}:${skill.path}`], repository);
				const previousTree = git(["rev-parse", `${skill.vendoredFrom}:${skill.path}`], repository);
				const changed = upstreamTree !== previousTree;
				const worktrees = join(tempRoot, sourceName, name, "worktrees");
				const previousWorktree = join(worktrees, "previous");
				const upstreamWorktree = join(worktrees, "upstream");
				await mkdir(worktrees, { recursive: true });
				await createWorktree(repository, skill.vendoredFrom, previousWorktree);
				await createWorktree(repository, upstreamCommit, upstreamWorktree);
				const base = join(previousWorktree, skill.path);
				const upstream = join(upstreamWorktree, skill.path);
				const local = join(root, "skills", name);
				const staged = join(tempRoot, sourceName, name, "staged");

				if (skill.modified) {
					const merge = await prepareMerge(
						base,
						upstream,
						local,
						skill.localFiles ?? [],
						join(tempRoot, sourceName, name),
					);
					if (merge.conflict) {
						fail(
							`Update conflict in ${name}. The repository is unchanged. Resolve the merge in ${merge.path}.\n${merge.output}`,
						);
					}
					await replaceDirectory(merge.path, staged, [".git"]);
				} else {
					await replaceDirectory(upstream, staged);
				}

				const { retained, claimed } = await restoreLocalFiles(local, upstream, staged, skill);
				if (claimed.length > 0) {
					messages.push(`${name}: upstream now owns ${claimed.join(", ")}; kept upstream copies.`);
				}
				if (retained.length > 0) skill.localFiles = retained;
				else delete skill.localFiles;

				const differences = await compareDirectories(upstream, staged, retained);
				skill.modified = differences.length > 0;
				if (!skill.modified) delete skill.note;
				skill.vendoredFrom = upstreamCommit;
				prepared.push({ type: "directory", destination: local, source: staged });
				messages.push(`${name}: ${changed ? "upstream tree changed" : "upstream tree unchanged"}.`);
			}
		}

		if (dryRun) {
			for (const message of messages) console.log(`PLAN ${message}`);
			console.log(`PLAN write ${manifestName} with refreshed upstream commits.`);
			return;
		}

		for (const item of prepared) {
			if (item.type === "directory") await replaceDirectory(item.source, item.destination);
			else {
				await mkdir(dirname(item.destination), { recursive: true });
				await writeFile(item.destination, item.content);
			}
		}
		await writeFile(join(root, manifestName), `${JSON.stringify(manifest, null, 2)}\n`);
		for (const message of messages) console.log(`UPDATED ${message}`);
	} catch (error) {
		if (error instanceof SetupError && error.message.includes("Update conflict")) throw error;
		await rm(tempRoot, { recursive: true, force: true });
		throw error;
	}

	await rm(tempRoot, { recursive: true, force: true });
}

async function main() {
	const { command, options } = parseArguments(process.argv.slice(2));
	if (command === "help" || command === "--help" || command === "-h") {
		printUsage();
		return;
	}

	const repository = await checkRepository(options.root);
	printCheck("repository", repository.issues);
	if (repository.issues.length > 0) process.exitCode = 1;

	if (command === "check") {
		if (!options.repositoryOnly && options.machine) {
			const issues = await checkMachine(
				options.root,
				options.home,
				repository.manifest,
				repository.raw,
			);
			printCheck("machine", issues);
			if (issues.length > 0) process.exitCode = 1;
		}
		return;
	}

	if (repository.issues.length > 0) return;
	if (command === "apply") {
		await applySetup(
			options.root,
			options.home,
			repository.manifest,
			repository.raw,
			options.dryRun,
		);
		if (!options.dryRun) {
			const updated = await readManifest(options.root);
			const issues = await checkMachine(
				options.root,
				options.home,
				updated.manifest,
				updated.raw,
			);
			printCheck("machine", issues);
			if (issues.length > 0) process.exitCode = 1;
		}
		return;
	}

	if (command === "update") {
		await updateVendoredSkills(options.root, repository.manifest, options.dryRun);
		if (!options.dryRun) {
			const updated = await checkRepository(options.root);
			printCheck("updated repository", updated.issues);
			if (updated.issues.length > 0) process.exitCode = 1;
		}
		return;
	}

	fail(`Unknown command: ${command}`);
}

main().catch((error) => {
	console.error(error instanceof SetupError ? error.message : error.stack);
	process.exitCode = 1;
});
