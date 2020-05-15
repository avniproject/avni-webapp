import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import { types, setSubjectProfile } from "../reducers/subjectDashboardReducer";
import { selectAddressLevelType } from "../reducers/registrationReducer";
import { mapProfile } from "../../common/subjectModelMapper";
import api from "../api";

export default function*() {
  yield all([subjectProfileFetchWatcher].map(fork));
}

export function* subjectProfileFetchWatcher() {
  yield takeLatest(types.GET_SUBJECT_PROFILE, subjectProfileFetchWorker);
}

export function* subjectProfileFetchWorker({ subjectUUID }) {
  const subjectProfileJson = yield call(api.fetchSubjectProfile, subjectUUID);
  const subjectProfile = mapProfile(subjectProfileJson);
  yield put(setSubjectProfile(subjectProfile));
}
