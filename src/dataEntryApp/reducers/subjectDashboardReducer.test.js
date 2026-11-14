import subjectDashboardReducer, {
  setSubjectNotFound,
  setSubjectProfile,
} from "./subjectDashboardReducer";

describe("subjectDashboardReducer", () => {
  it("forgets the previously opened subject when a subject is not found, so the breadcrumb does not name it", () => {
    const afterOpeningAsha = subjectDashboardReducer(
      {},
      setSubjectProfile({ uuid: "asha", nameString: "Asha" }),
    );

    const state = subjectDashboardReducer(
      afterOpeningAsha,
      setSubjectNotFound("unknown"),
    );

    expect(state.subjectProfile).toBeUndefined();
    expect(state.notFoundSubjectUuid).toBe("unknown");
  });
});
