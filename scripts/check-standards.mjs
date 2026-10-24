import { readdir, readFile } from "node:fs/promises";
import { resolve, relative } from "node:path";
const consumer = process.argv[2];
const root = resolve(consumer ?? "src");
const violations = [];
async function visit(path) {
  for (const entry of await readdir(path, { withFileTypes: true })) {
    if (["node_modules", "dist", ".git"].includes(entry.name)) continue;
    const file = resolve(path, entry.name);
    if (entry.isDirectory()) {
      await visit(file);
      continue;
    }
    if (!/\.[jt]sx?$/.test(entry.name)) continue;
    const text = await readFile(file, "utf8"),
      name = relative(root, file).replaceAll("\\", "/");
    if (/from\s+["'](?:radix-ui|@radix-ui\/)/.test(text))
      violations.push(`${name}: the Workbench foundation uses Base UI`);
    if (!consumer && name.startsWith("components/ui/")) continue;
    if (consumer && /(?:^|\/)components\/ui\//.test(name))
      violations.push(`${name}: local UI primitive copies are forbidden`);
    if (/components\/native-select|<NativeSelect\b/.test(text))
      violations.push(`${name}: use Select (Base UI), not a native select`);
    if (/<(?:button|input|select|table|dialog)(?:\s|>)/.test(text))
      violations.push(`${name}: use the shared UI primitive`);
    if (
      /(?:bg|text|border)-(?:red|blue|green|orange|gray|slate|zinc)-\d|(?:bg|text|border)-\[#[a-f\d]/i.test(
        text,
      )
    )
      violations.push(`${name}: use semantic tokens instead of local colors`);
    if (!consumer && /from ["']@\//.test(text))
      violations.push(`${name}: library internals must use portable imports`);
  }
}
await visit(root);
if (violations.length) {
  console.error(violations.join("\n"));
  process.exitCode = 1;
} else
  console.log(`UI standards passed (${consumer ? "consumer" : "library"}).`);
