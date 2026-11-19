import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import { throwError } from "redux-saga-test-plan/providers";
import api from "../api";
import { callOrMarkSubjectNotFound } from "./subjectNotFoundSaga";
import { createEncounterWorker, encounterEligibilityWorker } from "./encounterSaga";
import { loadEditRegistrationPageWorker } from "./subjectSaga";
import { setupNewEnrolmentWorker } from "./enrolmentSaga";
import { setSubjectNotFound } from "../reducers/subjectDashboardReducer";
import { setLoad } from "../reducers/loadReducer";

const httpError = (status) => Object.assign(new Error(`HTTP ${status}`), { status });
const unknown = "00000000-0000-0000-0000-000000001079";

describe("callOrMarkSubjectNotFound", () => {
  it("returns what the server sends and clears any earlier not-found subject", async () => {
    const { returnValue } = await expectSaga(callOrMarkSubjectNotFound, api.fetchSubjectProfile, "s1")
      .provide([[matchers.call.fn(api.fetchSubjectProfile), { uuid: "s1" }]])
      .put.resolve(setSubjectNotFound(null))
      .run();

    expect(returnValue).toEqual({ uuid: "s1" });
  });

  it("marks the subject as not found and stops the loading overlay on a 404", async () => {
    const { returnValue } = await expectSaga(callOrMarkSubjectNotFound, api.fetchSubjectProfile, unknown)
      .provide([[matchers.call.fn(api.fetchSubjectProfile), throwError(httpError(404))]])
      .put.resolve(setSubjectNotFound(unknown))
      .put.resolve(setLoad(true))
      .run();

    expect(returnValue).toBeNull();
  });

  it("still fails on other server errors", async () => {
    await expect(
      expectSaga(callOrMarkSubjectNotFound, api.fetchSubjectProfile, "s1")
        .provide([[matchers.call.fn(api.fetchSubjectProfile), throwError(httpError(500))]])
        .silentRun(),
    ).rejects.toMatchObject({ status: 500 });
  });
});

describe("pages that open a subject from the address", () => {
  const notFound = [matchers.call.fn(api.fetchSubjectProfile), throwError(httpError(404))];

  it("new visit form: says the subject was not found and loads nothing else", async () => {
    await expectSaga(createEncounterWorker, { encounterTypeUuid: "visit-type", subjectUuid: unknown })
      .provide([notFound])
      .put.resolve(setSubjectNotFound(unknown))
      .not.call.fn(api.fetchEncounterTypeDetails)
      .run();
  });

  it("new visit list: says the subject was not found", async () => {
    await expectSaga(encounterEligibilityWorker, { subjectUuid: unknown })
      .provide([[matchers.call.fn(api.fetchEligibleEncounterTypes), throwError(httpError(404))]])
      .put.resolve(setSubjectNotFound(unknown))
      .put.resolve(setLoad(true))
      .run();
  });

  it("enrol in program: says the subject was not found and loads nothing else", async () => {
    await expectSaga(setupNewEnrolmentWorker, {
      subjectTypeName: "Person",
      programName: "Pregnancy",
      formType: "ProgramEnrolment",
      subjectUuid: unknown,
    })
      .provide([notFound])
      .put.resolve(setSubjectNotFound(unknown))
      .not.call.fn(api.fetchProgramEnrolments)
      .run();
  });

  it("edit registration: says the subject was not found and loads nothing else", async () => {
    await expectSaga(loadEditRegistrationPageWorker, { subjectUuid: unknown })
      .provide([notFound])
      .put.resolve(setSubjectNotFound(unknown))
      .not.call.fn(api.fetchForm)
      .run();
  });
});
