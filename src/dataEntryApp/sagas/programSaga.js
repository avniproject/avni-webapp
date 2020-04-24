import { all, call, fork, put, select, takeLatest } from "redux-saga/effects";
import { types, setPrograms } from "../reducers/programReducer";
import api from "../api";
import { selectProgramEncounterFormMappingForSubjectType } from "./programEncounterSelector";

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

function* programEncounterOnLoadWatcher() {
  yield takeLatest(types.ON_LOAD, setupNewProgramEncounterWorker);
}

function* setupNewProgramEncounterWorker({ subjectTypeUuid, programUuid }) {
  console.log("inside program saga ...");
  // const formMapping = yield select(
  //   selectProgramEncounterFormMappingForSubjectType(subjectTypeUuid, programUuid)
  // );
  console.log("Printing FM");
  // console.log(formMapping);
}
