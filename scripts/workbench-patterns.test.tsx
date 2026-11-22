import assert from "node:assert/strict";
import { test } from "node:test";
import { JSDOM } from "jsdom";
import { act, createElement } from "react";
// @ts-expect-error plain ESM script, no types
import { nativeScroll } from "./check-standards.mjs";

test("check:standards flags native vertical scroll, not sideways strips", () => {
  assert.equal(
    nativeScroll(`<div className="flex max-h-64 overflow-y-auto">`),
    true,
  );
  assert.equal(nativeScroll(`<div className="md:overflow-auto">`), true);
  assert.equal(nativeScroll(`<div style={{ overflowY: "auto" }}>`), true);
  assert.equal(nativeScroll(`<div className="overflow-x-auto">`), false);
  assert.equal(nativeScroll(`<div className="overflow-hidden">`), false);
});

test("a failing part is isolated, reported, and recovers on resetKeys", async () => {
  const dom = new JSDOM('<html><body><div id="root"></div></body></html>', {
    url: "https://example.test",
    pretendToBeVisual: true,
  });
  const keys = [
    "window",
    "document",
    "navigator",
    "HTMLElement",
    "Element",
    "Node",
    "MutationObserver",
    "NodeFilter",
    "HTMLFormElement",
    "HTMLInputElement",
    "HTMLButtonElement",
    "HTMLTextAreaElement",
    "SVGElement",
    "Event",
    "KeyboardEvent",
    "MouseEvent",
    "PointerEvent",
    "FocusEvent",
    "CustomEvent",
    "DOMRect",
    "ResizeObserver",
    "IntersectionObserver",
    "CSS",
    "getComputedStyle",
    "IS_REACT_ACT_ENVIRONMENT",
  ];
  const saved = new Map(
    keys.map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]),
  );
  for (const key of keys) {
    let value =
      key === "IS_REACT_ACT_ENVIRONMENT"
        ? true
        : dom.window[key as keyof typeof dom.window];
    if (typeof value === "function" && key === "getComputedStyle")
      value = value.bind(dom.window);
    Object.defineProperty(globalThis, key, { configurable: true, value });
  }
  const { createRoot } = await import("react-dom/client");
  const { ErrorBoundary } = await import("../src/patterns/error-boundary");
  const root = createRoot(dom.window.document.getElementById("root")!);
  const Bomb = ({ fail }: { fail: boolean }) => {
    if (fail) throw new Error("boom");
    return createElement("p", null, "recovered");
  };
  const reports: string[] = [];
  const render = (fail: boolean) =>
    act(async () => {
      root.render(
        createElement(
          "div",
          null,
          createElement("p", null, "sibling"),
          createElement(
            ErrorBoundary,
            {
              name: "test.part",
              silent: true,
              resetKeys: [fail],
              onError: (error) => reports.push(error.message),
              fallback: createElement("p", null, "fallback"),
            },
            createElement(Bomb, { fail }),
          ),
        ),
      );
    });
  const originalError = console.error;
  console.error = () => undefined;
  try {
    await render(true);
    const text = () => dom.window.document.body.textContent ?? "";
    assert.match(text(), /sibling/);
    assert.match(text(), /fallback/);
    assert.deepEqual(reports, ["boom"]);
    await render(false);
    assert.match(text(), /recovered/);
  } finally {
    console.error = originalError;
    await act(async () => root.unmount());
    for (const [key, descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete (globalThis as Record<string, unknown>)[key];
    }
  }
});
