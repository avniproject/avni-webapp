import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import { types, setSubjectProfile } from "../reducers/subjectDashboardReducer";
import { onLoadEdit } from "../reducers/registrationReducer";
import { mapProfile } from "../../common/subjectModelMapper";
import api from "../api";

export default function*() {
  yield all([subjectProfileFetchWatcher].map(fork));
}

export function* subjectProfileFetchWatcher() {
  yield takeLatest(types.GET_SUBJECT_PROFILE, subjectProfileFetchWorker);
}

export function* subjectProfileFetchWorker({ subjectUUID }) {
  const subjectProfile = yield call(api.fetchSubjectProfile, subjectUUID);
  yield put(setSubjectProfile(mapProfile(subjectProfile)));
  yield put(onLoadEdit(mapProfile(subjectProfile)));
}
