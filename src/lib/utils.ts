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
