export default {
  testEnvironment: "jsdom",
  extensionsToTreatAsEsm: [],
  moduleFileExtensions: ["js", "jsx", "ts", "tsx"],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "\\.(jpg|jpeg|png|gif|svg)$": "<rootDir>/__mocks__/fileMock.js"
  },
  transform: {},
  transformIgnorePatterns: ["/node_modules/(?!axios|react-admin|fetchUtils)/"]
};
