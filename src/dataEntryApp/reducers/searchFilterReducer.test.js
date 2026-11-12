import reducer, {
  clearSavedSearchRequest,
  getInitialState,
  resetSearchRequest,
  saveSearchRequest,
  SEARCH_REQUEST_STORAGE_KEY,
  toUsableSearchRequest,
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

  it("goes back to an empty search on RESET_SEARCH_REQUEST", () => {
    const state = reducer({ request: searchRequest }, resetSearchRequest());

    expect(state.request).toEqual({
      includeVoided: false,
      includeDisplayCount: false,
    });
  });
});

describe("toUsableSearchRequest", () => {
  const subjectTypes = [{ uuid: "subject-type-uuid" }, { uuid: "other-uuid" }];
  const conceptFilter = (conceptUUID, subjectTypeUUID = "subject-type-uuid") => ({
    type: "Concept",
    subjectTypeUUID,
    conceptUUID,
  });
  const textConcept = { uuid: "text-concept-uuid", dataType: "Text", value: "x" };
  const requestWithConcepts = {
    ...searchRequest,
    concept: [...searchRequest.concept, textConcept],
  };

  it("keeps a search whose subject type and concept filters are still there", () => {
    const searchFilters = [conceptFilter("coded-concept-uuid"), conceptFilter("text-concept-uuid")];

    expect(toUsableSearchRequest(requestWithConcepts, subjectTypes, searchFilters)).toBe(requestWithConcepts);
  });

  it("ignores a search for a subject type the user does not have, such as one from another organisation", () => {
    expect(
      toUsableSearchRequest({ ...searchRequest, subjectType: "org-a-subject-type" }, subjectTypes, [
        conceptFilter("coded-concept-uuid"),
      ])
    ).toEqual({ includeVoided: false, includeDisplayCount: false });
  });

  it("drops concept filters that are no longer configured for the subject type", () => {
    const usable = toUsableSearchRequest(requestWithConcepts, subjectTypes, [
      conceptFilter("coded-concept-uuid"),
      conceptFilter("text-concept-uuid", "other-uuid"),
      { type: "Name", subjectTypeUUID: "subject-type-uuid" },
    ]);

    expect(usable.concept).toEqual(searchRequest.concept);
    expect(usable.name).toBe("Asha");
    expect(requestWithConcepts.concept).toHaveLength(2);
  });

  it("drops every concept filter when the subject type has no search filters", () => {
    expect(toUsableSearchRequest(requestWithConcepts, subjectTypes, undefined).concept).toEqual([]);
  });

  const programFilter = { type: "Program", subjectTypeUUID: "subject-type-uuid" };
  const enrolmentMapping = programUUID => ({ formType: "ProgramEnrolment", subjectTypeUUID: "subject-type-uuid", programUUID });
  const operationalModules = {
    programs: [{ uuid: "p1", name: "Pregnancy" }, { uuid: "p2", name: "Child" }, { uuid: "p3", name: "Other" }],
    formMappings: [enrolmentMapping("p1"), enrolmentMapping("p2"), { formType: "ProgramEnrolment", subjectTypeUUID: "other-uuid", programUUID: "p3" }]
  };
  const withProgramFilter = [conceptFilter("coded-concept-uuid"), programFilter];

  it("drops Not enrolled from a search saved with Include exited too", () => {
    const saved = { ...searchRequest, programs: ["p1"], notEnrolledInAnyProgram: true, includeExitedEnrolments: true };

    const usable = toUsableSearchRequest(saved, subjectTypes, withProgramFilter, operationalModules);

    expect(usable.notEnrolledInAnyProgram).toBe(false);
    expect(usable.includeExitedEnrolments).toBe(true);
    expect(usable.programs).toEqual(["p1"]);
    expect(saved.notEnrolledInAnyProgram).toBe(true);
  });

  it("keeps Not enrolled when Include exited is not ticked", () => {
    const saved = { ...searchRequest, notEnrolledInAnyProgram: true, includeExitedEnrolments: false };

    expect(toUsableSearchRequest(saved, subjectTypes, withProgramFilter, operationalModules)).toBe(saved);
  });

  it("keeps programme ticks the subject type still offers", () => {
    const saved = { ...searchRequest, programs: ["p1", "p2"], includeExitedEnrolments: true };

    expect(toUsableSearchRequest(saved, subjectTypes, withProgramFilter, operationalModules)).toBe(saved);
  });

  it("drops a ticked programme the subject type no longer enrols into", () => {
    const saved = { ...searchRequest, programs: ["p1", "p3", "gone"] };

    const usable = toUsableSearchRequest(saved, subjectTypes, withProgramFilter, operationalModules);

    expect(usable.programs).toEqual(["p1"]);
    expect(saved.programs).toEqual(["p1", "p3", "gone"]);
  });

  it("clears every programme tick when the Program filter was removed from the subject type", () => {
    const saved = { ...searchRequest, programs: ["p1"], notEnrolledInAnyProgram: true };

    const usable = toUsableSearchRequest(saved, subjectTypes, [conceptFilter("coded-concept-uuid")], operationalModules);

    expect(usable).toMatchObject({ programs: [], notEnrolledInAnyProgram: false, includeExitedEnrolments: false });
  });

  it("clears every programme tick when the subject type enrols into no programme any more", () => {
    const saved = { ...searchRequest, programs: ["p1"], includeExitedEnrolments: true };

    const usable = toUsableSearchRequest(saved, subjectTypes, withProgramFilter, { ...operationalModules, formMappings: [] });

    expect(usable).toMatchObject({ programs: [], notEnrolledInAnyProgram: false, includeExitedEnrolments: false });
  });

  it("leaves a search without a subject type alone", () => {
    const empty = { includeVoided: false };

    expect(toUsableSearchRequest(empty, subjectTypes, [])).toBe(empty);
  });
});
