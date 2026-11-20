import assert from "node:assert/strict";
import { test } from "node:test";
import { JSDOM } from "jsdom";
import { createElement, act } from "react";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import { Preferences, preferencesScript, useDocumentTitle } from "../src/patterns/preferences";
import { useLocale } from "../src/lib/i18n";

function Page() {
  const locale = useLocale();
  const title = locale === "pt-BR" ? "Repositórios" : "Repositories";
  useDocumentTitle(title);
  return createElement("h1", null, title);
}

for (const stored of ["pt-BR", "en"]) {
  test(`hydration writes only the saved ${stored} title and reveals matching content`, async () => {
    const element = createElement(Preferences, null, createElement(Page));
    const dom = new JSDOM(`<html lang="en"><head><title>Majapi</title></head><body><div id="root">${renderToString(element)}</div></body></html>`, {
      url: "https://example.test", runScripts: "outside-only", pretendToBeVisual: true,
    });
    const descriptors = new Map<string, PropertyDescriptor | undefined>();
    for (const key of ["window", "document", "navigator", "HTMLElement", "MutationObserver", "IS_REACT_ACT_ENVIRONMENT"]) {
      descriptors.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
      Object.defineProperty(globalThis, key, { configurable: true, value: key === "IS_REACT_ACT_ENVIRONMENT" ? true : dom.window[key as keyof typeof dom.window] });
    }
    let root: ReturnType<typeof hydrateRoot> | undefined;
    try {
      dom.window.localStorage.setItem("locale", stored);
      // React components access localStorage as a global in browsers.
      Object.defineProperty(globalThis, "localStorage", { configurable: true, value: dom.window.localStorage });
      const titles: string[] = [];
      const descriptor = Object.getOwnPropertyDescriptor(dom.window.Document.prototype, "title")!;
      Object.defineProperty(dom.window.document, "title", { get: () => descriptor.get!.call(dom.window.document), set: value => { titles.push(value); descriptor.set!.call(dom.window.document, value); } });
      let timers = 0;
      dom.window.setTimeout = (() => { timers++; return 1; }) as typeof dom.window.setTimeout;
      dom.window.eval(preferencesScript);
      assert.equal(timers, 0, "pre-paint masking must not expire before hydration finishes");
      if (stored === "pt-BR") assert.equal(dom.window.document.documentElement.dataset.localePending, "pt-BR");
      await act(async () => { root = hydrateRoot(dom.window.document.getElementById("root")!, element); });
      assert.ok(titles.length > 0);
      assert.ok(titles.every(title => title === (stored === "pt-BR" ? "Repositórios" : "Repositories")), JSON.stringify(titles));
      assert.equal(dom.window.document.documentElement.lang, stored);
      assert.equal(dom.window.document.documentElement.dataset.localePending, undefined);
      assert.equal(dom.window.document.querySelector("h1")!.textContent, stored === "pt-BR" ? "Repositórios" : "Repositories");
    } finally {
      if (root) await act(async () => root!.unmount());
      dom.window.close();
      Reflect.deleteProperty(globalThis, "localStorage");
      for (const [key, descriptor] of descriptors) {
        if (descriptor) Object.defineProperty(globalThis, key, descriptor);
        else Reflect.deleteProperty(globalThis, key);
      }
    }
  });
}

test("system theme follows prefers-color-scheme live and clears the saved choice", async () => {
  const { usePreferences } = await import("../src/patterns/preferences");
  const box = {} as { prefs: ReturnType<typeof usePreferences> };
  function Probe({ sink }: { sink: typeof box }) { Object.assign(sink, { prefs: usePreferences() }); return null; }
  const dom = new JSDOM(`<html><body><div id="root"></div></body></html>`, { url: "https://example.test", pretendToBeVisual: true });
  let dark = true;
  const listeners = new Set<() => void>();
  const mql = { get matches() { return dark; }, addEventListener: (_: string, l: () => void) => listeners.add(l), removeEventListener: (_: string, l: () => void) => listeners.delete(l) };
  const matchMedia = () => mql;
  const globals: Record<string, unknown> = { window: dom.window, document: dom.window.document, navigator: dom.window.navigator, HTMLElement: dom.window.HTMLElement, MutationObserver: dom.window.MutationObserver, IS_REACT_ACT_ENVIRONMENT: true, localStorage: dom.window.localStorage, matchMedia };
  for (const [k, v] of Object.entries(globals)) Object.defineProperty(globalThis, k, { configurable: true, value: v });
  const { createRoot } = await import("react-dom/client");
  const root = createRoot(dom.window.document.getElementById("root")!);
  try {
    const html = dom.window.document.documentElement;
    await act(async () => root.render(createElement(Preferences, null, createElement(Probe, { sink: box }))));
    assert.equal(box.prefs.themePreference, "system");
    assert.ok(html.classList.contains("dark"));
    await act(async () => box.prefs.setTheme("light"));
    assert.equal(dom.window.localStorage.getItem("theme"), "light");
    assert.ok(!html.classList.contains("dark"));
    await act(async () => box.prefs.setTheme("system"));
    assert.equal(dom.window.localStorage.getItem("theme"), null);
    assert.ok(html.classList.contains("dark"));
    dark = false;
    await act(async () => listeners.forEach(l => l()));
    assert.ok(!html.classList.contains("dark"));
    assert.equal(box.prefs.theme, "light");
  } finally {
    await act(async () => root.unmount());
    dom.window.close();
    for (const k of Object.keys(globals)) Reflect.deleteProperty(globalThis, k);
  }
});
