import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import { types, setPrograms } from "../reducers/programReducer";
import api from "../api";
import { setLoad } from "../reducers/loadReducer";

export default function*() {
  yield all([programFetchWatcher].map(fork));
}

export function* programFetchWatcher() {
  yield takeLatest(types.GET_PROGRAMS, programFetchWorker);
}

export function* programFetchWorker({ subjectUuid }) {
  const programs = yield call(api.fetchPrograms, subjectUuid);
  yield put.resolve(setLoad(false));
  yield put(setPrograms(programs));
  yield put.resolve(setLoad(true));
}
