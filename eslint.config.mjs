import nextPlugin from "@next/eslint-plugin-next";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["**/.next/**", "**/.wxt/**", "**/.output/**", "**/dist/**"],
  },
  ...tseslint.configs.recommended,
  {
    files: ["apps/web/**/*.{js,jsx,ts,tsx}"],
    plugins: { "@next/next": nextPlugin },
    rules: nextPlugin.configs.recommended.rules,
  },
  {
    files: ["apps/extension/entrypoints/**/*.content.ts"],
    rules: {
      "no-restricted-globals": [
        "error",
        { name: "fetch", message: "Content scripts must not make network requests." },
        { name: "XMLHttpRequest", message: "Content scripts must not make network requests." },
        { name: "WebSocket", message: "Content scripts must not make network requests." },
        { name: "EventSource", message: "Content scripts must not make network requests." },
      ],
    },
  },
);
