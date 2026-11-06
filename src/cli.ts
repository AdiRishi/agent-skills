import { homedir } from "node:os";
import { fileURLToPath } from "node:url";
import config from "../dotagents.config.ts";
import { apply, checkMachine, machineHarnesses } from "./machine.ts";
import { checkRepository } from "./repository.ts";

const usage = `Usage: node src/cli.ts <command>

Commands:
  check              Validate the repository
  check --machine    Validate the repository and this machine's installed copy
  apply              Install skills and global instructions on this machine
  apply --dry-run    Print what apply would change`;

const root = fileURLToPath(new URL("..", import.meta.url));
const home = homedir();

function report(label: string, issues: string[]) {
	if (issues.length === 0) {
		console.log(`PASS ${label}`);
		return;
	}
	console.log(`FAIL ${label}`);
	for (const issue of issues) console.log(`  - ${issue}`);
	process.exitCode = 1;
}

const [command, ...flags] = process.argv.slice(2);
const flag = flags.join(" ");

if (command === "check" && (flag === "" || flag === "--machine")) {
	report("repository", await checkRepository({ root, config }));
	if (flag === "--machine") {
		console.log(`Harnesses: ${(await machineHarnesses({ config, home })).join(", ")}`);
		report("machine", await checkMachine({ root, config, home }));
	}
} else if (command === "apply" && (flag === "" || flag === "--dry-run")) {
	const issues = await checkRepository({ root, config });
	report("repository", issues);
	if (issues.length === 0) {
		console.log(`Harnesses: ${(await machineHarnesses({ config, home })).join(", ")}`);
		await apply({ root, config, home, dryRun: flag === "--dry-run", log: console.log });
		if (flag === "") report("machine", await checkMachine({ root, config, home }));
	}
} else {
	console.log(usage);
	if (command !== undefined && command !== "help") process.exitCode = 1;
}
