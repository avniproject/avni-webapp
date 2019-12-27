import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import { types, setSubjectProgram } from "../reducers/programSubjectDashboardReducer";
import api from "../api";

export default function*() {
  yield all([subjectProgramFetchWatcher].map(fork));
}

export function* subjectProgramFetchWatcher() {
  yield takeLatest(types.GET_SUBJECT_PROGRAM, subjectProgramFetchWorker);
}

export function* subjectProgramFetchWorker({ subjectProgramUUID }) {
  console.log("bit pain subjectProgramUUID", subjectProgramUUID);
  const subjectProgram = yield call(api.fetchSubjectProgram, subjectProgramUUID);

  console.log("subject Program", subjectProgram);
  yield put(setSubjectProgram(subjectProgram));
}
