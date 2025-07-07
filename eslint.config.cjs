const js = require("@eslint/js");
const react = require("eslint-plugin-react");
const importPlugin = require("eslint-plugin-import");
const babelParser = require("@babel/eslint-parser");

module.exports = [
  js.configs.recommended,
  {
    files: ["**/*.js", "**/*.jsx"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      parser: babelParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        requireConfigFile: false,
        babelOptions: {
          presets: ["@babel/preset-env", "@babel/preset-react"],
        },
      },
      globals: {
        AbortController: "readonly",
        alert: "readonly",
        Blob: "readonly",
        clearInterval: "readonly",
        console: "readonly",
        FileReader: "readonly",
        FormData: "readonly",
        fetch: "readonly",
        document: "readonly",
        Headers: "readonly",
        localStorage: "readonly",
        module: "readonly",
        navigator: "readonly",
        process: "readonly",
        require: "readonly",
        sessionStorage:"readonly",
        setInterval: "readonly",
        setTimeout: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        window: "readonly",
      },
    },
    plugins: {
      import: importPlugin,
      react: react,
    },
    rules: {
      "no-undef": "error",
      "import/no-duplicates": ["error"],
      "no-duplicate-imports": "off",
      "import/no-unresolved": "error",
      "import/named": "error",
      "import/default": "error",
      "import/no-named-as-default": "warn",
      "import/no-named-as-default-member": "warn",
      "react/jsx-uses-react": "off",
      "react/jsx-uses-vars": "error",
      "react/prop-types": "off",
    },
    settings: {
      react: { version: "18.0" },
      "import/resolver": {
        node: {
          extensions: [".js", ".jsx", ".ts", ".tsx"],
          paths: ["src"],
        },
      },
    },
  },
  {
    files: ["**/*.test.js", "**/*.spec.js"],
    languageOptions: {
      globals: {
        describe: "readonly",
        it: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        jest: "readonly",
      },
    },
    rules: {
      "no-undef": "error",
    },
  },
];