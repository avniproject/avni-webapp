import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import { throwError } from "redux-saga-test-plan/providers";
import { loadSubjectDashboardWorker } from "./subjectDashboardSaga";
import api from "../api";
import commonApi from "../../common/service";
import reducer, { setSubjectDashboardLoaded, setSubjectNotFound } from "../reducers/subjectDashboardReducer";
import { setLoad } from "../reducers/loadReducer";

const httpError = (status) => Object.assign(new Error(`HTTP ${status}`), { status });
const unknownSubject = { subjectUUID: "00000000-0000-0000-0000-000000001079" };

describe("loadSubjectDashboardWorker", () => {
  it("marks the subject as not found when the server does not know the uuid", async () => {
    await expectSaga(loadSubjectDashboardWorker, unknownSubject)
      .provide([
        [matchers.call.fn(commonApi.fetchOrganisationConfigs), {}],
        [matchers.call.fn(api.fetchSubjectProfile), throwError(httpError(404))],
        [matchers.call.fn(api.fetchSubjectGeneral), throwError(httpError(404))],
        [matchers.call.fn(api.fetchSubjectProgram), throwError(httpError(404))],
      ])
      .put.resolve(setSubjectNotFound(null))
      .put.resolve(setSubjectNotFound(unknownSubject.subjectUUID))
      .put.resolve(setLoad(true))
      .put.resolve(setSubjectDashboardLoaded(true))
      .run();
  });

  it("still fails on other server errors", async () => {
    await expect(
      expectSaga(loadSubjectDashboardWorker, unknownSubject)
        .provide([
          [matchers.call.fn(commonApi.fetchOrganisationConfigs), {}],
          [matchers.call.fn(api.fetchSubjectProfile), throwError(httpError(500))],
          [matchers.call.fn(api.fetchSubjectGeneral), {}],
          [matchers.call.fn(api.fetchSubjectProgram), {}],
        ])
        .silentRun(),
    ).rejects.toMatchObject({ status: 500 });
  });
});

describe("subjectDashboardReducer not found", () => {
  it("records which subject was not found, and clears it", () => {
    expect(reducer({}, setSubjectNotFound("s1")).notFoundSubjectUuid).toBe("s1");
    expect(reducer({ notFoundSubjectUuid: "s1" }, setSubjectNotFound(null)).notFoundSubjectUuid).toBeNull();
  });
});
