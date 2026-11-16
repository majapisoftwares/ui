import { readdir, readFile } from "node:fs/promises";
import { resolve, relative } from "node:path";
import { pathToFileURL } from "node:url";
const consumer = process.argv[2];
const root = resolve(consumer ?? "src");
const violations = [];

// A link (or a Button rendering one) that goes back: a left arrow or a
// `back…` label. Inside the AppShell the breadcrumb is the way up, and the
// shell adds the phone's back arrow itself.
const backSign =
  /\b(?:ArrowLeft|ChevronLeft|MoveLeft|CornerUpLeft|Undo2?)Icon\b|\bt\.back(?:[A-Z]\w*)?\b/;
export function backLink(text) {
  for (const match of text.matchAll(/<(Button|Link|a|BreadcrumbLink)\b/g)) {
    const close = text.indexOf(`</${match[1]}>`, match.index);
    const block = text.slice(match.index, Math.min(close === -1 ? Infinity : close, match.index + 600));
    if (/\bhref=|render=\{\s*<(?:Link|a)\b/.test(block) && backSign.test(block)) return true;
  }
  return false;
}

/** What a consumer file breaks of the page-navigation rules (docs/STANDARDS.md, "Navegação da página"). */
export function navigationViolations(text) {
  const found = [];
  if (/from\s+["']@majapisoftwares\/ui\/components\/breadcrumb["']/.test(text))
    found.push("pass breadcrumbs to AppShell; the shell draws the page's navigation");
  // Pages outside the shell (AuthLayout) have no breadcrumb; their one way back is theirs to show.
  if (/<AuthLayout\b/.test(text)) return found;
  if (backLink(text) || /\b(?:router|history)\.back\(/.test(text))
    found.push("no back buttons in pages; the AppShell breadcrumb links up (with a back arrow on phones)");
  if (/<h1\b(?![^>]*\bsr-only\b)/.test(text))
    found.push("the breadcrumb names the page; keep its h1 for screen readers (sr-only)");
  if (refreshButton(text))
    found.push("no refresh buttons; keep the screen current with useLiveRefresh (@majapisoftwares/ui/hooks/use-live-refresh)");
  // `() => void load()` drops the promise: the hook can't hold the next ticks while it runs.
  if (/\buseLiveRefresh\(\s*\(\)\s*=>\s*void\b/.test(text))
    found.push("useLiveRefresh: return the load's promise (useLiveRefresh(load) or () => load()), so a slow load isn't requested again while it runs");
  return found;
}

// A Button that reloads what's on screen: a refresh label, or an icon-only
// button with a rotate icon. A retry after a failure, and actions with their
// own label (Sync now, Reconnect), aren't refresh buttons.
const rotateIcon = /\b(?:Refresh|Rotate)(?:Cw|Ccw)Icon\b/;
export function refreshButton(text) {
  for (const match of text.matchAll(/<Button\b/g)) {
    const close = text.indexOf("</Button>", match.index);
    const block = text.slice(match.index, Math.min(close === -1 ? Infinity : close, match.index + 600));
    if (/\b(?:t|ui|messages)\.retry\b/.test(block)) continue;
    if (/\bt\.refresh\b/.test(block) || (/\bsize="icon[^"]*"/.test(block) && rotateIcon.test(block))) return true;
  }
  return false;
}

async function visit(path) {
  for (const entry of await readdir(path, { withFileTypes: true })) {
    if (["node_modules", "dist", ".git"].includes(entry.name)) continue;
    const file = resolve(path, entry.name);
    if (entry.isDirectory()) {
      await visit(file);
      continue;
    }
    if (!/\.[jt]sx?$/.test(entry.name)) continue;
    const text = await readFile(file, "utf8"),
      name = relative(root, file).replaceAll("\\", "/");
    if (/from\s+["'](?:radix-ui|@radix-ui\/)/.test(text))
      violations.push(`${name}: the Workbench foundation uses Base UI`);
    if (!consumer && name.startsWith("components/ui/")) continue;
    if (consumer && /(?:^|\/)components\/ui\//.test(name))
      violations.push(`${name}: local UI primitive copies are forbidden`);
    if (/components\/native-select|<NativeSelect\b/.test(text))
      violations.push(`${name}: use Select (Base UI), not a native select`);
    if (/<(?:button|input|select|table|dialog)(?:\s|>)/.test(text))
      violations.push(`${name}: use the shared UI primitive`);
    if (
      /(?:bg|text|border)-(?:red|blue|green|orange|gray|slate|zinc)-\d|(?:bg|text|border)-\[#[a-f\d]/i.test(
        text,
      )
    )
      violations.push(`${name}: use semantic tokens instead of local colors`);
    if (consumer && /from\s+["'](?:sonner|@majapisoftwares\/ui\/components\/(?:sonner|snackbar))["']/.test(text))
      violations.push(`${name}: notify with toast from @majapisoftwares/ui/components/toast`);
    if (consumer)
      for (const rule of navigationViolations(text)) violations.push(`${name}: ${rule}`);
    if (!consumer && /from ["']@\//.test(text))
      violations.push(`${name}: library internals must use portable imports`);
  }
}

// Imported by its test: only a direct run checks a tree.
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await visit(root);
  if (violations.length) {
    console.error(violations.join("\n"));
    process.exitCode = 1;
  } else
    console.log(`UI standards passed (${consumer ? "consumer" : "library"}).`);
}
