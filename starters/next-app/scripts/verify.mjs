// Everything CI checks, in one command. CI (.github/workflows/validate.yml)
// runs only this, after `npm ci`; run it before every push, so a push never
// finds a failure in CI first. It stops at the first failure.
// Add the app's own checks here (tests, e2e), with the environment CI gives
// them, and never only to the workflow. `npm run verify lint build` runs only
// those steps.
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// CI installs exactly the lockfile; other versions installed here would check something else.
function dependenciesCurrent(dir = ".") {
  const packages = (file) => {
    try {
      return JSON.parse(readFileSync(join(dir, file), "utf8")).packages ?? {};
    } catch {
      return null;
    }
  };
  const locked = packages("package-lock.json") ?? {};
  const installed = packages("node_modules/.package-lock.json");
  const stale =
    !installed ||
    Object.entries(locked).some(
      ([path, entry]) => path.startsWith("node_modules/") && !entry.link && (installed[path] ? installed[path].version !== entry.version : !entry.optional),
    );
  if (stale) {
    console.error(`✖ The installed dependencies${dir === "." ? "" : ` in ${dir}`} don't match package-lock.json: run npm ci${dir === "." ? "" : " there"} first.`);
    process.exit(1);
  }
}

const steps = [
  ["lint", "npm run lint", {}],
  ["typecheck", "npm run typecheck", {}],
  ["check:ui", "npm run check:ui", {}],
  ["build", "npm run build", {}],
];

const only = process.argv.slice(2);
dependenciesCurrent();
for (const [name, command, env] of steps) {
  if (only.length && !only.includes(name)) continue;
  console.log(`\n▶ ${name}`);
  const started = Date.now();
  const result = spawnSync(command, { stdio: "inherit", shell: true, env: { ...process.env, ...env } });
  if (result.status !== 0) {
    console.error(`\n✖ ${name} failed: CI would fail there too.`);
    process.exit(result.status ?? 1);
  }
  console.log(`✔ ${name} (${Math.round((Date.now() - started) / 1000)} s)`);
}
console.log("\nEverything CI checks passed.");
