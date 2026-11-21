import reducer, {
  clearSavedSearchRequest,
  getInitialState,
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
    expect(reducer(undefined, { type: "@@INIT" }).request).toEqual(
      searchRequest,
    );
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
});
