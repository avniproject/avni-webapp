import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import { types, setViewVisit } from "../reducers/viewVisitReducer";
import { mapViewVisit } from "../../common/subjectModelMapper";

import api from "../api";

export default function*() {
  yield all([viewVisitFetchWatcher].map(fork));
}

export function* viewVisitFetchWatcher() {
  yield takeLatest(types.GET_VIEWVISIT, viewVisitFetchWorker);
}

export function* viewVisitFetchWorker({ viewVisitUuid }) {
  const viewVisit = yield call(api.fetchViewVisit, viewVisitUuid);
  yield put(setViewVisit(mapViewVisit(viewVisit)));
}
