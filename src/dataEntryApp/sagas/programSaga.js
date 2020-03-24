import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import { types, setPrograms } from "../reducers/programReducer";
import { mapProgram } from "../../common/subjectModelMapper";
import api from "../api";

export default function*() {
  yield all([programFetchWorker].map(fork));
}

export function* programFetchWatcher() {
  yield takeLatest(types.GET_PROGRAMS, programFetchWorker);
}

export function* programFetchWorker() {
  const program = yield call(api.fetchPrograms);
  yield put(setPrograms(mapProgram(program)));
}
