import js from "@eslint/js";
import react from "eslint-plugin-react";
import importPlugin from "eslint-plugin-import";
import babelParser from "@babel/eslint-parser";
export default [
  js.configs.recommended,
  {
    files: ["**/*.js", "**/*.jsx"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      parser: babelParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        },
        requireConfigFile: false,
        babelOptions: {
          presets: ["@babel/preset-env", "@babel/preset-react"]
        }
      },
      globals: {
        console: "readonly",
        window: "readonly",
        document: "readonly",
        alert: "readonly",
        localStorage: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        setTimeout: "readonly"
      }
    },
    plugins: {
      import: importPlugin,
      react: react
    },
    rules: {
      "no-undef": "error",
      "import/no-duplicates": "off",
      "no-duplicate-imports": ["error", { includeExports: true }],
      "import/no-unresolved": "error",
      "import/named": "error",
      "import/default": "error",
      "import/no-named-as-default": "warn",
      "import/no-named-as-default-member": "warn",
      "react/jsx-uses-vars": "error",
      "react/prop-types": "off"
    },
    settings: {
      react: {
        version: "18.0"
      },
      "import/resolver": {
        node: {
          extensions: [".js", ".jsx", ".ts", ".tsx"],
          paths: ["src"]
        }
      }
    }
  }
];
