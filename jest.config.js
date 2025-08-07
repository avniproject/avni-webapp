module.exports = {
  testEnvironment: "jsdom",
  moduleFileExtensions: ["js", "jsx", "ts", "tsx"],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "\\.(jpg|jpeg|png|gif|svg)$": "<rootDir>/__mocks__/fileMock.js",
    // Mock problematic ES modules
    "^react-hotkeys-hook$": "<rootDir>/__mocks__/react-hotkeys-hook.js",
    // Map specific directory patterns - order matters!
    "^dataEntryApp/(.*)$": "<rootDir>/src/dataEntryApp/$1",
    "^common/(.*)$": "<rootDir>/src/common/$1",
    "^rootApp/(.*)$": "<rootDir>/src/rootApp/$1",
    "^avni-models$": "<rootDir>/src/avni-models.js"
  },
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": [
      "babel-jest",
      {
        configFile: "./babel.config.cjs"
      }
    ]
  },
  transformIgnorePatterns: [
    "/node_modules/(?!axios|react-admin|fetchUtils|@mui|@emotion|@reduxjs|redux-toolkit|openchs-models|lodash-es|chai|react-hotkeys-hook|ra-ui-materialui|ra-core)/"
  ],

  // Use CommonJS for setup files to avoid ES module issues
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.cjs"],

  modulePaths: ["<rootDir>/src"],

  globals: {
    "ts-jest": {
      useESM: false,
      tsconfig: {
        module: "commonjs",
        target: "es2017"
      }
    }
  }
};
