// Decides the release bump from the commits since the last v* tag.
// Prints `none` (nothing publishable), `patch`, `minor` or `major`.
// Rules are documented in docs/VERSIONING.md ("Publicar").
import { execFileSync } from "node:child_process";

// Paths that ship in the npm package and change what apps receive.
const PUBLISHABLE = [
  /^src\//,
  /^scripts\/check-standards\.mjs$/,
  /^components\.json$/,
];

export function planBump(files, messages) {
  if (!files.some((file) => PUBLISHABLE.some((re) => re.test(file))))
    return "none";
  const text = messages.join("\n");
  if (/^[a-z]+(\([^)]*\))?!:/m.test(text) || /^BREAKING[ -]CHANGE/m.test(text))
    return "major";
  if (/^feat(\([^)]*\))?:/m.test(text)) return "minor";
  return "patch";
}

const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();

if (import.meta.url === `file://${process.argv[1]}`) {
  const tag = git("describe", "--tags", "--abbrev=0", "--match", "v*");
  const range = `${tag}..HEAD`;
  const files = git("diff", "--name-only", range).split("\n").filter(Boolean);
  const messages = git("log", "--no-merges", "--format=%s%n%b", range)
    .split("\n")
    .filter((line) => !line.startsWith("release: v"));
  console.log(planBump(files, messages));
}
