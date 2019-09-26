import { setGenders, setOperationalModules, types } from "../reducers/metadataReducer";
import { all, call, fork, put, select, takeLatest } from "redux-saga/effects";
import api from "../api";
import { isEmpty } from "lodash/core";
import { mapGender, mapOperationalModules } from "../../common/adapters";

export function* dataEntryLoadOperationalModulesWatcher() {
  yield takeLatest(types.GET_OPERATIONAL_MODULES, dataEntryLoadOperationalModulesWorker);
}

export function* dataEntryLoadOperationalModulesWorker() {
  const operationalModulesFromState = yield select(
    ({
      dataEntry: {
        metadata: { operationalModules }
      }
    }) => operationalModules
  );
  if (!isEmpty(operationalModulesFromState)) {
    return;
  }

  const operationalModules = yield call(api.fetchOperationalModules);

  yield put(setOperationalModules(yield call(mapOperationalModules, operationalModules)));
}

export function* getGendersWatcher() {
  yield takeLatest(types.GET_GENDERS, getGendersWorker);
}

export function* getGendersWorker() {
  const genders = yield call(api.fetchGenders);
  yield put(setGenders(genders.content.map(mapGender)));
}

export default function* referenceDataSaga() {
  yield all([dataEntryLoadOperationalModulesWatcher, getGendersWatcher].map(fork));
}
