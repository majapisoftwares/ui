/**
 * Formats the given time in milliseconds into a human-readable string.
 * @param time - The time in milliseconds.
 * @param opts - Optional settings.
 * @param opts.includeMs - Whether to include milliseconds in the output.
 * @returns A string representing the formatted time.
 */
export default function formatTime(
  time: number,
  opts?: { includeMs?: boolean },
) {
  const includeMs = opts?.includeMs;
  const totalMilliseconds = Math.max(0, Math.floor(time));
  const totalSeconds = Math.floor(totalMilliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const ms = totalMilliseconds % 1000;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0) parts.push(`${seconds}s`);
  if (includeMs && ms > 0) parts.push(`${ms}ms`);

  // Maintain previous behavior: if everything is zero and ms not requested or zero, return empty string
  if (parts.length === 0) {
    if (includeMs && ms > 0) return `${ms}ms`;
    return "";
  }
  return parts.join(" ");
}

/**
 * Parses a formatted time string and converts it to milliseconds.
 * @param formattedTime - The formatted time string (e.g., "1h 30m 15s"), may be undefined/null.
 * @returns The time in milliseconds.
 */
export function parseFormattedTime(formattedTime?: string | null) {
  if (!formattedTime) return 0;

  let totalMilliseconds = 0;
  const regex = /(\d+(?:\.\d+)?)(ms|h|m|s)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(formattedTime)) !== null) {
    const valueStr = match[1]!; // capture group 1 is ensured by the regex pattern
    const value = parseFloat(valueStr);
    const unit = match[2]!;
    if (isNaN(value)) continue;
    switch (unit) {
      case "h":
        totalMilliseconds += value * 3600000;
        break;
      case "m":
        totalMilliseconds += value * 60000;
        break;
      case "s":
        totalMilliseconds += value * 1000;
        break;
      case "ms":
        totalMilliseconds += value;
        break;
    }
  }
  return totalMilliseconds;
}
