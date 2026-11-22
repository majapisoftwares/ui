import assert from "node:assert/strict";
import { test } from "node:test";
import { JSDOM } from "jsdom";
import { act, createElement } from "react";
import { quoteText } from "../src/lib/utils";

test("a markdown reply quotes as one line of plain text", () => {
  assert.equal(
    quoteText("## Cause\n\n**Build** failed in `app/page.tsx`, see [the docs](https://x.test).\n\n```ts\nexport {}\n```\n\n| Step | Status |\n| --- | --- |\n| Build | Failed |\n\n- keep file_name"),
    "Cause Build failed in app/page.tsx, see the docs. Step Status Build Failed keep file_name",
  );
});

test("the field takes focus when a reply starts and when it moves to another message", async () => {
  const dom = new JSDOM('<html><body><button id="elsewhere"></button><div id="root"></div></body></html>', { url: "https://example.test", pretendToBeVisual: true });
  const keys = ["window", "document", "navigator", "HTMLElement", "Element", "Node", "MutationObserver", "NodeFilter", "HTMLFieldSetElement", "HTMLFormElement", "HTMLInputElement", "HTMLButtonElement", "HTMLTextAreaElement", "HTMLSelectElement", "HTMLAnchorElement", "SVGElement", "Event", "KeyboardEvent", "MouseEvent", "PointerEvent", "FocusEvent", "CustomEvent", "DOMRect", "ResizeObserver", "IntersectionObserver", "CSS", "getComputedStyle", "IS_REACT_ACT_ENVIRONMENT"];
  const saved = new Map(keys.map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  for (const key of keys) {
    let value = key === "IS_REACT_ACT_ENVIRONMENT" ? true : dom.window[key as keyof typeof dom.window];
    if (typeof value === "function" && key === "getComputedStyle") value = value.bind(dom.window);
    Object.defineProperty(globalThis, key, { configurable: true, value });
  }
  // react-dom checks for a DOM when it loads.
  const { createRoot } = await import("react-dom/client");
  const { PromptInput } = await import("../src/patterns/prompt-input");
  const root = createRoot(dom.window.document.getElementById("root")!);
  const elsewhere = dom.window.document.getElementById("elsewhere")!;
  const render = (quote?: string) =>
    act(async () => {
      root.render(createElement(PromptInput, { onSubmit: () => undefined, quote: quote ? createElement("div", { key: quote }, `quoting ${quote}`) : undefined }));
    });
  try {
    await render();
    const field = () => dom.window.document.querySelector("textarea")!;
    elsewhere.focus();
    await render("a");
    assert.equal(dom.window.document.activeElement, field(), "a reply starts");
    assert.match(dom.window.document.body.textContent ?? "", /quoting a/);
    elsewhere.focus();
    await render("a");
    assert.equal(dom.window.document.activeElement, elsewhere, "a re-render doesn't take focus");
    await render("b");
    assert.equal(dom.window.document.activeElement, field(), "another message");
    await render();
    assert.doesNotMatch(dom.window.document.body.textContent ?? "", /quoting/);
  } finally {
    await act(async () => root.unmount());
    for (const [key, descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete (globalThis as Record<string, unknown>)[key];
    }
  }
});

test("inline PromptInput collapses to one row by default and expands on mobile focus-within", async () => {
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { PromptInput } = await import("../src/patterns/prompt-input");
  const inlineHtml = renderToStaticMarkup(
    createElement(PromptInput, {
      onSubmit: () => undefined,
      inline: true,
      attachments: true,
    }),
  );
  assert.match(inlineHtml, /\bflex-row\b/, "inline starts as a horizontal row on mobile and desktop");
  assert.match(inlineHtml, /\bmax-md:focus-within:flex-col\b/, "expands to stacked layout on mobile focus");
  assert.match(inlineHtml, /\bmax-md:group-focus-within\/input-group:flex\b/, "addon row becomes flex block below textarea on mobile focus");
  const stackedHtml = renderToStaticMarkup(
    createElement(PromptInput, {
      onSubmit: () => undefined,
      inline: false,
      attachments: true,
    }),
  );
  assert.doesNotMatch(stackedHtml, /\bmax-md:focus-within:flex-col\b/);
});
