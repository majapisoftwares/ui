import assert from "node:assert/strict";
import { test } from "node:test";
import { JSDOM } from "jsdom";
import { act, createElement, type ReactElement } from "react";

// Radix decides at load time whether layout effects exist (portal mounting),
// so the DOM globals must be in place before the tooltip module loads.
const dom = new JSDOM(`<html lang="en"><body></body></html>`, {
  url: "https://example.test",
  pretendToBeVisual: true,
});
for (const key of [
  "window",
  "document",
  "navigator",
  "HTMLElement",
  "Element",
  "Node",
  "DocumentFragment",
  "Text",
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
  "getComputedStyle",
  "requestAnimationFrame",
  "cancelAnimationFrame",
]) {
  Object.defineProperty(globalThis, key, {
    configurable: true,
    value: dom.window[key as keyof typeof dom.window],
  });
}
(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
// jsdom has no ResizeObserver; floating-ui only needs the calls to not throw.
(globalThis as Record<string, unknown>).ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

const { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } =
  await import("../src/components/ui/tooltip");

async function render(element: ReactElement) {
  const container = dom.window.document.createElement("div");
  dom.window.document.body.appendChild(container);
  const { createRoot } = await import("react-dom/client");
  const root = createRoot(container);
  await act(async () => {
    root.render(element);
  });
  return {
    container,
    async rerender(next: ReactElement) {
      await act(async () => {
        root.render(next);
      });
    },
    async cleanup() {
      await act(async () => {
        root.unmount();
      });
      container.remove();
      dom.window.document
        .querySelectorAll("[data-radix-popper-content-wrapper]")
        .forEach((node) => node.remove());
    },
  };
}

function Example(props: Record<string, unknown> = {}) {
  return createElement(
    TooltipProvider,
    null,
    createElement(
      Tooltip,
      { open: true, ...props },
      createElement(TooltipTrigger, null, "Hover"),
      createElement(TooltipContent, null, "Hint"),
    ),
  );
}

test("an open tooltip renders the shadcn arrow, in the bubble's color and radius", async () => {
  const view = await render(createElement(Example));
  try {
    const content = dom.window.document.querySelector(
      '[data-slot="tooltip-content"]',
    );
    assert.ok(content, "content is portaled and rendered while open");
    assert.match(content.className, /bg-foreground/);
    assert.match(content.className, /rounded-xl/);
    const arrow = content.querySelector("svg");
    assert.ok(arrow, "the arrow renders inside the bubble");
    const className = arrow.getAttribute("class") ?? "";
    // Same color as the bubble and shifted into it: no visible seam.
    assert.match(className, /fill-foreground/);
    assert.match(className, /bg-foreground/);
    assert.match(className, /rotate-45/);
    assert.match(className, /translate-y-\[calc\(-50%_-_2px\)\]/);
  } finally {
    await view.cleanup();
  }
});

test("a closed tooltip renders no content at all", async () => {
  const view = await render(
    createElement(
      Tooltip,
      null,
      createElement(TooltipTrigger, null, "Hover"),
      createElement(TooltipContent, null, "Hint"),
    ),
  );
  try {
    assert.equal(
      dom.window.document.querySelector('[data-slot="tooltip-content"]'),
      null,
    );
    assert.ok(
      dom.window.document.querySelector('[data-slot="tooltip-trigger"]'),
    );
  } finally {
    await view.cleanup();
  }
});

test("disabled renders the plain trigger and never the content", async () => {
  const view = await render(
    createElement(
      Tooltip,
      { disabled: true },
      createElement(
        TooltipTrigger,
        { render: createElement("a", { href: "/x" }) },
        "Label",
      ),
      createElement(TooltipContent, null, "Hint"),
    ),
  );
  try {
    const anchor = view.container.querySelector("a");
    assert.equal(anchor?.textContent, "Label");
    assert.equal(anchor?.getAttribute("aria-describedby"), null);
    assert.equal(
      dom.window.document.querySelector('[data-slot="tooltip-content"]'),
      null,
    );
  } finally {
    await view.cleanup();
  }
});

test("the trigger's render prop receives the tooltip wiring", async () => {
  const view = await render(
    createElement(
      Tooltip,
      { open: true },
      createElement(
        TooltipTrigger,
        { render: createElement("a", { href: "/x" }) },
        "Label",
      ),
      createElement(TooltipContent, null, "Hint"),
    ),
  );
  try {
    const anchor = view.container.querySelector("a");
    assert.equal(anchor?.textContent, "Label");
    assert.ok(anchor?.getAttribute("aria-describedby"));
  } finally {
    await view.cleanup();
  }
});

test("closeDelay holds the close request back", async () => {
  const changes: boolean[] = [];
  const view = await render(
    createElement(Example, {
      open: true,
      closeDelay: 80,
      onOpenChange: (open: boolean) => changes.push(open),
    }),
  );
  try {
    const trigger = view.container.querySelector(
      '[data-slot="tooltip-trigger"]',
    )!;
    // Blurring the trigger is one of the closes Radix asks for (hover leaves
    // go through the same handleClose); React synthesizes blur from focusout.
    await act(async () => {
      trigger.dispatchEvent(
        new dom.window.FocusEvent("focusout", { bubbles: true }),
      );
    });
    assert.deepEqual(changes, [], "the close waits for the delay");
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
    });
    assert.deepEqual(changes, [false]);
  } finally {
    await view.cleanup();
  }
});
