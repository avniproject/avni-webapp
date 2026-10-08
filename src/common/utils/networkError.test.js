import { assert } from "chai";
import { AxiosError, CanceledError } from "axios";
import { isNetworkError } from "./networkError";

describe("isNetworkError", () => {
  const originalOnLine = Object.getOwnPropertyDescriptor(window.navigator, "onLine");

  const setOnLine = (isOnLine) => Object.defineProperty(window.navigator, "onLine", { configurable: true, get: () => isOnLine });

  beforeEach(() => setOnLine(true));

  afterAll(() => {
    if (originalOnLine) Object.defineProperty(window.navigator, "onLine", originalOnLine);
  });

  it("is true for an axios request that never got a response", () => {
    assert.isTrue(isNetworkError(new AxiosError("Network Error", AxiosError.ERR_NETWORK)));
  });

  it("is true for an axios request that was aborted or timed out", () => {
    assert.isTrue(isNetworkError(new AxiosError("Request aborted", AxiosError.ECONNABORTED)));
    assert.isTrue(isNetworkError(new AxiosError("timeout exceeded", AxiosError.ETIMEDOUT)));
  });

  it("is false for an axios request the server answered with an error", () => {
    const serverError = new AxiosError(
      "Request failed with status code 500",
      AxiosError.ERR_BAD_RESPONSE,
      {},
      {},
      { status: 500, data: "boom" },
    );
    assert.isFalse(isNetworkError(serverError));
  });

  it("is false for an axios request the app cancelled itself", () => {
    assert.isFalse(isNetworkError(new CanceledError()));
  });

  it("is true for fetch failing in Chrome, Firefox and Safari", () => {
    assert.isTrue(isNetworkError(new TypeError("Failed to fetch")));
    assert.isTrue(isNetworkError(new TypeError("NetworkError when attempting to fetch resource.")));
    assert.isTrue(isNetworkError(new TypeError("Load failed")));
  });

  it("is false for a TypeError that is a bug in our code", () => {
    assert.isFalse(isNetworkError(new TypeError("Cannot read properties of undefined (reading 'data')")));
  });

  it("is true for an Amplify token refresh that could not reach Cognito", () => {
    const amplifyError = new Error("A network error has occurred.");
    amplifyError.name = "NetworkError";
    assert.isTrue(isNetworkError(amplifyError));
  });

  it("is false for an ordinary error while the browser is online", () => {
    assert.isFalse(isNetworkError(new Error("boom")));
  });

  it("is true for any error while the browser reports it is offline", () => {
    setOnLine(false);
    assert.isTrue(isNetworkError(new TypeError("Cannot read properties of undefined (reading 'data')")));
  });

  it("is false for nothing at all", () => {
    assert.isFalse(isNetworkError(undefined));
    assert.isFalse(isNetworkError(null));
  });
});
