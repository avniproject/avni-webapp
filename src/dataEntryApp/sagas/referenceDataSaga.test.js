import { dataEntryLoadOperationalModulesWorker } from "./referenceDataSaga";
import { assert } from "chai";
import { put } from "redux-saga/effects";
import { setOperationalModules } from "../reducers/metadataReducer";

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
