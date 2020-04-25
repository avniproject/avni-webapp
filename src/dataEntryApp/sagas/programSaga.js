import { all, call, fork, put, select, takeLatest } from "redux-saga/effects";
import { types, setPrograms, setProgramEnrolment } from "../reducers/programReducer";
import api from "../api";
import {
  selectProgramEncounterFormMappingForSubjectType,
  selectProgramUUID
} from "./programEncounterSelector";

export default function*() {
  yield all(
    [
      programFetchWatcher,
      //programEncounterOnLoadWatcher,
      programEnrolmentFetchWatcher,
      programEncounterFetchWatcher
    ].map(fork)
  );
}

export function* programFetchWatcher() {
  yield takeLatest(types.GET_PROGRAMS, programFetchWorker);
}

export function* programFetchWorker({ subjectUuid }) {
  const programs = yield call(api.fetchPrograms, subjectUuid);
  yield put(setPrograms(programs));
}

// export function* programEncounterOnLoadWatcher() {
//   yield takeLatest(types.ON_LOAD, setupNewProgramEncounterWorker);
// }

// export function* setupNewProgramEncounterWorker({ subjectTypeUuid, programUuid }) {
//   console.log("inside program saga ...");
//   // const formMapping = yield select(
//   //   selectProgramEncounterFormMappingForSubjectType(subjectTypeUuid, programUuid)
//   // );
//   console.log("Printing FM");
//   // console.log(formMapping);
// }

export function* programEncounterFetchWatcher() {
  yield takeLatest(types.GET_PROGRAM_ENCOUNTER, ProgramEncounterFetchWorker);
}

export function* ProgramEncounterFetchWorker({ subjectTypeName, programUuid }) {
  console.log("inside program saga ...");
  const formMapping = yield select(
    selectProgramEncounterFormMappingForSubjectType(subjectTypeName, programUuid)
  );
  console.log("Printing FM");
  console.log(formMapping);
}

export function* programEnrolmentFetchWatcher() {
  yield takeLatest(types.GET_PROGRAM_ENROLMENT, programEnrolmentFetchWorker);
}

export function* programEnrolmentFetchWorker({ enrolmentUuid }) {
  const programEnrolment = yield call(api.fetchProgramEnrolment, enrolmentUuid);
  console.log("programVisists", programEnrolment);
  yield put(setProgramEnrolment(programEnrolment));
  //yield put(setPrograms(programs));
}
