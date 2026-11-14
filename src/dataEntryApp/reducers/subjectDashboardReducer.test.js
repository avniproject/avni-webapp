import subjectDashboardReducer, { setSubjectNotFound, setSubjectProfile } from "./subjectDashboardReducer";

describe("subjectDashboardReducer", () => {
  it("forgets the previously opened subject when a subject is not found, so the breadcrumb does not name it", () => {
    const afterOpeningAsha = subjectDashboardReducer({}, setSubjectProfile({ uuid: "asha", nameString: "Asha" }));

    const state = subjectDashboardReducer(afterOpeningAsha, setSubjectNotFound("unknown"));

    expect(state.subjectProfile).toBeUndefined();
    expect(state.notFoundSubjectUuid).toBe("unknown");
  });

  it("keeps the loaded subject when a page only resets the not-found marker before loading", () => {
    const afterOpeningAsha = subjectDashboardReducer(
      { notFoundSubjectUuid: "unknown" },
      setSubjectProfile({ uuid: "asha", nameString: "Asha" }),
    );

    const state = subjectDashboardReducer(afterOpeningAsha, setSubjectNotFound(null));

    expect(state.subjectProfile).toEqual({ uuid: "asha", nameString: "Asha" });
    expect(state.notFoundSubjectUuid).toBeNull();
  });
});
