import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import { types, setCompletedVisit, setEnrolments } from "../reducers/completedVisitsReducer";
import { getSubjectProfile } from "../reducers/subjectDashboardReducer";
import { mapViewVisit } from "../../common/subjectModelMapper";

import api from "../api";

export default function*() {
  yield all([completedVisitFetchWatcher, enrolmentFetchWatcher].map(fork));
}

export function* completedVisitFetchWatcher() {
  yield takeLatest(types.GET_COMPLETEDVISIT, completedVisitFetchWorker);
}

export function* completedVisitFetchWorker({ completedVisitUrl }) {
  const completedVisit = yield call(api.fetchcompletedVisit, completedVisitUrl);
  yield put(setCompletedVisit(completedVisit));
}

export function* enrolmentFetchWatcher() {
  yield takeLatest(types.GET_ENROLMENTS, enrolmentFetchWorker);
}

export function* enrolmentFetchWorker({ enrolmentUuid }) {
  const enrolments = yield call(api.fetchProgramEnrolment, enrolmentUuid);
  yield put(getSubjectProfile(enrolments.subjectUuid));
  yield put(setEnrolments(enrolments));
}
