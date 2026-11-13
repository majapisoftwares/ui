// Everything CI checks for the library, in one command. CI
// (.github/workflows/validate.yml) runs only this, after `npm ci`; run it
// before every push, so a push never finds a failure in CI first. It stops at
// the first failure. The starter (starters/next-app) has its own
// `npm run verify`, run last here when its dependencies are installed.
// `npm run verify lint build` runs only those steps.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
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
  ["typecheck", "npm run typecheck"],
  ["test:preferences", "npm run test:preferences"],
  ["test:data-table", "npm run test:data-table"],
  ["lint", "npm run lint"],
  ["check:standards", "npm run check:standards"],
  ["build", "npm run build"],
  ["test:starter", "npm run test:starter"],
  ["catalog:lint", "npm run lint -w catalog"],
  ["catalog:typecheck", "npm run typecheck -w catalog"],
  ["catalog:check-ui", "npm run check:ui -w catalog"],
  ["starter", "npm run verify", { cwd: "starters/next-app", needs: "starters/next-app/node_modules" }],
];

const only = process.argv.slice(2);
dependenciesCurrent();
for (const [name, command, options = {}] of steps) {
  if (only.length && !only.includes(name)) continue;
  if (options.needs && !existsSync(options.needs)) {
    if (process.env.CI) continue; // CI checks the starter in its own job.
    console.error(`\n✖ ${name}: install its dependencies first (npm ci in ${options.cwd}).`);
    process.exit(1);
  }
  if (options.cwd) dependenciesCurrent(options.cwd);
  console.log(`\n▶ ${name}`);
  const started = Date.now();
  const result = spawnSync(command, { stdio: "inherit", shell: true, cwd: options.cwd });
  if (result.status !== 0) {
    console.error(`\n✖ ${name} failed: CI would fail there too.`);
    process.exit(result.status ?? 1);
  }
  console.log(`✔ ${name} (${Math.round((Date.now() - started) / 1000)} s)`);
}
console.log("\nEverything CI checks passed.");
