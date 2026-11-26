import assert from "node:assert/strict";
import { mock, test } from "node:test";
import { JSDOM } from "jsdom";
import { act, createElement } from "react";

const realSetTimeout = setTimeout;
const tick = (ms = 0) => new Promise((resolve) => realSetTimeout(resolve, ms));

test("error toasts have no timer, however they are shown", async () => {
  const { createToastManager } = await import("../src/components/ui/toast");
  const queue = createToastManager();
  const duration = (id: string) =>
    queue.toasts().find((item) => item.id === id)?.duration;

  assert.equal(duration(queue.add({ description: "saved" })), 5000);
  assert.equal(
    duration(queue.add({ type: "success", description: "saved", timeout: 1 })),
    1,
  );
  assert.equal(
    duration(queue.add({ type: "error", description: "a" })),
    Infinity,
  );
  // An app's own timeout doesn't bring the timer back.
  assert.equal(
    duration(queue.add({ type: "error", description: "b", timeout: 3000 })),
    Infinity,
  );
  assert.equal(duration(queue.error("c", { duration: 3000 })), Infinity);
  assert.equal(duration(queue({ type: "error", title: "d" })), Infinity);

  const updated = queue.add({ type: "loading", description: "saving" });
  queue.update(updated, { type: "error", title: "failed" });
  assert.equal(duration(updated), Infinity);

  const rejected = queue.promise(Promise.reject(new Error("offline")), {
    loading: "saving",
    success: "saved",
    error: "failed",
  });
  const resolved = queue.promise(Promise.resolve(), {
    loading: "saving",
    success: "saved",
    error: "failed",
  });
  await tick();
  assert.equal(duration(rejected), Infinity);
  assert.equal(duration(resolved), 5000);

  // The region reads the same array until the queue changes.
  assert.equal(queue.toasts(), queue.toasts());
});

test("the deprecated sonner and snackbar errors stay too", async () => {
  const { toast: manager } = await import("../src/components/ui/toast");
  const { toast: sonner } = await import("../src/components/ui/sonner");
  const { snackbar } = await import("../src/components/ui/snackbar");
  const duration = (id: string) =>
    manager.toasts().find((item) => item.id === id)?.duration;
  try {
    assert.equal(duration(sonner.error("a", { duration: 4000 })), Infinity);
    assert.equal(duration(snackbar.error("b", { duration: 4000 })), Infinity);
    assert.equal(duration(sonner.success("c", { duration: 4000 })), 4000);
  } finally {
    manager.close();
  }
});

test("on screen, an error stays after the others close, until its close button is pressed", async () => {
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
    "HTMLFieldSetElement",
    "HTMLFormElement",
    "HTMLInputElement",
    "HTMLButtonElement",
    "HTMLTextAreaElement",
    "HTMLSelectElement",
    "HTMLAnchorElement",
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
    "requestAnimationFrame",
    "cancelAnimationFrame",
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
    if (
      typeof value === "function" &&
      [
        "getComputedStyle",
        "requestAnimationFrame",
        "cancelAnimationFrame",
      ].includes(key)
    )
      value = value.bind(dom.window);
    Object.defineProperty(globalThis, key, { configurable: true, value });
  }
  // jsdom has no ResizeObserver; the toast and its ScrollArea need one.
  Object.defineProperty(globalThis, "ResizeObserver", {
    configurable: true,
    value: class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  });
  // Nor animations: nothing animates here, so a toast leaves at once.
  dom.window.Element.prototype.getAnimations = () => [];
  const { createRoot } = await import("react-dom/client");
  const { Toaster, createToastManager } =
    await import("../src/components/ui/toast");
  const queue = createToastManager();
  const root = createRoot(dom.window.document.getElementById("root")!);
  // The toasts on screen (the page also holds what screen readers heard).
  const text = () =>
    [...dom.window.document.querySelectorAll('[data-slot="toast"]')]
      .map((item) => item.textContent)
      .join("\n");
  try {
    await act(async () => {
      root.render(createElement(Toaster, { toaster: queue }));
    });
    // The countdowns run on a clock the test moves, so no machine speed can
    // make a toast leave early or late. Waiting for the screen to catch up
    // still polls the real clock, but only for a condition, never for a time.
    mock.timers.enable({ apis: ["setTimeout", "Date"] });
    const until = async (done: () => boolean) => {
      for (let polls = 0; !done() && polls < 2000; polls++)
        await act(() => tick(10));
      assert.ok(done());
    };
    await act(async () => {
      queue.add({ type: "success", description: "saved", timeout: 3000 });
      // Were its timeout followed, the error would leave long before "saved".
      queue.add({
        type: "error",
        description: "the database is not accepting connections",
        timeout: 1,
      });
    });
    await until(() => /saved/.test(text()));
    assert.match(text(), /not accepting connections/);

    await act(async () => mock.timers.tick(3000));
    await until(() => !/saved/.test(text()));
    assert.match(text(), /not accepting connections/);
    // Long after, still there: nothing but the button removes it.
    await act(async () => mock.timers.tick(10 * 60_000));
    assert.match(text(), /not accepting connections/);

    const close = dom.window.document.querySelector<HTMLElement>(
      '[data-slot="toast"] button[aria-label]',
    );
    assert.ok(close);
    await act(async () => close.click());
    await until(() => text() === "");
    assert.equal(queue.toasts().length, 0);
  } finally {
    mock.timers.reset();
    await act(async () => root.unmount());
    for (const [key, descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete (globalThis as Record<string, unknown>)[key];
    }
    dom.window.close();
  }
});
