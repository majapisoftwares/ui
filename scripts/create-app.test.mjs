import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, readFile, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, URL } from "node:url";
import { spawnSync } from "node:child_process";

test("starter creates an independent project and refuses to overwrite it", async () => {
  const directory = await mkdtemp(join(tmpdir(), "workbench-starter-"));
  const destination = join(directory, "sample-app");
  const script = fileURLToPath(new URL("./create-app.mjs", import.meta.url));
  const first = spawnSync(process.execPath, [script, destination], {
    encoding: "utf8",
  });
  assert.equal(first.status, 0, first.stderr);
  const pkg = JSON.parse(
    await readFile(join(destination, "package.json"), "utf8"),
  );
  const lock = JSON.parse(
    await readFile(join(destination, "package-lock.json"), "utf8"),
  );
  assert.equal(pkg.name, "sample-app");
  assert.equal(lock.name, pkg.name);
  assert.equal(lock.packages[""].name, pkg.name);
  assert.equal(pkg.dependencies.next, "16.4.3");
  assert.ok(
    pkg.dependencies["@workbench/ui"].startsWith(
      "https://codeload.github.com/",
    ),
  );
  for (const route of ["dashboard", "login", "signup"])
    assert.ok(
      await readFile(join(destination, "src/app", route, "page.tsx"), "utf8"),
    );
  assert.ok(
    await readFile(join(destination, ".github/workflows/validate.yml"), "utf8"),
  );
  assert.ok(
    (await readFile(join(destination, "AGENTS.md"), "utf8")).includes(
      "contribua primeiro",
    ),
  );
  assert.ok(!(await readdir(destination)).includes("node_modules"));
  const second = spawnSync(process.execPath, [script, destination], {
    encoding: "utf8",
  });
  assert.notEqual(second.status, 0);
  assert.ok(second.stderr.includes("already exists"));
  assert.equal(
    JSON.parse(await readFile(join(destination, "package.json"), "utf8")).name,
    pkg.name,
  );
});
