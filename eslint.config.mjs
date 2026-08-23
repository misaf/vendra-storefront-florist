import { defineConfig, globalIgnores } from "eslint/config";
import nextPlugin from "@next/eslint-plugin-next";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

const eslintConfig = defineConfig([
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "@next/next": nextPlugin,
      "react-hooks": reactHooks,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/components/*",
                "@/contexts/*",
                "@/hooks/*",
                "@/i18n/*",
                "@/lib/*",
              ],
              message:
                "Use the modular structure: import shared code from @/shared/* or feature code from @/modules/<feature>.",
            },
            {
              group: [
                "@/modules/*/components/*",
                "@/modules/*/hooks/*",
                "@/modules/*/lib/*",
                "@/modules/*/types",
              ],
              message:
                "Do not import module internals from outside the module. Use the module barrel, e.g. @/modules/products.",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
