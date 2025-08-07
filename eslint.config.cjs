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
        requireConfigFile: true,
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
        jest: "readonly",
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
      react,
    },
    rules: {
      'no-undef': 'error',
      'import/no-duplicates': 'error',
      'no-duplicate-imports': 'off',
      'import/no-unresolved': ['error', { ignore: ['\\.css$'] }],
      'import/named': 'error',
      'import/default': 'error',
      'import/no-absolute-path': ['error', { esmodule: true, commonjs: false }],
      'import/extensions': ['error', 'always', { js: 'never', jsx: 'never' }],
      'import/no-named-as-default': 'warn',
      'import/no-named-as-default-member': 'warn',
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'error',
      'react/prop-types': 'off',
      'react/jsx-filename-extension': ['warn', { extensions: ['.jsx'] }],
    },
    settings: {
      react: { version: '18.0' },
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
          paths: ['src'],
          moduleDirectory: ['node_modules', 'src'],
        },
      },
    },
  },
  {
    files: ["**/*.test.js", "**/*.spec.js", "**/setupTests.js", "**/jestGlobalsSetup.js"],
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
        global: "readonly",
        TextEncoder: "readonly",
        TextDecoder: "readonly",
      },
    },
    rules: {
      "no-undef": "error",
    },
  },
];