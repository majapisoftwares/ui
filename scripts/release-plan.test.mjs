import assert from "node:assert/strict";
import test from "node:test";
import { planBump } from "./release-plan.mjs";

test("docs, CI and catalog changes publish nothing", () => {
  assert.equal(
    planBump(
      [".github/workflows/release.yml", "docs/a.md", "catalog/x.tsx"],
      ["feat: x"],
    ),
    "none",
  );
});
test("untyped or fix commits on src are a patch", () => {
  assert.equal(
    planBump(["src/a.tsx"], ["Chat: fullWidth drops the column", ""]),
    "patch",
  );
  assert.equal(planBump(["src/a.tsx"], ["fix(chat): scroll"]), "patch");
});
test("feat is a minor, breaking is a major", () => {
  assert.equal(planBump(["src/a.tsx"], ["fix: a", "feat(table): b"]), "minor");
  assert.equal(planBump(["src/a.tsx"], ["feat!: b"]), "major");
  assert.equal(planBump(["src/a.tsx"], ["x", "BREAKING CHANGE: y"]), "major");
});
