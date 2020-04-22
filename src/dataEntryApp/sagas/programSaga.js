import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import { types, setPrograms } from "../reducers/programReducer";
import api from "../api";

export default function*() {
  yield all([programFetchWatcher].map(fork));
}

export function* programFetchWatcher() {
  yield takeLatest(types.GET_PROGRAMS, programFetchWorker);
}

export function* programFetchWorker({ subjectUuid }) {
  const programs = yield call(api.fetchPrograms, subjectUuid);
  yield put(setPrograms(programs));
}
