import js from "@eslint/js";
import react from "eslint-plugin-react";
import importPlugin from "eslint-plugin-import";

export default [
  js.configs.recommended,
  {
    files: ["**/*.js", "**/*.jsx"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module"
    },
    plugins: {
      import: importPlugin,
      react: react
    },
    rules: {
      "import/no-duplicates": "off",
      "no-duplicate-imports": ["error", { includeExports: true }],
      "import/no-unresolved": "error",
      "import/named": "error",
      "import/default": "error",
      "import/no-named-as-default": "warn",
      "import/no-named-as-default-member": "warn"
    },
    settings: {
      "import/resolver": {
        node: {
          extensions: [".js", ".jsx", ".ts", ".tsx"]
        }
      }
    }
  }
];
