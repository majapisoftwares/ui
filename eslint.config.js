import js from "@eslint/js";
import tseslint from "typescript-eslint";
import hooks from "eslint-plugin-react-hooks";
export default tseslint.config(
  {
    ignores: [
      "dist/**",
      "**/node_modules/**",
      "**/.next/**",
      "artifacts/**",
      "starters/**",
      "catalog/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { "react-hooks": hooks },
    rules: { ...hooks.configs.recommended.rules },
  },
  {
    // shadcn's Message Scroller source (MIT), kept as upstream wrote it so it
    // can be diffed against new releases; see THIRD_PARTY_NOTICES.md.
    files: ["src/lib/message-scroller/**"],
    rules: {
      ...Object.fromEntries(Object.keys(hooks.configs.recommended.rules).filter((rule) => rule !== "react-hooks/rules-of-hooks").map((rule) => [rule, "off"])),
      "no-useless-assignment": "off",
    },
  },
  {
    files: ["scripts/*.mjs"],
    languageOptions: { globals: { console: "readonly", process: "readonly" } },
  },
);
