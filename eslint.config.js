// @ts-check
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import prettierConfig from "eslint-config-prettier";

export default tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/build/**",
      "**/target/**",
      "**/node_modules/**",
      "**/src-tauri/target/**",
      "**/.vite/**",
      "**/coverage/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },
  {
    files: [
      "packages/core/**/*.{ts,tsx}",
      "packages/search/**/*.{ts,tsx}",
      "packages/ui/**/*.{ts,tsx}",
      "packages/protocol/**/*.{ts,tsx}",
      "apps/desktop/src/**/*.{ts,tsx}",
    ],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "BinaryExpression[operator=/^(===|!==|==|!=)$/][left.property.name='source']",
          message:
            "No source-name branching in shared/core code. Branch on capabilities()/UI-Slots, not on source identity strings (Architecture Guardrail).",
        },
      ],
    },
  },
  {
    files: [
      "**/*.config.{js,ts}",
      "**/vite.config.ts",
      "**/vitest.config.ts",
      "**/vitest.setup.ts",
    ],
    languageOptions: {
      parserOptions: {
        projectService: false,
      },
    },
    ...tseslint.configs.disableTypeChecked,
  },
  prettierConfig,
);
