import assert from "node:assert/strict";
import { test } from "node:test";
import { parseStack } from "../src/patterns/chat-trace";
import { fileTree } from "../src/patterns/file-tree";
import { formatTokens } from "../src/patterns/chat-context";

test("a stack splits into the error, your frames and the framework's", () => {
  const { error, frames } = parseStack(`TypeError: x is undefined
    at formatInvoice (app/lib/billing.ts:42:31)
    at renderWithHooks (node_modules/react-dom/cjs/react-dom.development.js:14985:18)
    at <anonymous>`);
  assert.equal(error, "TypeError: x is undefined");
  assert.deepEqual(frames[0], {
    line: "at formatInvoice (app/lib/billing.ts:42:31)",
    name: "formatInvoice",
    file: "app/lib/billing.ts",
    lineNumber: "42",
    internal: false,
  });
  assert.equal(frames[1].internal, true);
  assert.equal(
    frames[2].file,
    undefined,
    "a frame without a location stays a line",
  );
});

test("paths become a tree, folders shared", () => {
  assert.deepEqual(fileTree(["app/page.tsx", "app/layout.tsx", "README.md"]), [
    {
      type: "folder",
      name: "app",
      path: "app",
      children: [
        { type: "file", name: "page.tsx", path: "app/page.tsx" },
        { type: "file", name: "layout.tsx", path: "app/layout.tsx" },
      ],
    },
    { type: "file", name: "README.md", path: "README.md" },
  ]);
});

test("token counts read short", () => {
  assert.deepEqual(
    [
      formatTokens(980),
      formatTokens(1000),
      formatTokens(8420),
      formatTokens(128000),
    ],
    ["980", "1k", "8.4k", "128k"],
  );
});
