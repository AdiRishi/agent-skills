import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { cp, mkdir, readdir, readFile, readlink, rm, writeFile } from "node:fs/promises";
import { dirname, join, relative, sep } from "node:path";
import { type Config, skillHarnesses } from "./config.ts";

/** Marks a skill directory that `apply` installed, so it can be removed once it leaves the config. */
export const MARKER = ".dotagents";

interface Target {
	harness: string;
	skillsDirectory: string;
	skills: string[];
	instructionsPath: string;
	instructions: string;
}

interface Machine {
	root: string;
	config: Config;
	home: string;
}

export function machineSettingsPath(home: string) {
	return join(home, ".config", "dotagents", "machine.json");
}

/** Reads the harnesses this machine runs. Without machine settings, it runs every harness. */
export async function machineHarnesses({ config, home }: Omit<Machine, "root">) {
	const known = Object.keys(config.harnesses);
	const path = machineSettingsPath(home);
	if (!existsSync(path)) return known;

	const settings: unknown = JSON.parse(await readFile(path, "utf8"));
	const listed: unknown =
		typeof settings === "object" && settings !== null && "harnesses" in settings
			? settings.harnesses
			: undefined;
	const names: unknown[] = Array.isArray(listed) ? listed : [];
	const harnesses = names.filter(
		(name): name is string => typeof name === "string" && known.includes(name),
	);
	if (!Array.isArray(listed) || harnesses.length !== names.length) {
		throw new Error(`${path} must set "harnesses" to a list of names from: ${known.join(", ")}.`);
	}
	return harnesses;
}

async function targets({ root, config, home }: Machine): Promise<Target[]> {
	const global = (await readFile(join(root, "global", "AGENTS.md"), "utf8")).trim();
	const used = await machineHarnesses({ config, home });
	return Promise.all(
		Object.entries(config.harnesses)
			.filter(([name]) => used.includes(name))
			.map(async ([name, harness]) => {
				const section = harness.instructionsSection
					? (await readFile(join(root, harness.instructionsSection), "utf8")).trim()
					: undefined;
				return {
					harness: name,
					skillsDirectory: expandHome(harness.skills, home),
					skills: Object.entries(config.skills)
						.filter(([, skill]) => skillHarnesses(config, skill).includes(name))
						.map(([skill]) => skill),
					instructionsPath: expandHome(harness.instructions, home),
					instructions: `${section ? `${global}\n\n${section}` : global}\n`,
				};
			}),
	);
}

export async function apply({
	dryRun,
	log,
	...machine
}: Machine & { dryRun: boolean; log: (line: string) => void }) {
	for (const target of await targets(machine)) {
		for (const skill of target.skills) {
			const destination = join(target.skillsDirectory, skill);
			log(`COPY skills/${skill} -> ${destination}`);
			if (dryRun) continue;
			await rm(destination, { recursive: true, force: true });
			await cp(join(machine.root, "skills", skill), destination, { recursive: true });
			await writeFile(
				join(destination, MARKER),
				`Installed by dotagents from ${machine.root}. Edit the repository, then run apply.\n`,
			);
		}

		for (const skill of await staleSkills(target)) {
			const path = join(target.skillsDirectory, skill);
			log(`REMOVE ${path}`);
			if (!dryRun) await rm(path, { recursive: true, force: true });
		}

		log(`WRITE ${target.instructionsPath}`);
		if (!dryRun) {
			await mkdir(dirname(target.instructionsPath), { recursive: true });
			await writeFile(target.instructionsPath, target.instructions);
		}
	}
}

export async function checkMachine(machine: Machine) {
	const issues: string[] = [];
	for (const target of await targets(machine)) {
		const { instructionsPath } = target;
		if (!existsSync(instructionsPath)) {
			issues.push(`${instructionsPath} is missing.`);
		} else if ((await readFile(instructionsPath, "utf8")) !== target.instructions) {
			issues.push(`${instructionsPath} differs from the repository.`);
		}

		for (const skill of target.skills) {
			const installed = join(target.skillsDirectory, skill);
			if (!existsSync(join(installed, MARKER))) {
				issues.push(`${installed} was not installed by dotagents.`);
				continue;
			}
			const differences = await compareDirectories(join(machine.root, "skills", skill), installed);
			if (differences.length > 0) {
				issues.push(`${installed} differs from the repository: ${differences.join(", ")}.`);
			}
		}

		for (const skill of await staleSkills(target)) {
			issues.push(`${join(target.skillsDirectory, skill)} is no longer configured for ${target.harness}.`);
		}
	}
	return issues;
}

async function staleSkills({ skillsDirectory, skills }: Target) {
	if (!existsSync(skillsDirectory)) return [];
	return (await readdir(skillsDirectory, { withFileTypes: true }))
		.filter(
			(entry) =>
				entry.isDirectory() &&
				!skills.includes(entry.name) &&
				existsSync(join(skillsDirectory, entry.name, MARKER)),
		)
		.map((entry) => entry.name);
}

async function compareDirectories(expected: string, actual: string) {
	const [expectedFiles, actualFiles] = await Promise.all([fingerprint(expected), fingerprint(actual)]);
	return [...new Set([...expectedFiles.keys(), ...actualFiles.keys()])]
		.filter((path) => expectedFiles.get(path) !== actualFiles.get(path))
		.sort();
}

async function fingerprint(root: string) {
	const files = new Map<string, string>();
	for (const entry of await readdir(root, { recursive: true, withFileTypes: true })) {
		if (entry.name === MARKER || entry.name === ".DS_Store") continue;
		const path = join(entry.parentPath, entry.name);
		const key = relative(root, path).split(sep).join("/");
		if (entry.isSymbolicLink()) files.set(key, `link:${await readlink(path)}`);
		else if (entry.isFile()) {
			files.set(key, createHash("sha256").update(await readFile(path)).digest("hex"));
		}
	}
	return files;
}

function expandHome(path: `~/${string}`, home: string) {
	return join(home, path.slice(2));
}
