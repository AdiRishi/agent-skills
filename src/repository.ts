import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { type Config, skillHarnesses } from "./config.ts";

export async function checkRepository({ root, config }: { root: string; config: Config }) {
	const issues: string[] = [];
	const directories = (await readdir(join(root, "skills"), { withFileTypes: true }))
		.filter((entry) => entry.isDirectory())
		.map((entry) => entry.name);

	for (const name of directories) {
		if (!config.skills[name]) issues.push(`skills/${name} has no entry in dotagents.config.ts.`);
	}
	for (const name of Object.keys(config.skills)) {
		if (!directories.includes(name)) {
			issues.push(`dotagents.config.ts lists ${name}, but skills/${name} does not exist.`);
		}
	}

	for (const [name, harness] of Object.entries(config.harnesses)) {
		if (harness.instructionsSection && !existsSync(join(root, harness.instructionsSection))) {
			issues.push(`The ${name} instructions section ${harness.instructionsSection} does not exist.`);
		}
	}

	const readme = await readFile(join(root, "README.md"), "utf8");
	for (const name of directories) {
		issues.push(...(await checkSkill({ root, config, name })));
		if (!readme.includes(`](skills/${name})`)) {
			issues.push(`README.md does not list skills/${name}.`);
		}
	}

	issues.push(...(await brokenLinks(root)));
	return issues;
}

async function checkSkill({ root, config, name }: { root: string; config: Config; name: string }) {
	const issues: string[] = [];
	const skillRoot = join(root, "skills", name);
	const documentPath = join(skillRoot, "SKILL.md");
	if (!existsSync(documentPath)) return [`skills/${name} has no SKILL.md.`];

	const frontmatter = parseFrontmatter(await readFile(documentPath, "utf8"));
	if (frontmatter("name") !== name) {
		issues.push(`skills/${name}/SKILL.md declares the name ${frontmatter("name") ?? "<missing>"}.`);
	}
	if (!frontmatter("description")) issues.push(`skills/${name}/SKILL.md has no description.`);

	const skill = config.skills[name];
	const targetsCodex = skill !== undefined && skillHarnesses(config, skill).includes("codex");
	const metadataPath = join(skillRoot, "agents", "openai.yaml");
	if (!existsSync(metadataPath)) {
		if (targetsCodex) issues.push(`skills/${name} targets Codex but has no agents/openai.yaml.`);
		return issues;
	}

	const metadata = await readFile(metadataPath, "utf8");
	const shortDescription = /^\s*short_description:\s*["']?(.+?)["']?\s*$/mu.exec(metadata)?.[1];
	if (!shortDescription || shortDescription.length < 25 || shortDescription.length > 64) {
		issues.push(`skills/${name}/agents/openai.yaml needs a short_description of 25 to 64 characters.`);
	}
	const userInvoked = frontmatter("disable-model-invocation") === "true";
	if (/^\s*allow_implicit_invocation:\s*false\s*$/mu.test(metadata) !== userInvoked) {
		issues.push(
			`skills/${name}: disable-model-invocation in SKILL.md and allow_implicit_invocation in agents/openai.yaml disagree.`,
		);
	}
	return issues;
}

function parseFrontmatter(document: string) {
	const block = /^---\r?\n([\s\S]*?)\r?\n---/u.exec(document)?.[1] ?? "";
	return (key: string) =>
		new RegExp(`^${key}:\\s*(.+)$`, "mu")
			.exec(block)?.[1]
			?.trim()
			.replace(/^(["'])(.*)\1$/u, "$2");
}

async function brokenLinks(root: string) {
	const issues: string[] = [];
	for (const file of await markdownFiles(root)) {
		const content = withoutFencedCode(await readFile(file, "utf8"));
		for (const [, link = ""] of content.matchAll(/\]\(([^)]+)\)/gu)) {
			const target = link.replace(/^<|>$/gu, "").split("#", 1)[0] ?? "";
			if (!target || /^(?:[a-z]+:|\$|\/)/iu.test(target)) continue;
			if (!existsSync(resolve(dirname(file), decodeURIComponent(target)))) {
				issues.push(`${relative(root, file)} links to the missing path ${target}.`);
			}
		}
	}
	return issues;
}

async function markdownFiles(directory: string): Promise<string[]> {
	const files: string[] = [];
	for (const entry of await readdir(directory, { withFileTypes: true })) {
		if (entry.name === ".git" || entry.name === "node_modules") continue;
		const path = join(directory, entry.name);
		if (entry.isDirectory()) files.push(...(await markdownFiles(path)));
		else if (entry.isFile() && entry.name.endsWith(".md")) files.push(path);
	}
	return files;
}

function withoutFencedCode(markdown: string) {
	let fence: { character: string; length: number } | undefined;
	return markdown
		.split(/\r?\n/u)
		.map((line) => {
			const marker = /^ {0,3}(`{3,}|~{3,})/u.exec(line)?.[1];
			if (!fence) {
				if (!marker) return line;
				fence = { character: marker.charAt(0), length: marker.length };
				return "";
			}
			const closesFence =
				marker !== undefined &&
				marker.charAt(0) === fence.character &&
				marker.length >= fence.length &&
				line.slice(line.indexOf(marker) + marker.length).trim() === "";
			if (closesFence) fence = undefined;
			return "";
		})
		.join("\n");
}
