import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import { types, setSubjectGeneral } from "../reducers/generalSubjectDashboardReducer";
import api from "../api";
import { mapGeneral } from "../../common/subjectModelMapper";

export default function*() {
  yield all([subjectGeneralFetchWatcher].map(fork));
}

export function* subjectGeneralFetchWatcher() {
  yield takeLatest(types.GET_SUBJECT_GENERAL, subjectGeneralFetchWorker);
}

export function* subjectGeneralFetchWorker({ subjectGeneralUUID }) {
  const subjectGeneral = yield call(api.fetchSubjectGeneral, subjectGeneralUUID);
  yield put(setSubjectGeneral(mapGeneral(subjectGeneral)));
}
