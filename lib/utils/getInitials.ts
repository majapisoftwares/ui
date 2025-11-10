/**
 * Gets all the initials of a name.
 */
export default function getInitials(name: string): string {
  if (!name) return "";

  // Normalize to decompose diacritics, then remove any non-letter characters.
  const normalizeAndClean = (s: string) =>
    s
      .normalize("NFD") // decompose combined letters (e.g., é -> e + ´)
      .replace(/\p{M}/gu, "") // remove diacritic marks
      .replace(/[^A-Za-zÀ-ÖØ-öø-ÿ]/g, "") // strip anything that's not a letter (basic Latin + Latin-1 Supplement)
      .trim();

  // Split into words, clean each word, take first letter of up to two words.
  const words = name.split(/\s+/);
  const initials = words
    .map((w) => normalizeAndClean(w))
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");

  return initials;
}
