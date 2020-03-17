import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import { types, setSubjectProgram } from "../reducers/programSubjectDashboardReducer";
import api from "../api";
import { mapProgram } from "../../common/subjectModelMapper";

export default function*() {
  yield all([subjectProgramFetchWatcher].map(fork));
}

export function* subjectProgramFetchWatcher() {
  yield takeLatest(types.GET_SUBJECT_PROGRAM, subjectProgramFetchWorker);
}

export function* subjectProgramFetchWorker({ subjectProgramUUID }) {
  const subjectProgram = yield call(api.fetchSubjectProgram, subjectProgramUUID);
  yield put(setSubjectProgram(mapProgram(subjectProgram)));
}
