import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import { types, setCompletedVisit, setVisitTypes } from "../reducers/completedVisitsReducer";
import { getSubjectProfile } from "../reducers/subjectDashboardReducer";
import { mapViewVisit } from "../../common/subjectModelMapper";

import api from "../api";

export default function*() {
  yield all([completedVisitFetchWatcher, visitTypesFetchWatcher].map(fork));
}

export function* completedVisitFetchWatcher() {
  yield takeLatest(types.GET_COMPLETEDVISIT, completedVisitFetchWorker);
}

export function* completedVisitFetchWorker({ completedVisitUrl }) {
  const completedVisit = yield call(api.fetchcompletedVisit, completedVisitUrl);
  yield put(setCompletedVisit(completedVisit));
}

export function* visitTypesFetchWatcher() {
  yield takeLatest(types.GET_VISITTYPES, visitTypesFetchWorker);
}

export function* visitTypesFetchWorker({ visitTypesUuid }) {
  const visitTypes = yield call(api.fetchVisitTypes, visitTypesUuid);
  yield put(getSubjectProfile(visitTypes.subjectUuid));
  yield put(setVisitTypes(visitTypes));
}
