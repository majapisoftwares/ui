import assert from "node:assert/strict";
import { test } from "node:test";
import { JSDOM } from "jsdom";
import { act, createElement } from "react";

// useLiveRefresh (docs/STANDARDS.md, "Dados ao vivo"): a load that is still
// running holds the next ticks, so a slow server never gets the same request
// piled up; a failed load doesn't stop the refreshes.

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

test("a running load holds the next ticks; a failed one doesn't stop them", async () => {
  const dom = new JSDOM('<html><body><div id="root"></div></body></html>', { url: "https://example.test", pretendToBeVisual: true });
  const keys = ["window", "document", "navigator", "HTMLElement", "Element", "Node", "IS_REACT_ACT_ENVIRONMENT"];
  const saved = new Map(keys.map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  for (const key of keys) Object.defineProperty(globalThis, key, { configurable: true, value: key === "IS_REACT_ACT_ENVIRONMENT" ? true : dom.window[key as keyof typeof dom.window] });
  const { createRoot } = await import("react-dom/client");
  const { useLiveRefresh } = await import("../src/hooks/use-live-refresh");
  const root = createRoot(dom.window.document.getElementById("root")!);
  let calls = 0;
  let finish: (failed?: boolean) => void = () => undefined;
  // Each load stays open until the test settles it.
  const load = () => {
    calls++;
    return new Promise<void>((resolve, reject) => {
      finish = (failed) => (failed ? reject(new Error("offline")) : resolve());
    });
  };
  function Screen({ refresh }: { refresh: () => unknown }) {
    useLiveRefresh(refresh, 10);
    return null;
  }
  try {
    await act(async () => root.render(createElement(Screen, { refresh: load })));
    await act(() => wait(80));
    assert.equal(calls, 1, "eight ticks while the first load runs: no second request");
    // Coming back to the page doesn't start one either.
    dom.window.dispatchEvent(new dom.window.Event("focus"));
    assert.equal(calls, 1);

    await act(async () => finish(true));
    await act(() => wait(40));
    assert.equal(calls, 2, "after the failed load settles, the next tick loads again");

    await act(async () => finish());
    await act(() => wait(40));
    assert.equal(calls, 3);

    // A refresh that returns nothing (a state bump) runs on every tick.
    let bumps = 0;
    const other = createRoot(dom.window.document.body.appendChild(dom.window.document.createElement("div")));
    await act(async () => other.render(createElement(Screen, { refresh: () => void bumps++ })));
    await act(() => wait(80));
    await act(async () => other.unmount());
    assert.ok(bumps >= 3, `ran ${bumps} times`);
  } finally {
    await act(async () => root.unmount());
    for (const [key, descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
    dom.window.close();
  }
});
