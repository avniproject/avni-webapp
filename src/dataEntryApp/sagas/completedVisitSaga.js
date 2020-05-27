import { all, call, fork, put, takeLatest, select } from "redux-saga/effects";
import {
  types,
  setCompletedVisit,
  setEnrolments,
  setEncounterTypes,
  setLoaded
} from "../reducers/completedVisitsReducer";
import { setSubjectProfile } from "../reducers/subjectDashboardReducer";
import { mapProfile } from "../../common/subjectModelMapper";

import api from "../api";
import { selectEncounterTypes } from "dataEntryApp/sagas/selectors";

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
  const programEnrolment = yield call(api.fetchProgramEnrolment, enrolmentUuid);

  const subjectProfileJson = yield call(api.fetchSubjectProfile, programEnrolment.subjectUuid);
  const subjectProfile = mapProfile(subjectProfileJson);
  yield put(setSubjectProfile(subjectProfile));

  yield put(setEnrolments(programEnrolment));
  const encounterTypes = yield select(
    selectEncounterTypes(subjectProfile.subjectType.uuid, programEnrolment.program.uuid)
  );
  yield put(setEncounterTypes(encounterTypes));
  yield put(setLoaded(true));
}
