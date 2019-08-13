import { dataEntryLoadOperationalModulesWorker } from "./referenceDataSaga";
import { assert } from "chai";
import { call, put } from "redux-saga/effects";
import api from "../api";
import { setOperationalModules } from "../reducers/metadataReducer";

describe("dataEntryLoadOperationalModulesWorker", () => {
  it("runs only once", () => {
    const workerWithoutOperationalModules = dataEntryLoadOperationalModulesWorker();
    workerWithoutOperationalModules.next();
    assert.deepEqual(
      workerWithoutOperationalModules.next().value,
      call(api.fetchOperationalModules)
    );

    const workerWithOperationalModules = dataEntryLoadOperationalModulesWorker();
    workerWithOperationalModules.next();
    assert.deepEqual(workerWithOperationalModules.next("OPERATIONAL_MODULES").value, undefined);
  });

  it("puts operational modules in state", () => {
    const saga = dataEntryLoadOperationalModulesWorker();
    saga.next();
    saga.next();
    saga.next();
    let mappedOperationalModules = {};
    assert.deepEqual(
      saga.next(mappedOperationalModules).value,
      put(setOperationalModules(mappedOperationalModules))
    );
  });
});
