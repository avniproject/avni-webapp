import { setStatuses, types } from "./reducers";
import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import api from "./api";

export function* getImportJobStatusesWatcher() {
  yield takeLatest(types.GET_UPLOAD_JOB_STATUSES, getImportJobStatusesWorker);
}

export function* getImportJobStatusesWorker() {
  const valueFromApi = yield call(api.fetchUploadJobStatuses);
  yield put(setStatuses(valueFromApi));
}

export default function* main() {
  yield all([getImportJobStatusesWatcher].map(fork));
}
