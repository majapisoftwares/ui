import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
const pkg = JSON.parse(await readFile("package.json", "utf8"));
const gitSha = execFileSync("git", ["rev-parse", "HEAD"], {
  encoding: "utf8",
}).trim();
await mkdir("public", { recursive: true });
await writeFile(
  "public/release.json",
  JSON.stringify(
    {
      package: pkg.name,
      version: pkg.version,
      gitSha,
      builtAt: new Date().toISOString(),
    },
    null,
    2,
  ) + "\n",
);
