import { dataEntryLoadOperationalModulesWorker, getOrganisationConfigWorker } from "./referenceDataSaga";
import { assert } from "chai";
import { put } from "redux-saga/effects";
import { setOperationalModules, setOrganisationConfigFailed } from "../reducers/metadataReducer";

describe("dataEntryLoadOperationalModulesWorker", () => {
  it("puts operational modules in state", () => {
    const saga = dataEntryLoadOperationalModulesWorker();
    saga.next();
    saga.next();
    let mappedOperationalModules = {};
    assert.deepEqual(
      saga.next(mappedOperationalModules).value,
      put(setOperationalModules(mappedOperationalModules))
    );
  });
});

describe("getOrganisationConfigWorker", () => {
  it("records the failure instead of stopping when the organisation configuration can't be loaded", () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    const saga = getOrganisationConfigWorker();
    saga.next();

    assert.deepEqual(saga.throw(new Error("500")).value, put(setOrganisationConfigFailed()));
    assert.isTrue(saga.next().done);
    console.error.mockRestore();
  });
});
