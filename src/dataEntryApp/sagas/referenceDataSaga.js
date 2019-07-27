import {setRegistrationSubjectType} from "../reducers/subjectReducer";
import {setOperationalModules} from "../reducers/metadataReducer";
import {all, call, fork, put, takeLatest} from "redux-saga/effects";
import api from "../api";
import {types} from '../reducers/metadataReducer';

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

export default function* referenceDataSaga() {
  yield all([fork(dataEntryLoadOperationalModulesWatcher)]);
}
