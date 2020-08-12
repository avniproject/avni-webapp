import { all, call, fork, put, select, takeLatest } from "redux-saga/effects";
import { types, setSubjectProfile } from "../reducers/subjectDashboardReducer";
import { mapProfile } from "../../common/subjectModelMapper";
import api from "../api";
import { setLoad } from "../reducers/loadReducer";
import { selectSubjectProfile } from "./selectors";

export default function*() {
  yield all([subjectProfileFetchWatcher, voidSubjectWatcher, unVoidSubjectWatcher].map(fork));
}

export function* subjectProfileFetchWatcher() {
  yield takeLatest(types.GET_SUBJECT_PROFILE, subjectProfileFetchWorker);
}

export function* subjectProfileFetchWorker({ subjectUUID }) {
  yield put.resolve(setLoad(false));
  yield put.resolve(setSubjectProfile());
  const subjectProfileJson = yield call(api.fetchSubjectProfile, subjectUUID);
  const subjectProfile = mapProfile(subjectProfileJson);
  yield put(setSubjectProfile(subjectProfile));
  yield put.resolve(setLoad(true));
}

export function* voidSubjectWatcher() {
  yield takeLatest(types.VOID_SUBJECT, voidUnVoidSubject);
}

export function* voidUnVoidSubject({ voided }) {
  yield put.resolve(setLoad(false));
  const subject = yield select(selectSubjectProfile);
  subject.voided = voided;
  const resource = subject.toResource;
  yield call(api.saveSubject, resource);
  yield put(setSubjectProfile(subject));
  yield put.resolve(setLoad(true));
}

export function* unVoidSubjectWatcher() {
  yield takeLatest(types.UN_VOID_SUBJECT, voidUnVoidSubject);
}
