import { all, call, fork, put, takeLatest, select } from "redux-saga/effects";
import {
  types,
  setCompletedVisits,
  setEncounterTypes,
  setLoaded
} from "../reducers/completedVisitsReducer";
import { setSubjectProfile } from "../reducers/subjectDashboardReducer";
import { mapProfile } from "../../common/subjectModelMapper";

import api from "../api";
import {
  selectProgramEncounterTypes,
  selectGeneralEncounterTypes
} from "dataEntryApp/sagas/selectors";

export default function*() {
  yield all(
    [
      loadProgramEncountersWatcher,
      loadEncountersWatcher,
      getCompletedEncountersWatcher,
      getCompletedProgramEncountersWatcher
    ].map(fork)
  );
}

export function* loadProgramEncountersWatcher() {
  yield takeLatest(types.LOAD_PROGRAM_ENCOUNTERS, loadProgramEncountersWorker);
}

export function* loadProgramEncountersWorker({ enrolmentUuid }) {
  const completedVisits = yield call(api.fetchCompletedProgramEncounters, enrolmentUuid);
  const programEnrolment = yield call(api.fetchProgramEnrolment, enrolmentUuid);
  const subjectProfileJson = yield call(api.fetchSubjectProfile, programEnrolment.subjectUuid);
  const subjectProfile = mapProfile(subjectProfileJson);
  const encounterTypes = yield select(
    selectProgramEncounterTypes(subjectProfile.subjectType.uuid, programEnrolment.program.uuid)
  );

  yield put(setCompletedVisits(completedVisits));
  yield put(setSubjectProfile(subjectProfile));
  yield put(setEncounterTypes(encounterTypes));
  yield put(setLoaded(true));
}

export function* loadEncountersWatcher() {
  yield takeLatest(types.LOAD_ENCOUNTERS, loadEncountersWorker);
}

export function* loadEncountersWorker({ subjectUuid }) {
  const completedVisits = yield call(api.fetchCompletedEncounters, subjectUuid);
  const subjectProfileJson = yield call(api.fetchSubjectProfile, subjectUuid);
  const subjectProfile = mapProfile(subjectProfileJson);
  const encounterTypes = yield select(selectGeneralEncounterTypes(subjectProfile.subjectType.uuid));

  yield put(setCompletedVisits(completedVisits));
  yield put(setSubjectProfile(subjectProfile));
  yield put(setEncounterTypes(encounterTypes));
  yield put(setLoaded(true));
}

export function* getCompletedProgramEncountersWatcher() {
  yield takeLatest(types.GET_COMPLETED_PROGRAM_ENCOUNTERS, getCompletedProgramEncountersWorker);
}

export function* getCompletedProgramEncountersWorker({ enrolmentUuid, filterQueryString }) {
  const completedVisits = yield call(
    api.fetchCompletedProgramEncounters,
    enrolmentUuid,
    filterQueryString
  );
  yield put(setCompletedVisits(completedVisits));
}

export function* getCompletedEncountersWatcher() {
  yield takeLatest(types.GET_COMPLETED_ENCOUNTERS, getCompletedEncountersWorker);
}

export function* getCompletedEncountersWorker({ subjectUuid, filterQueryString }) {
  const completedVisits = yield call(api.fetchCompletedEncounters, subjectUuid, filterQueryString);
  yield put(setCompletedVisits(completedVisits));
}
