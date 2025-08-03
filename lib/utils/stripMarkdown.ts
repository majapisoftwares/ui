export default function stripMarkdown<T extends string>(markdown?: T) {
  if (!markdown) return markdown;

  // Remove headers
  let result = markdown.replace(/(^|\n)#+\s?/g, "");

  // Remove bold and italic (e.g., **text**, __text__, *text*, _text_)
  result = result.replace(/(\*\*|__)(.*?)\1/g, "$2");
  result = result.replace(/([*_])(.*?)\1/g, "$2");

  // Remove strikethrough (e.g., ~~text~~)
  result = result.replace(/~~(.*?)~~/g, "$1");

  // Remove inline code (e.g., `code`)
  result = result.replace(/`([^`]+)`/g, "$1");

  // Remove blockquotes (e.g., > text)
  result = result.replace(/(^|\n)>+/g, "");

  // Remove images and links (e.g., ![alt](url) and [text](url))
  result = result.replace(/!\[.*?]\(.*?\)/g, "");
  result = result.replace(/\[(.*?)]\(.*?\)/g, "$1");

  // Remove unordered lists (e.g., - text, * text)
  result = result.replace(/(^|\n)[*-]\s+/g, "");

  // Remove ordered lists (e.g., 1. text)
  result = result.replace(/(^|\n)\d+\.\s+/g, "");

  // Remove horizontal rules (e.g., --- or ***)
  result = result.replace(/(^|\n)(---|\*\*\*)/g, "");

  // Remove extra newlines
  result = result.replace(/\n{2,}/g, "\n");

  // Trim leading and trailing spaces
  return result.trim();
}
