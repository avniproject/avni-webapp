import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import { setOperationalModules, setUploadStatus, types } from "./reducers";
import api from "./api";
import { mapOperationalModules } from "../common/adapters";

export function* onLoadWatcher() {
  yield takeLatest(types.GET_OPERATIONAL_MODULES, onLoadWorker);
}

export function* onLoadWorker() {
  const operationalModules = yield call(api.fetchOperationalModules);
  yield put(setOperationalModules(yield call(mapOperationalModules, operationalModules)));
}

export function* getExportJobStatusesWatcher() {
  yield takeLatest(types.GET_UPLOAD_JOB_STATUSES, getExportJobStatusesWorker);
}

export function* getExportJobStatusesWorker() {
  const jobStatus = yield call(api.fetchUploadJobStatuses);
  yield put(setUploadStatus(jobStatus));
}

export default function* onLoadSaga() {
  yield all([onLoadWatcher, getExportJobStatusesWatcher].map(fork));
}
