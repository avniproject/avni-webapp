import reducer, {
  clearSavedSearchRequest,
  getInitialState,
  loadSearchPaging,
  saveSearchPaging,
  saveSearchRequest,
  SEARCH_REQUEST_STORAGE_KEY,
  types,
} from "./searchFilterReducer";

const searchRequest = {
  subjectType: "subject-type-uuid",
  name: "Asha",
  age: { minValue: "30", maxValue: null },
  includeVoided: true,
  includeDisplayCount: true,
  addressIds: [11, 12],
  gender: ["gender-uuid"],
  concept: [
    {
      uuid: "coded-concept-uuid",
      searchScope: "registration",
      dataType: "Coded",
      widget: "Default",
      values: ["answer-uuid"],
    },
  ],
  registrationDate: { minValue: "2026-01-01", maxValue: "2026-10-29" },
};

describe("searchFilterReducer", () => {
  beforeEach(() => sessionStorage.clear());

  it("starts with an empty search when nothing was saved", () => {
    expect(getInitialState()).toEqual({
      request: { includeVoided: false, includeDisplayCount: false },
    });
  });

  it("restores the saved search after a refresh", () => {
    saveSearchRequest(searchRequest);

    expect(getInitialState().request).toEqual(searchRequest);
    expect(reducer(undefined, { type: "@@INIT" }).request).toEqual(searchRequest);
  });

  it("forgets the search once it is cleared", () => {
    saveSearchRequest(searchRequest);
    clearSavedSearchRequest();

    expect(sessionStorage.getItem(SEARCH_REQUEST_STORAGE_KEY)).toBeNull();
    expect(getInitialState().request).toEqual({
      includeVoided: false,
      includeDisplayCount: false,
    });
  });

  it("falls back to an empty search when the saved value is unreadable", () => {
    sessionStorage.setItem(SEARCH_REQUEST_STORAGE_KEY, "{not json");

    expect(getInitialState().request).toEqual({
      includeVoided: false,
      includeDisplayCount: false,
    });
  });

  it("stores the request on ADD_SEARCH_REQUEST", () => {
    const state = reducer(getInitialState(), {
      type: types.ADD_SEARCH_REQUEST,
      value: searchRequest,
    });

    expect(state.request).toEqual(searchRequest);
  });

  describe("results page (#502)", () => {
    const paging = { pageIndex: 2, pageSize: 20 };
    const sorting = [{ id: "fullName", desc: true }];

    it("opens on page 1 when nothing was saved", () => {
      expect(loadSearchPaging(searchRequest)).toEqual({
        pagination: { pageIndex: 0, pageSize: 10 },
        sorting: [],
      });
    });

    it("brings back the same page and sort order for the same search", () => {
      saveSearchPaging(searchRequest, paging, sorting);

      expect(loadSearchPaging({ ...searchRequest })).toEqual({
        pagination: paging,
        sorting,
      });
    });

    it("starts from page 1 for a different search", () => {
      saveSearchPaging(searchRequest, paging, sorting);

      expect(loadSearchPaging({ ...searchRequest, name: "Rani" }).pagination.pageIndex).toBe(0);
    });

    it("forgets the page when the search is cleared", () => {
      saveSearchPaging(searchRequest, paging, sorting);
      clearSavedSearchRequest();

      expect(loadSearchPaging(searchRequest).pagination.pageIndex).toBe(0);
    });
  });
});
