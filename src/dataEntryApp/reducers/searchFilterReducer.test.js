import reducer, { SEARCH_REQUEST_SESSION_STORAGE_KEY } from "./searchFilterReducer";

describe("searchFilterReducer", () => {
  it("restores the saved search request", () => {
    const request = { name: "Test", includeVoided: true };
    sessionStorage.setItem(SEARCH_REQUEST_SESSION_STORAGE_KEY, JSON.stringify(request));

    expect(reducer(undefined, { type: "@@INIT" }).request).toEqual(request);
  });
});
