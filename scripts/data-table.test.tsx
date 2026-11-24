import assert from "node:assert/strict";
import { test } from "node:test";
import { JSDOM } from "jsdom";
import { createElement, act, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { DataTable, DataTableRowAction } from "../src/patterns/data-table";

test("a concurrently mounted table preserves paging and resets after committed data replacement", async t => {
  const dom = new JSDOM('<html><body><div id="root"></div></body></html>', { url: "https://example.test", pretendToBeVisual: true });
  const descriptors = new Map<string, PropertyDescriptor | undefined>();
  for (const key of ["window", "document", "navigator", "HTMLElement", "Element", "Node", "MutationObserver", "NodeFilter", "HTMLFieldSetElement", "HTMLFormElement", "HTMLInputElement", "HTMLButtonElement", "HTMLTextAreaElement", "HTMLSelectElement", "HTMLAnchorElement", "SVGElement", "Event", "KeyboardEvent", "MouseEvent", "PointerEvent", "FocusEvent", "CustomEvent", "DOMRect", "ResizeObserver", "IntersectionObserver", "CSS", "getComputedStyle", "requestAnimationFrame", "cancelAnimationFrame", "IS_REACT_ACT_ENVIRONMENT"]) {
    descriptors.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    let value = key === "IS_REACT_ACT_ENVIRONMENT" ? true : dom.window[key as keyof typeof dom.window];
    if (typeof value === "function" && ["getComputedStyle", "requestAnimationFrame", "cancelAnimationFrame"].includes(key)) value = value.bind(dom.window);
    Object.defineProperty(globalThis, key, { configurable: true, value });
  }
  // jsdom has no ResizeObserver; the table's ScrollArea needs one.
  Object.defineProperty(globalThis, "ResizeObserver", { configurable: true, value: class { observe() {} unobserve() {} disconnect() {} } });
  const errors: string[] = [];
  t.mock.method(console, "error", (...args: unknown[]) => errors.push(args.map(String).join(" ")));
  const root = createRoot(dom.window.document.getElementById("root")!);
  const columns = [{ accessorKey: "name", header: "Name" }];
  const records = Array.from({ length: 25 }, (_, i) => ({ name: `Record ${i}` }));
  const render = (data: typeof records, manualPagination = false) => createElement(StrictMode, null, createElement(Suspense, { fallback: null }, createElement(DataTable, { columns, data, initialPageSize: 10, manualPagination, rowCount: manualPagination ? 25 : undefined })));
  try {
    await act(async () => { root.render(render(records)); });
    const next = [...dom.window.document.querySelectorAll("button")].find(b => b.textContent?.includes("Next page"));
    assert.ok(next);
    await act(async () => { next.click(); });
    assert.ok(dom.window.document.body.textContent?.includes("Page 2 of 3"));
    await act(async () => { root.render(render(records.slice(0, 5))); });
    assert.ok(dom.window.document.body.textContent?.includes("Page 1 of 1"));
    await act(async () => { root.render(render(records, true)); });
    const manualNext = [...dom.window.document.querySelectorAll("button")].find(b => b.textContent?.includes("Next page"))!;
    await act(async () => { manualNext.click(); });
    await act(async () => { root.render(render(records.slice(0, 5), true)); });
    assert.ok(dom.window.document.body.textContent?.includes("Page 2 of 3"), "server-controlled pagination must not reset on a new page of data");
    assert.equal(errors.filter(e => /hasn't mounted|not.*mounted|state update.*render/i.test(e)).length, 0, errors.join("\n"));
  } finally {
    await act(async () => root.unmount()); dom.window.close();
    for (const [key, descriptor] of descriptors) { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else Reflect.deleteProperty(globalThis, key); }
  }
});

test("rowActions adds a locked, right-aligned last column of icon-only buttons with aria-labels", async () => {
  const dom = new JSDOM('<html><body><div id="root"></div></body></html>', { url: "https://example.test", pretendToBeVisual: true });
  const descriptors = new Map<string, PropertyDescriptor | undefined>();
  for (const key of ["window", "document", "navigator", "HTMLElement", "Element", "Node", "MutationObserver", "NodeFilter", "HTMLFieldSetElement", "HTMLFormElement", "HTMLInputElement", "HTMLButtonElement", "HTMLTextAreaElement", "HTMLSelectElement", "HTMLAnchorElement", "SVGElement", "Event", "KeyboardEvent", "MouseEvent", "PointerEvent", "FocusEvent", "CustomEvent", "DOMRect", "ResizeObserver", "IntersectionObserver", "CSS", "getComputedStyle", "requestAnimationFrame", "cancelAnimationFrame", "IS_REACT_ACT_ENVIRONMENT"]) {
    descriptors.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    let value = key === "IS_REACT_ACT_ENVIRONMENT" ? true : dom.window[key as keyof typeof dom.window];
    if (typeof value === "function" && ["getComputedStyle", "requestAnimationFrame", "cancelAnimationFrame"].includes(key)) value = value.bind(dom.window);
    Object.defineProperty(globalThis, key, { configurable: true, value });
  }
  Object.defineProperty(globalThis, "ResizeObserver", { configurable: true, value: class { observe() {} unobserve() {} disconnect() {} } });
  const root = createRoot(dom.window.document.getElementById("root")!);
  const removed: string[] = [];
  const data = [{ name: "A" }, { name: "B" }];
  try {
    await act(async () => {
      root.render(createElement(DataTable, {
        columns: [{ accessorKey: "name", header: "Name" }],
        data,
        getRowId: (row: { name: string }) => row.name,
        rowActions: (row: { name: string }) => row.name === "B" ? null : createElement(DataTableRowAction, { icon: createElement("i"), label: "Remove", onClick: () => removed.push(row.name) }),
      }));
    });
    const headers = [...dom.window.document.querySelectorAll("th")];
    assert.equal(headers.at(-1)?.textContent, "Actions");
    const buttons = [...dom.window.document.querySelectorAll("tbody button[aria-label='Remove']")] as HTMLButtonElement[];
    assert.equal(buttons.length, 1);
    assert.equal(buttons[0].textContent, "");
    await act(async () => { buttons[0].click(); });
    assert.deepEqual(removed, ["A"]);
  } finally {
    await act(async () => root.unmount()); dom.window.close();
    for (const [key, descriptor] of descriptors) { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else Reflect.deleteProperty(globalThis, key); }
  }
});
