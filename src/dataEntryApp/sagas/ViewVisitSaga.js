import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import { types, setViewVisit } from "../reducers/viewVisitReducer";

import api from "../api";

export default function*() {
  yield all([viewVisitFetchWatcher].map(fork));
}

export function* viewVisitFetchWatcher() {
  yield takeLatest(types.GET_VIEWVISIT, viewVisitFetchWorker);
}

export function* viewVisitFetchWorker({ subjectUuid }) {
  const viewVisit = yield call(api.fetchPrograms, subjectUuid);
  yield put(setViewVisit(viewVisit));
}
