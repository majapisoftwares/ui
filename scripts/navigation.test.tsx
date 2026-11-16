import assert from "node:assert/strict";
import { test } from "node:test";
import { JSDOM } from "jsdom";
import { act, createElement } from "react";
// @ts-expect-error plain ESM script, no types
import { navigationViolations } from "./check-standards.mjs";

// The page-navigation rule (docs/STANDARDS.md, "Navegação da página"): one
// way up per page. The shell draws it; check:standards stops apps from
// adding a second one.

test("check:standards stops hand-made navigation in apps", () => {
  const flagged = (source: string) => navigationViolations(source) as string[];
  // The header arrow Workbench had next to its breadcrumb, on every screen size.
  assert.equal(flagged(`<Button variant="ghost" size="icon-sm" aria-label={t.backTo(t[state.title])} render={<Link href={href}/>} nativeButton={false}><ArrowLeftIcon/></Button>`).length, 1);
  // A text button back to the page the person came from.
  assert.match(flagged(`<Button variant="ghost" size="sm" nativeButton={false}\n  render={<a href={\`/boards/\${id}\`} />}>\n  {t.backToBoard}\n</Button>`)[0], /no back buttons/);
  assert.match(flagged(`<Button onClick={() => router.back()}>{t.cancel}</Button>`)[0], /no back buttons/);
  assert.match(flagged(`import { Breadcrumb } from "@majapisoftwares/ui/components/breadcrumb";`)[0], /pass breadcrumbs to AppShell/);
  assert.match(flagged(`<h1 className="text-xl font-semibold">{board.name}</h1>`)[0], /breadcrumb names the page/);

  // Not navigation: a remote browser's own back button, and the screen-reader heading.
  assert.deepEqual(flagged(`<Button variant="ghost" size="icon" aria-label={t.goBack} onClick={() => send({ type: "back" })}><ArrowLeftIcon /></Button>`), []);
  assert.deepEqual(flagged(`<h1 className="sr-only">{t[state.title]}</h1>`), []);
  // A page outside the shell has no breadcrumb: its return action is its own.
  assert.deepEqual(flagged(`<AuthLayout>{children}</AuthLayout>\n<Button render={<a href="/agent" />}>{t.backToAgent}</Button>\n<h1 className="text-xl">{title}</h1>`), []);
});

test("check:standards stops refresh buttons; screens refresh on their own", () => {
  const flagged = (source: string) => navigationViolations(source) as string[];
  // The icon button every Workbench list had next to its actions.
  assert.match(flagged(`<Button variant="outline" size="icon-sm" aria-label={t.refresh} title={t.refresh} disabled={loading} onClick={() => void load()}>\n  <RotateCwIcon className={loading ? "animate-spin" : ""} />\n</Button>`)[0], /no refresh buttons/);
  assert.match(flagged(`<Button variant="outline" onClick={reload}>{t.refresh}</Button>`)[0], /no refresh buttons/);
  assert.match(flagged(`<Button size="icon" aria-label={t.update} onClick={load}><RefreshCwIcon /></Button>`)[0], /no refresh buttons/);

  // Not refreshes: a retry after a failure, and actions with their own label.
  assert.deepEqual(flagged(`<Button variant="outline" size="sm" onClick={onRetry}><RotateCwIcon />{ui.retry}</Button>`), []);
  assert.deepEqual(flagged(`<Button variant="outline" size="sm" onClick={sync}><RotateCwIcon />{t.syncNow}</Button>`), []);
  assert.deepEqual(flagged(`<Button disabled={busy} onClick={generate}>{busy ? <RotateCwIcon className="animate-spin" /> : null}{t.createPr}</Button>`), []);
});

test("the shell shows the trail, and on phones one back arrow to the nearest linked parent", async () => {
  const dom = new JSDOM('<html><body><div id="root"></div></body></html>', { url: "https://example.test/sessions/1", pretendToBeVisual: true });
  dom.window.matchMedia = ((query: string) => ({ matches: false, media: query, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, onchange: null, dispatchEvent: () => false })) as typeof dom.window.matchMedia;
  const keys = ["window", "document", "navigator", "HTMLElement", "Element", "Node", "MutationObserver", "getComputedStyle", "localStorage", "matchMedia", "IS_REACT_ACT_ENVIRONMENT"];
  const saved = new Map(keys.map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  for (const key of keys) {
    let value = key === "IS_REACT_ACT_ENVIRONMENT" ? true : dom.window[key as keyof typeof dom.window];
    if (typeof value === "function" && (key === "getComputedStyle" || key === "matchMedia")) value = value.bind(dom.window);
    Object.defineProperty(globalThis, key, { configurable: true, value });
  }
  const { createRoot } = await import("react-dom/client");
  const { AppShell } = await import("../src/patterns/app-shell");
  const root = createRoot(dom.window.document.getElementById("root")!);
  const opened: string[] = [];
  const render = (breadcrumbs: { label: string | null; href?: string }[]) =>
    act(async () => {
      root.render(
        createElement(AppShell, {
          logo: null,
          name: "App",
          navigation: [],
          activeId: "boards",
          onNavigate: () => undefined,
          breadcrumbs,
          onBreadcrumbNavigate: (href: string) => opened.push(href),
          children: null,
        }),
      );
    });
  const header = () => dom.window.document.querySelector("header")!;
  const backLinks = () => [...header().querySelectorAll("a")].filter((link) => /^Back/.test(link.getAttribute("aria-label") ?? ""));
  try {
    // A session opened from a board sits under that board.
    await render([{ label: "Boards", href: "/boards" }, { label: "Launch", href: "/boards/7" }, { label: "Fix typing" }]);
    const [back] = backLinks();
    assert.equal(backLinks().length, 1, "one way back");
    assert.equal(back.getAttribute("href"), "/boards/7");
    assert.equal(back.getAttribute("aria-label"), "Back to Launch");
    assert.match(back.className, /md:hidden/, "the arrow is for phones only");
    assert.equal(back.getAttribute("role"), null, "a link (it navigates), not a button");
    // From md up the trail links up instead; on phones the parents are hidden.
    const trail = [...header().querySelectorAll('[data-slot="breadcrumb-link"]')];
    assert.deepEqual(trail.map((link) => link.getAttribute("href")), ["/boards", "/boards/7"]);
    for (const link of trail) assert.match(link.closest("li")!.className, /\bhidden\b.*md:inline-flex/);
    assert.equal(header().querySelector('[aria-current="page"]')?.textContent, "Fix typing");

    await act(async () => back.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true, cancelable: true, button: 0 })));
    assert.deepEqual(opened, ["/boards/7"], "client-side navigation");

    // Sibling pages under a group: no parent to go back to.
    await render([{ label: "Settings" }, { label: "Harness" }]);
    assert.equal(backLinks().length, 0);
    assert.equal(header().querySelectorAll('[data-slot="breadcrumb-link"]').length, 0);

    // The name is still loading.
    await render([{ label: "Boards", href: "/boards" }, { label: null }]);
    assert.ok(header().querySelector('[aria-current="page"] [data-slot="skeleton"]'));
  } finally {
    await act(async () => root.unmount());
    for (const [key, descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
    dom.window.close();
  }
});
