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
    const block = text.slice(
      match.index,
      Math.min(close === -1 ? Infinity : close, match.index + 600),
    );
    if (/\bhref=|render=\{\s*<(?:Link|a)\b/.test(block) && backSign.test(block))
      return true;
  }
  return false;
}

/** What a consumer file breaks of the page-navigation rules (docs/STANDARDS.md, "Navegação da página"). */
export function navigationViolations(text) {
  const found = [];
  if (/from\s+["']@majapisoftwares\/ui\/components\/breadcrumb["']/.test(text))
    found.push(
      "pass breadcrumbs to AppShell; the shell draws the page's navigation",
    );
  // Pages outside the shell (AuthLayout) have no breadcrumb; their one way back is theirs to show.
  if (/<AuthLayout\b/.test(text)) return found;
  if (backLink(text) || /\b(?:router|history)\.back\(/.test(text))
    found.push(
      "no back buttons in pages; the AppShell breadcrumb links up (with a back arrow on phones)",
    );
  if (/<h1\b(?![^>]*\bsr-only\b)/.test(text))
    found.push(
      "the breadcrumb names the page; keep its h1 for screen readers (sr-only)",
    );
  if (refreshButton(text))
    found.push(
      "no refresh buttons; keep the screen current with useLiveRefresh (@majapisoftwares/ui/hooks/use-live-refresh)",
    );
  // `() => void load()` drops the promise: the hook can't hold the next ticks while it runs.
  if (/\buseLiveRefresh\(\s*\(\)\s*=>\s*void\b/.test(text))
    found.push(
      "useLiveRefresh: return the load's promise (useLiveRefresh(load) or () => load()), so a slow load isn't requested again while it runs",
    );
  return found;
}

// A native vertical scroll has no edge fade; every inner scroll area is the
// library's ScrollArea. A sideways strip (overflow-x-auto) stays native.
const nativeScrollClass =
  /(?<![\w-])(?:[\w-]+:|\[[^\]\s]+\]:)*!?overflow-(?:y-)?(?:auto|scroll)(?![\w-])/;
const nativeScrollStyle = /\boverflow(?:Y|-y)?\s*:\s*["']?(?:auto|scroll)\b/;
export function nativeScroll(text) {
  return nativeScrollClass.test(text) || nativeScrollStyle.test(text);
}

// A Button that reloads what's on screen: a refresh label, or an icon-only
// button with a rotate icon. A retry after a failure, and actions with their
// own label (Sync now, Reconnect), aren't refresh buttons.
const rotateIcon = /\b(?:Refresh|Rotate)(?:Cw|Ccw)Icon\b/;
export function refreshButton(text) {
  for (const match of text.matchAll(/<Button\b/g)) {
    const close = text.indexOf("</Button>", match.index);
    const block = text.slice(
      match.index,
      Math.min(close === -1 ? Infinity : close, match.index + 600),
    );
    if (/\b(?:t|ui|messages)\.retry\b/.test(block)) continue;
    if (
      /\bt\.refresh\b/.test(block) ||
      (/\bsize="icon[^"]*"/.test(block) && rotateIcon.test(block))
    )
      return true;
  }
  return false;
}


// Row actions of a table: icon-only buttons (DataTableRowAction, with the
// library Tooltip and an aria-label) in the last column, right-aligned. A
// Button in a table cell with a visible label, a native `title`, or in a
// column that isn't the last breaks the pattern. Header/toolbar buttons and
// link-variant buttons aren't row actions.
export function tableActionViolations(text) {
  const found = [];
  const cellStarts = [...text.matchAll(/\bcell:\s*/g)].map((m) => m.index);
  const tableCells = [...text.matchAll(/<TableCell\b[^>]*>/g)];
  for (const match of text.matchAll(/<Button\b/g)) {
    const close = text.indexOf("</Button>", match.index);
    const block = text.slice(
      match.index,
      Math.min(close === -1 ? Infinity : close, match.index + 700),
    );
    if (/\bvariant="link"/.test(block)) continue;
    const before = text.slice(0, match.index);
    // Inside a column definition's cell?
    const cellAt = cellStarts.filter((i) => i < match.index).at(-1);
    let column;
    if (cellAt !== undefined) {
      const between = text.slice(cellAt, match.index);
      if (!/\n\s*\]\s*;|<DataTable\b|\bheader:/.test(between)) {
        const head = text.slice(Math.max(0, cellAt - 400), cellAt);
        const id = [...head.matchAll(/\b(?:id|accessorKey):\s*"([^"]+)"/g)].at(-1);
        const arrayAt = Math.max(
          before.lastIndexOf("ColumnDef<"),
          before.lastIndexOf("columns = ["),
          before.lastIndexOf("columns: ["),
        );
        column = { id: id?.[1] };
        if (arrayAt >= 0) {
          const end = text.indexOf("];", match.index);
          const entries = [
            ...text
              .slice(arrayAt, end === -1 ? undefined : end)
              .matchAll(/\{\s*(?:id|accessorKey):\s*"([^"]+)"/g),
          ].map((m) => m[1]);
          column.last = entries.at(-1);
        }
      }
    }
    const cell = tableCells.filter((m) => m.index < match.index).at(-1);
    const inTableCell =
      cell && !text.slice(cell.index, match.index).includes("</TableCell>");
    if (!column && !inTableCell) continue;
    const where = column ? `column "${column.id ?? "?"}"` : "table cell";
    const openTag = block.slice(0, Math.max(block.indexOf("\n>"), 0) || 400);
    if (!/\bsize="icon[^"]*"/.test(openTag))
      found.push(
        `${where}: row actions are icon-only buttons (DataTableRowAction) with a Tooltip, not a text label`,
      );
    if (/\stitle=/.test(openTag))
      found.push(
        `${where}: use the Tooltip, not native title, for the action's name`,
      );
    if (column && column.id && column.last && column.id !== column.last)
      found.push(`${where}: row actions sit in the last column, right-aligned`);
    if (inTableCell) {
      const rowEnd = text.indexOf("</TableRow>", match.index);
      const after = text.slice(match.index, rowEnd === -1 ? undefined : rowEnd);
      if (/<TableCell\b/.test(after))
        found.push(`${where}: row actions sit in the last column, right-aligned`);
      if (!/text-right|justify-end/.test(cell[0]))
        found.push(`${where}: right-align the actions cell (text-right)`);
    }
  }
  return [...new Set(found)];
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
      violations.push(`${name}: the foundation uses ui-sdk`);
    if (/from\s+["']@base-ui\//.test(text))
      violations.push(
        `${name}: Base UI is gone; use the ui-sdk based components`,
      );
    if (!consumer && name.startsWith("components/ui/")) continue;
    if (consumer && /(?:^|\/)components\/ui\//.test(name))
      violations.push(`${name}: local UI primitive copies are forbidden`);
    if (/components\/native-select|<NativeSelect\b/.test(text))
      violations.push(`${name}: use Select (ui-sdk), not a native select`);
    if (/<(?:button|input|select|table|dialog)(?:\s|>)/.test(text))
      violations.push(`${name}: use the shared UI primitive`);
    if (
      /(?:bg|text|border)-(?:red|blue|green|orange|gray|slate|zinc)-\d|(?:bg|text|border)-\[#[a-f\d]/i.test(
        text,
      )
    )
      violations.push(`${name}: use semantic tokens instead of local colors`);
    if (
      consumer &&
      /from\s+["'](?:sonner|@majapisoftwares\/ui\/components\/(?:sonner|snackbar))["']/.test(
        text,
      )
    )
      violations.push(
        `${name}: notify with toast from @majapisoftwares/ui/components/toast`,
      );
    if (consumer && nativeScroll(text))
      violations.push(
        `${name}: scrolling areas use ScrollArea (@majapisoftwares/ui/components/scroll-area), which has the edge fade`,
      );
    if (consumer)
      for (const rule of tableActionViolations(text))
        violations.push(`${name}: ${rule}`);
    if (consumer)
      for (const rule of navigationViolations(text))
        violations.push(`${name}: ${rule}`);
    if (!consumer && /from ["']@\//.test(text))
      violations.push(`${name}: library internals must use portable imports`);
  }
}

// Imported by its test: only a direct run checks a tree.
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  await visit(root);
  if (violations.length) {
    console.error(violations.join("\n"));
    process.exitCode = 1;
  } else
    console.log(`UI standards passed (${consumer ? "consumer" : "library"}).`);
}
