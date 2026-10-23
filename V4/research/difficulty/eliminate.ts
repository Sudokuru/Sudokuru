/** Record a manual decision from saved results; this command never trains models. */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { captureElimination, ELIMINATION_REGISTRY_PATH, recordElimination } from "./eliminations";

const usage = "bun V4/research/difficulty/eliminate.ts <experiment/family> --reason <text> [--results directory] [--registry file]";
const args = process.argv.slice(2);
if (args.length === 1 && args[0] === "--help") {
  console.log(usage);
} else {
  const procedure = args.shift();
  if (!procedure || procedure.startsWith("--")) throw new Error(usage);
  let reason: string | undefined;
  let directory = "V4/docs/difficulty/results";
  let registry = ELIMINATION_REGISTRY_PATH;
  for (let i = 0; i < args.length; i++) {
    const option = args[i];
    if (!["--reason", "--results", "--registry"].includes(option)) throw new Error(`Unknown option: ${option}. ${usage}`);
    const value = args[++i];
    if (!value || value.startsWith("--")) throw new Error(`${option} requires a value. ${usage}`);
    if (option === "--reason") reason = value;
    if (option === "--results") directory = value;
    if (option === "--registry") registry = resolve(value);
  }
  if (!reason?.trim()) throw new Error(`--reason is required. ${usage}`);
  const results: unknown = JSON.parse(readFileSync(resolve(directory, "results.json"), "utf8"));
  const benchmarks: unknown = JSON.parse(readFileSync(resolve(directory, "benchmarks.json"), "utf8"));
  recordElimination(captureElimination(results, benchmarks, procedure, reason), registry);
  console.log(`Eliminated ${procedure}; measurements saved in ${registry}. Run bun V4/research/difficulty/run.ts to refresh the report.`);
}
