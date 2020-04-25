import { all, call, fork, put, select, takeLatest } from "redux-saga/effects";
import { types, setPrograms, setProgramPlannedVisits } from "../reducers/programReducer";
import api from "../api";
import {
  selectProgramEncounterFormMappingForSubjectType,
  selectProgramUUID
} from "./programEncounterSelector";

export default function*() {
  yield all(
    [programFetchWatcher, programEncounterOnLoadWatcher, programVisitsFetchWatcher].map(fork)
  );
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
  yield takeLatest(types.GET_PROGRAM_PLANNED_VISITS, programVisitsFetchWorker);
}

export function* programVisitsFetchWorker({ enrolmentUuid }) {
  const response = yield call(api.fetchProgramPlannedVisits, enrolmentUuid);
  console.log("programVisists", response);
  yield put(setProgramPlannedVisits(response.programEncounters));
  //yield put(setPrograms(programs));
}
