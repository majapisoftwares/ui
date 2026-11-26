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

test("row groups render children under a toggle that follows defaultExpandedRows and keeps the user's choice", async () => {
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
  type Node = { id: string; name: string; collapsed?: boolean; children?: Node[] };
  const groups = (options: { bCollapsed?: boolean; withC?: boolean } = {}): Node[] => {
    const rows: Node[] = [
      { id: "deploy-a", name: "Deploy A", children: [{ id: "a1", name: "Job A1" }, { id: "a2", name: "Job A2" }] },
      { id: "deploy-b", name: "Deploy B", collapsed: options.bCollapsed ?? true, children: [{ id: "b1", name: "Job B1" }] },
    ];
    if (options.withC) rows.push({ id: "deploy-c", name: "Deploy C", children: [{ id: "c1", name: "Job C1" }] });
    return rows;
  };
  const opened: string[] = [];
  const render = (data: Node[]) => createElement(DataTable, {
    columns: [{ accessorKey: "name", header: "Name" }],
    data,
    getRowId: (row: Node) => row.id,
    getSubRows: (row: Node) => row.children,
    defaultExpandedRows: (row: Node) => !row.collapsed,
    onRowClick: (row: Node) => opened.push(row.id),
  });
  const toggles = () => [...dom.window.document.querySelectorAll<HTMLButtonElement>("tbody button")].filter((button) => ["Expand", "Collapse"].includes(button.getAttribute("aria-label") ?? ""));
  try {
    await act(async () => { root.render(render(groups())); });
    const body = () => dom.window.document.body.textContent ?? "";
    // Defaults: A expanded, B collapsed, the plain row has no toggle.
    assert.ok(body().includes("Job A1"), "a group the default expands shows its children");
    assert.ok(!body().includes("Job B1"), "a group the default collapses hides its children");
    const [toggleA, toggleB] = toggles();
    assert.equal(toggles().length, 2, "only rows with children get a toggle");
    assert.equal(toggleA.getAttribute("aria-expanded"), "true");
    assert.equal(toggleB.getAttribute("aria-expanded"), "false");
    // The toggle opens and closes the group, and the click does not reach the row.
    await act(async () => { toggleA.click(); });
    assert.ok(!body().includes("Job A1"), "collapsing hides the children");
    assert.equal(toggleA.getAttribute("aria-expanded"), "false");
    assert.deepEqual(opened, [], "the toggle's click must not open the row");
    // A data refresh (live data) re-applies the defaults, but keeps the user's choice.
    await act(async () => { root.render(render(groups())); });
    assert.ok(!body().includes("Job A1"), "the user's collapse survives a data refresh");
    assert.ok(!body().includes("Job B1"), "an untouched row keeps its default");
    // A default that flips in the data reaches rows the user never toggled.
    await act(async () => { root.render(render(groups({ bCollapsed: false }))); });
    assert.ok(body().includes("Job B1"), "a row the user never toggled follows its new default");
    assert.ok(!body().includes("Job A1"), "the user's choice still holds");
    // A new group starts expanded by the default.
    await act(async () => { root.render(render(groups({ bCollapsed: false, withC: true }))); });
    assert.ok(body().includes("Job C1"), "a new group starts expanded");
  } finally {
    await act(async () => root.unmount()); dom.window.close();
    for (const [key, descriptor] of descriptors) { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else Reflect.deleteProperty(globalThis, key); }
  }
});

test("a page holds whole groups: children never split across pages", async () => {
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
  type Node = { id: string; name: string; children?: { id: string; name: string }[] };
  const data: Node[] = [
    { id: "g1", name: "Group 1", children: [{ id: "g1-a", name: "Group 1 Job A" }, { id: "g1-b", name: "Group 1 Job B" }, { id: "g1-c", name: "Group 1 Job C" }] },
    { id: "g2", name: "Group 2", children: [{ id: "g2-a", name: "Group 2 Job A" }] },
  ];
  try {
    await act(async () => {
      root.render(createElement(DataTable, {
        columns: [{ accessorKey: "name", header: "Name" }],
        data,
        getRowId: (row: Node) => row.id,
        getSubRows: (row: Node) => row.children,
        pageSizeOptions: [1],
        initialPageSize: 1,
      }));
    });
    const body = () => dom.window.document.body.textContent ?? "";
    assert.ok(body().includes("Group 1 Job C"), "the expanded group's children are on its page");
    assert.ok(!body().includes("Group 2"), "the second group waits for the next page");
  } finally {
    await act(async () => root.unmount()); dom.window.close();
    for (const [key, descriptor] of descriptors) { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else Reflect.deleteProperty(globalThis, key); }
  }
});

test("the table is exactly as wide as its columns so a resized column keeps the width it was dragged to", async () => {
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
  try {
    await act(async () => {
      root.render(createElement(DataTable, { columns: [{ accessorKey: "a", header: "A", size: 200 }, { accessorKey: "b", header: "B", size: 120 }], data: [{ a: "x", b: "y" }] }));
    });
    const table = dom.window.document.querySelector("table")!;
    assert.ok(table.className.includes("table-fixed"));
    assert.equal(table.style.width, "320px");
    assert.equal(table.style.minWidth, "");
  } finally {
    await act(async () => root.unmount()); dom.window.close();
    for (const [key, descriptor] of descriptors) { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else Reflect.deleteProperty(globalThis, key); }
  }
});

async function withTable(
  viewportWidth: number,
  columns: Array<{ accessorKey: string; header: string; size: number }>,
  run: (ctx: { dom: JSDOM; heads: () => HTMLElement[]; table: () => HTMLElement; drag: (index: number, delta: number) => Promise<void> }) => Promise<void>,
) {
  const dom = new JSDOM('<html><body><div id="root"></div></body></html>', { url: "https://example.test", pretendToBeVisual: true });
  const descriptors = new Map<string, PropertyDescriptor | undefined>();
  for (const key of ["window", "document", "navigator", "HTMLElement", "Element", "Node", "MutationObserver", "NodeFilter", "HTMLFieldSetElement", "HTMLFormElement", "HTMLInputElement", "HTMLButtonElement", "HTMLTextAreaElement", "HTMLSelectElement", "HTMLAnchorElement", "SVGElement", "Event", "KeyboardEvent", "MouseEvent", "TouchEvent", "PointerEvent", "FocusEvent", "CustomEvent", "DOMRect", "ResizeObserver", "IntersectionObserver", "CSS", "getComputedStyle", "requestAnimationFrame", "cancelAnimationFrame", "IS_REACT_ACT_ENVIRONMENT"]) {
    descriptors.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    let value = key === "IS_REACT_ACT_ENVIRONMENT" ? true : dom.window[key as keyof typeof dom.window];
    if (typeof value === "function" && ["getComputedStyle", "requestAnimationFrame", "cancelAnimationFrame"].includes(key)) value = value.bind(dom.window);
    Object.defineProperty(globalThis, key, { configurable: true, value });
  }
  Object.defineProperty(globalThis, "ResizeObserver", { configurable: true, value: class { observe() {} unobserve() {} disconnect() {} } });
  // The scroll viewport is the table's parent; jsdom has no layout.
  Object.defineProperty(dom.window.HTMLElement.prototype, "clientWidth", {
    configurable: true,
    get() { return (this as HTMLElement).dataset.slot === "scroll-area-viewport" ? viewportWidth : 0; },
  });
  const root = createRoot(dom.window.document.getElementById("root")!);
  try {
    await act(async () => {
      root.render(createElement(DataTable, { columns, data: [{ a: "x", b: "y" }] }));
    });
    const doc = dom.window.document;
    await run({
      dom,
      heads: () => [...doc.querySelectorAll<HTMLElement>("thead th:not([data-slot=table-filler])")],
      table: () => doc.querySelector("table")!,
      drag: async (index, delta) => {
        const handle = doc.querySelectorAll("thead [role=separator]")[index]!;
        const fire = (type: string, target: EventTarget, clientX: number) =>
          target.dispatchEvent(new dom.window.MouseEvent(type, { bubbles: true, clientX }));
        await act(async () => { fire("mousedown", handle, 100); });
        await act(async () => { fire("mousemove", doc, 100 + delta); });
        await act(async () => { fire("mouseup", doc, 100 + delta); });
      },
    });
  } finally {
    await act(async () => root.unmount()); dom.window.close();
    for (const [key, descriptor] of descriptors) { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else Reflect.deleteProperty(globalThis, key); }
  }
}

const twoColumns = [{ accessorKey: "a", header: "A", size: 200 }, { accessorKey: "b", header: "B", size: 120 }];

test("columns narrower than the container grow to fill it", async () => {
  await withTable(1000, twoColumns, async ({ heads, table }) => {
    assert.equal(table().style.width, "1000px");
    assert.deepEqual(heads().map((head) => head.style.width), ["625px", "375px"]);
  });
});

test("columns wider than the container keep their sizes and scroll", async () => {
  await withTable(200, twoColumns, async ({ heads, table }) => {
    assert.equal(table().style.width, "320px");
    assert.deepEqual(heads().map((head) => head.style.width), ["200px", "120px"]);
  });
});

test("a dragged column follows the pointer exactly, wherever there is spare room", async () => {
  await withTable(1000, twoColumns, async ({ heads, table, drag }) => {
    await drag(0, -100);
    assert.deepEqual(heads().map((head) => head.style.width), ["525px", "375px"], "only the dragged column moved");
    assert.equal(table().style.width, "1000px", "the spare room is a filler, not a stretch of the other columns");
    assert.ok(table().querySelector("[data-slot=table-filler]"));

    await drag(0, 400);
    assert.deepEqual(heads().map((head) => head.style.width), ["925px", "375px"]);
    assert.equal(table().style.width, "1300px", "beyond the container the table scrolls");
    assert.equal(table().querySelector("[data-slot=table-filler]"), null);
  });
});
