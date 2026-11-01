import reducer, { SEARCH_REQUEST_SESSION_STORAGE_KEY, types } from "./searchFilterReducer";

describe("searchFilterReducer", () => {
  it("restores the saved search request", () => {
    const request = { name: "Test", includeVoided: true };
    sessionStorage.setItem(SEARCH_REQUEST_SESSION_STORAGE_KEY, JSON.stringify(request));

    expect(reducer(undefined, { type: "@@INIT" }).request).toEqual(request);
  });

  it("returns the default request when saved search data is invalid", () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    try {
      sessionStorage.setItem(SEARCH_REQUEST_SESSION_STORAGE_KEY, "{invalid json");

      expect(reducer(undefined, { type: "@@INIT" }).request).toEqual({
        includeVoided: false,
        includeDisplayCount: false,
      });

      expect(consoleErrorSpy).toHaveBeenCalled();
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });

  it("resets the search request to default values", () => {
    const state = {
      request: { name: "Test", includeVoided: true },
    };

    expect(reducer(state, { type: types.RESET_SEARCH_REQUEST }).request).toEqual({
      includeVoided: false,
      includeDisplayCount: false,
    });
  });
});
