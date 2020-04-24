import { all, call, fork, put, select, takeLatest } from "redux-saga/effects";
import { types, setPrograms } from "../reducers/programReducer";
import api from "../api";
import {
  selectProgramEncounterFormMappingForSubjectType,
  selectProgramUUID
} from "./programEncounterSelector";

export default function*() {
  yield all([programFetchWatcher, programEncounterOnLoadWatcher].map(fork));
}

export function* programFetchWatcher() {
  yield takeLatest(types.GET_PROGRAMS, programFetchWorker);
}

export function* programFetchWorker({ subjectUuid }) {
  const programs = yield call(api.fetchPrograms, subjectUuid);
  yield put(setPrograms(programs));
}

export function* programEncounterOnLoadWatcher() {
  yield takeLatest(types.ON_LOAD, setupNewProgramEncounterWorker);
}

export function* setupNewProgramEncounterWorker({ subjectTypeUuid, programUuid }) {
  console.log("inside program saga ...");
  // const formMapping = yield select(
  //   selectProgramEncounterFormMappingForSubjectType(subjectTypeUuid, programUuid)
  // );
  console.log("Printing FM");
  // console.log(formMapping);
}

export function* programVisitsFetchWatcher() {
  yield takeLatest(types.GET_PROGRAM_VISITS, programVisitsFetchWorker);
}

export function* programVisitsFetchWorker({ operationalProgramName }) {
  const programObj = yield select(selectProgramUUID(operationalProgramName));
  console.log("programObj", programObj);
  const enrolmentUuid = "";

  const programVisits = yield call(api.fetchProgramVisitsByEnrolmentUUID, enrolmentUuid);
  console.log("programVisists", programVisits);
  //yield put(setPrograms(programs));
}
