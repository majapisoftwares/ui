import assert from "node:assert/strict";
import { test } from "node:test";
import { JSDOM } from "jsdom";
import { createElement, act, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { DataTable } from "../src/patterns/data-table";

test("a concurrently mounted table preserves paging and resets after committed data replacement", async t => {
  const dom = new JSDOM('<html><body><div id="root"></div></body></html>', { url: "https://example.test", pretendToBeVisual: true });
  const descriptors = new Map<string, PropertyDescriptor | undefined>();
  for (const key of ["window", "document", "navigator", "HTMLElement", "Element", "Node", "MutationObserver", "getComputedStyle", "requestAnimationFrame", "cancelAnimationFrame", "IS_REACT_ACT_ENVIRONMENT"]) {
    descriptors.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    let value = key === "IS_REACT_ACT_ENVIRONMENT" ? true : dom.window[key as keyof typeof dom.window];
    if (typeof value === "function" && ["getComputedStyle", "requestAnimationFrame", "cancelAnimationFrame"].includes(key)) value = value.bind(dom.window);
    Object.defineProperty(globalThis, key, { configurable: true, value });
  }
  const errors: string[] = [];
  t.mock.method(console, "error", (...args: unknown[]) => errors.push(args.map(String).join(" ")));
  const root = createRoot(dom.window.document.getElementById("root")!);
  const columns = [{ accessorKey: "name", header: "Name" }];
  const records = Array.from({ length: 25 }, (_, i) => ({ name: `Record ${i}` }));
  const render = (data: typeof records) => createElement(StrictMode, null, createElement(Suspense, { fallback: null }, createElement(DataTable, { columns, data, initialPageSize: 10 })));
  try {
    await act(async () => { root.render(render(records)); });
    const next = [...dom.window.document.querySelectorAll("button")].find(b => b.textContent?.includes("Next page"));
    assert.ok(next);
    await act(async () => { next.click(); });
    assert.ok(dom.window.document.body.textContent?.includes("Page 2 of 3"));
    await act(async () => { root.render(render(records.slice(0, 5))); });
    assert.ok(dom.window.document.body.textContent?.includes("Page 1 of 1"));
    assert.equal(errors.filter(e => /hasn't mounted|not.*mounted|state update.*render/i.test(e)).length, 0, errors.join("\n"));
  } finally {
    await act(async () => root.unmount()); dom.window.close();
    for (const [key, descriptor] of descriptors) { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else Reflect.deleteProperty(globalThis, key); }
  }
});
