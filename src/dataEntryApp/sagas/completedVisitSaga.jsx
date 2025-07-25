import { all, call, fork, put, takeLatest, select } from "redux-saga/effects";
import {
  types,
  setCompletedVisits,
  setEncounterTypes
} from "../reducers/completedVisitsReducer";
import { setProgramEnrolment } from "../reducers/programEncounterReducer";

import api from "../api";
import {
  selectProgramEncounterTypes,
  selectGeneralEncounterTypes
} from "dataEntryApp/sagas/selectors";
import { setLoad } from "../reducers/loadReducer";
import { selectSubjectProfile } from "./selectors";

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

export function* loadProgramEncountersWorker({
  enrolmentUuid,
  filterQueryString
}) {
  yield put.resolve(setLoad(false));
  const programEnrolment = yield call(api.fetchProgramEnrolment, enrolmentUuid);
  const subjectProfile = yield select(selectSubjectProfile);
  const encounterTypes = yield select(
    selectProgramEncounterTypes(
      subjectProfile.subjectType.uuid,
      programEnrolment.program.uuid
    )
  );
  yield put(setEncounterTypes(encounterTypes));
  yield put(setProgramEnrolment(programEnrolment));
  yield put.resolve(setLoad(true));
}

export function* loadEncountersWatcher() {
  yield takeLatest(types.LOAD_ENCOUNTERS, loadEncountersWorker);
}

export function* loadEncountersWorker({ subjectUuid }) {
  yield put.resolve(setLoad(false));
  const subjectProfile = yield select(selectSubjectProfile);
  const encounterTypes = yield select(
    selectGeneralEncounterTypes(subjectProfile.subjectType.uuid)
  );
  yield put(setEncounterTypes(encounterTypes));
  yield put.resolve(setLoad(true));
}

export function* getCompletedProgramEncountersWatcher() {
  yield takeLatest(
    types.GET_COMPLETED_PROGRAM_ENCOUNTERS,
    getCompletedProgramEncountersWorker
  );
}

export function* getCompletedProgramEncountersWorker({
  enrolmentUuid,
  filterQueryString
}) {
  yield put.resolve(setLoad(false));
  const completedVisits = yield call(
    api.fetchCompletedProgramEncounters,
    enrolmentUuid,
    filterQueryString
  );
  yield put(setCompletedVisits(completedVisits));
  yield put.resolve(setLoad(true));
}

export function* getCompletedEncountersWatcher() {
  yield takeLatest(
    types.GET_COMPLETED_ENCOUNTERS,
    getCompletedEncountersWorker
  );
}

export function* getCompletedEncountersWorker({
  subjectUuid,
  filterQueryString
}) {
  yield put.resolve(setLoad(false));
  const completedVisits = yield call(
    api.fetchCompletedEncounters,
    subjectUuid,
    filterQueryString
  );
  yield put(setCompletedVisits(completedVisits));
  yield put.resolve(setLoad(true));
}
