import assert from "node:assert/strict";
import { test } from "node:test";
import { JSDOM } from "jsdom";
import { act, createElement } from "react";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import {
  SidebarCollapse,
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from "../src/components/ui/sidebar";

// Saved state in the cookie, as the browser sends it to the page.
// The server cannot read it, so it renders the default ("open").
function Page() {
  return createElement(
    SidebarProvider,
    null,
    createElement(Sidebar, null, createElement(SidebarCollapse)),
    createElement(SidebarInset, null, "content"),
  );
}

for (const cookie of ["compact:256", "closed:256"]) {
  test(`hydrating a sidebar saved as ${cookie.split(":")[0]} reports no mismatch`, async () => {
    const html = renderToString(createElement(Page));
    assert.match(html, /data-sidebar="collapse"/);
    const dom = new JSDOM(
      `<html lang="en"><body><div id="root">${html}</div></body></html>`,
      {
        url: "https://example.test",
        runScripts: "outside-only",
        pretendToBeVisual: true,
      },
    );
    // jsdom has no matchMedia; the mobile check only needs a desktop answer.
    dom.window.matchMedia = (query: string) =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener() {},
        removeEventListener() {},
        addListener() {},
        removeListener() {},
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList;
    dom.window.document.cookie = `sidebar_state=${cookie}`;
    const globals = [
      "window",
      "document",
      "navigator",
      "HTMLElement",
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
      "IS_REACT_ACT_ENVIRONMENT",
    ];
    const descriptors = new Map<string, PropertyDescriptor | undefined>();
    for (const key of globals) {
      descriptors.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
      Object.defineProperty(globalThis, key, {
        configurable: true,
        value:
          key === "IS_REACT_ACT_ENVIRONMENT"
            ? true
            : dom.window[key as keyof typeof dom.window],
      });
    }
    const errors: unknown[] = [];
    try {
      const container = dom.window.document.getElementById("root")!;
      await act(async () => {
        hydrateRoot(container, createElement(Page), {
          onRecoverableError: (error: unknown) => errors.push(error),
        });
      });
      assert.deepEqual(errors, []);

      // The Radix tooltip renders no content while closed, so the mode's
      // label can no longer mismatch the server's HTML at all.
      assert.equal(
        container.querySelector('[data-slot="tooltip-content"]'),
        null,
      );
    } finally {
      for (const key of globals) {
        const descriptor = descriptors.get(key);
        if (descriptor) Object.defineProperty(globalThis, key, descriptor);
        else delete (globalThis as Record<string, unknown>)[key];
      }
      dom.window.close();
    }
  });
}
