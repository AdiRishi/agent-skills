import assert from "node:assert/strict";
import test from "node:test";
import { defineConfig, skillHarnesses } from "../src/config.ts";

const harnesses = {
	claude: { skills: "~/.claude/skills", instructions: "~/.claude/CLAUDE.md" },
	codex: { skills: "~/.codex/skills", instructions: "~/.codex/AGENTS.md" },
} as const;

test("a skill without harnesses installs into the default harnesses", () => {
	const config = defineConfig({
		harnesses,
		defaultHarnesses: ["claude"],
		skills: { shared: {}, "codex-only": { harnesses: ["codex"] } },
	});

	assert.deepEqual(skillHarnesses(config, config.skills["shared"] ?? {}), ["claude"]);
	assert.deepEqual(skillHarnesses(config, config.skills["codex-only"] ?? {}), ["codex"]);
});

test("a harness name the config does not declare fails the type check", () => {
	defineConfig({
		harnesses,
		// @ts-expect-error `codx` is not a declared harness.
		defaultHarnesses: ["codx"],
		skills: {
			// @ts-expect-error `cursor` is not a declared harness.
			shared: { harnesses: ["cursor"] },
		},
	});
});
