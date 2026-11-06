export interface Harness {
	/** The directory the harness loads user skills from. */
	skills: `~/${string}`;
	/** The global instruction file the harness reads. */
	instructions: `~/${string}`;
	/** A repository file appended to `global/AGENTS.md` for this harness only. */
	instructionsSection?: string;
}

export interface Skill<H extends string> {
	/** Defaults to `defaultHarnesses`. */
	harnesses?: readonly NoInfer<H>[];
	/** The upstream folder at the commit this copy was taken from. Absent for skills written here. */
	upstream?: `https://github.com/${string}/tree/${string}`;
	/** What this copy changes relative to `upstream`. Updates must keep these changes. */
	changes?: string;
}

export interface Config<H extends string = string> {
	harnesses: Record<H, Harness>;
	defaultHarnesses: readonly NoInfer<H>[];
	skills: Record<string, Skill<H>>;
}

export function defineConfig<const H extends string>(config: Config<H>): Config<H> {
	return config;
}

export function skillHarnesses(config: Config, skill: Skill<string>): readonly string[] {
	return skill.harnesses ?? config.defaultHarnesses;
}
