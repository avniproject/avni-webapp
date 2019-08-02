import { setRegistrationSubjectType } from "../reducers/subjectReducer";
import { setOperationalModules, setGenders } from "../reducers/metadataReducer";
import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import api from "../api";
import { types } from "../reducers/metadataReducer";
import { Gender } from "openchs-models";

export function* dataEntryLoadOperationalModulesWatcher() {
  yield takeLatest(
    types.GET_OPERATIONAL_MODULES,
    dataEntryLoadOperationalModulesWorker
  );
}

export function* dataEntryLoadOperationalModulesWorker() {
  const operationalModules = yield call(api.fetchOperationalModules);
  yield put(setOperationalModules(operationalModules));
  yield put(setRegistrationSubjectType(operationalModules.subjectTypes[0]));
}

export function* getGendersWatcher() {
  yield takeLatest(types.GET_GENDERS, getGendersWorker);
}

export function* getGendersWorker() {
  const genders = yield call(api.fetchGenders);
  yield put(setGenders(genders.content.map(Gender.fromJson)));
}

export default function* referenceDataSaga() {
  yield all(
    [dataEntryLoadOperationalModulesWatcher, getGendersWatcher].map(fork)
  );
}
