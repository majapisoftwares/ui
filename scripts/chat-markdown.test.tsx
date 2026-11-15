import assert from "node:assert/strict";
import { test } from "node:test";
import { JSDOM } from "jsdom";
import { act, createElement, type ReactNode } from "react";
import { linkHost } from "../src/lib/utils";

test("only http(s) links have a host to always open", () => {
  assert.equal(linkHost("https://GitHub.com/majapisoftwares/ui/pull/1"), "github.com");
  assert.equal(linkHost("http://localhost:3000/x"), "localhost");
  assert.equal(linkHost("mailto:someone@example.test"), null);
  assert.equal(linkHost("javascript:alert(1)"), null);
  assert.equal(linkHost("/relative"), null);
});

test("an external link asks first, and a trusted host opens without asking", async () => {
  const dom = new JSDOM('<html><body><div id="root"></div></body></html>', { url: "https://app.test", pretendToBeVisual: true });
  // The dialog (Base UI) times its transitions with animation frames.
  const globals: Record<string, unknown> = {
    window: dom.window,
    document: dom.window.document,
    navigator: dom.window.navigator,
    HTMLElement: dom.window.HTMLElement,
    Element: dom.window.Element,
    Node: dom.window.Node,
    MutationObserver: dom.window.MutationObserver,
    getComputedStyle: dom.window.getComputedStyle.bind(dom.window),
    requestAnimationFrame: (callback: FrameRequestCallback) => setTimeout(() => callback(0), 0),
    cancelAnimationFrame: (id: number) => clearTimeout(id),
    IS_REACT_ACT_ENVIRONMENT: true,
  };
  const saved = new Map(Object.keys(globals).map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  for (const [key, value] of Object.entries(globals)) Object.defineProperty(globalThis, key, { configurable: true, value });
  const opened: string[] = [];
  dom.window.open = ((url: string) => {
    opened.push(url);
    return null;
  }) as typeof dom.window.open;
  // react-dom checks for a DOM when it loads.
  const { createRoot } = await import("react-dom/client");
  const { ChatMarkdown, TrustedLinksProvider } = await import("../src/patterns/chat-markdown");
  const root = createRoot(dom.window.document.getElementById("root")!);
  const url = "https://github.com/majapisoftwares/ui/pull/1";
  const reply = createElement(ChatMarkdown, null, `See [the PR](${url}).`);
  const trusted: string[] = [];
  const render = (node: ReactNode) => act(async () => root.render(node));
  const body = () => dom.window.document.body;
  const button = (name: string) => [...body().querySelectorAll("button")].find((element) => element.textContent?.trim() === name);
  const click = (element: HTMLButtonElement | undefined) =>
    act(async () => {
      assert.ok(element, "button exists");
      element.click();
      await new Promise((resolve) => setTimeout(resolve, 20));
    });
  try {
    await render(reply);
    await click(button("the PR"));
    assert.ok(button("Open this link"), "asks first");
    assert.equal(button("Always open github.com"), undefined, "no list to add to without a provider");
    await click(button("Open this link"));
    assert.deepEqual(opened, [url]);

    await render(createElement(TrustedLinksProvider, { hosts: trusted, onTrust: (host: string) => trusted.push(host) }, reply));
    await click(button("the PR"));
    await click(button("Always open github.com"));
    assert.deepEqual(trusted, ["github.com"]);
    assert.deepEqual(opened, [url, url]);

    await render(createElement(TrustedLinksProvider, { hosts: ["github.com"], onTrust: () => assert.fail("already trusted") }, reply));
    await click(button("the PR"));
    assert.equal(button("Open this link"), undefined, "opens without asking");
    assert.deepEqual(opened, [url, url, url]);
  } finally {
    await act(async () => root.unmount());
    for (const [key, descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete (globalThis as Record<string, unknown>)[key];
    }
  }
});
