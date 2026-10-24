// Makes shadcn CLI output portable: relative imports and RSC client boundaries.
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const targets = [
  ["src/components/ui", { "@/components/ui/": "./", "@/hooks/": "../../hooks/", "@/lib/": "../../lib/" }],
  ["src/hooks", { "@/components/ui/": "../components/ui/", "@/lib/": "../lib/" }],
];
for (const [dir, aliases] of targets)
  for (const name of await readdir(dir)) {
    if (!/\.tsx?$/.test(name)) continue;
    const file = join(dir, name);
    let text = await readFile(file, "utf8");
    for (const [from, to] of Object.entries(aliases))
      text = text.replaceAll(`"${from}`, `"${to}`);
    if (!/^["']use client["']/.test(text)) text = `"use client";\n\n${text}`;
    await writeFile(file, text);
  }
