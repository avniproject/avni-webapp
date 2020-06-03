import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import { types, setSubjectProgram } from "../reducers/programSubjectDashboardReducer";
import api from "../api";
import { mapProgram } from "../../common/subjectModelMapper";
import { setLoad } from "../reducers/loadReducer";

export default function*() {
  yield all([subjectProgramFetchWatcher].map(fork));
}

export function* subjectProgramFetchWatcher() {
  yield takeLatest(types.GET_SUBJECT_PROGRAM, subjectProgramFetchWorker);
}

export function* subjectProgramFetchWorker({ subjectProgramUUID }) {
  yield put.resolve(setLoad(false));
  const subjectProgram = yield call(api.fetchSubjectProgram, subjectProgramUUID);
  yield put(setSubjectProgram(mapProgram(subjectProgram)));
  yield put.resolve(setLoad(true));
}
