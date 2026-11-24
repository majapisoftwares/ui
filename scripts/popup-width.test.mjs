// Regression: a Select opened inside a Field (e.g. in a dialog) stretched to the
// whole window, because Field's `*:w-full` also matched the popup that ui-sdk
// renders in place (position: fixed, so 100% was the viewport). Popups carry the
// `popover` attribute; no child-wide width rule may reach them.
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const dir = "src/components/ui";

test("no component forces the width of every child, popups included", () => {
  const offenders = [];
  for (const file of readdirSync(dir).filter((name) => name.endsWith(".tsx"))) {
    const source = readFileSync(join(dir, file), "utf8");
    for (const match of source.matchAll(
      /(?:^|[\s"'`:])\*:(?:w-[^\s"'`]+|min-w-[^\s"'`]+|max-w-[^\s"'`]+)/g,
    )) {
      offenders.push(`${file}: ${match[0].trim()}`);
    }
  }
  assert.deepEqual(
    offenders,
    [],
    "use [&>:not([popover])]:w-… so popups keep their own width",
  );
});

test("Field keeps child widths away from popups", () => {
  const source = readFileSync(join(dir, "field.tsx"), "utf8");
  assert.match(source, /\[&>:not\(\[popover\]\)\]:w-full/);
});
