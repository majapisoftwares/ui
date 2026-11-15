export { cn } from "cn";

/**
 * Markdown as one line of plain text, for a `ChatQuote` of an agent's reply:
 * no code blocks, emphasis, links, list markers or table pipes.
 */
export function quoteText(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?(```|$)/g, " ")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+[.)])\s+/gm, "")
    .replace(/^[\s|:-]*-{3,}[\s|:-]*$/gm, " ")
    .replace(/\|/g, " ")
    .replace(/\*\*|__|~~|`|\*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * The host an "always open" choice for a link applies to (lowercase, no port),
 * or null for anything but an absolute http(s) URL.
 */
export function linkHost(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:"
      ? parsed.hostname.toLowerCase()
      : null;
  } catch {
    return null;
  }
}
