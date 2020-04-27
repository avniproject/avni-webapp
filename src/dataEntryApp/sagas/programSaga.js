import { all, call, fork, put, select, takeLatest } from "redux-saga/effects";
import {
  types,
  setPrograms,
  setProgramEnrolment,
  setProgramEncounter,
  setProgramEncounterForm,
  getProgramEncounter
} from "../reducers/programReducer";
import api from "../api";
import {
  selectProgramEncounterFormMappingForSubjectType,
  selectProgramUUID
} from "./programEncounterSelector";
import { mapForm } from "../../common/adapters";
import { find, get, isNil, filter } from "lodash";
import { ProgramEncounter, ProgramEnrolment } from "avni-models";
import { ModelGeneral as General } from "avni-models";

export default function*() {
  yield all(
    [
      programFetchWatcher,
      //programEncounterOnLoadWatcher,
      programEnrolmentFetchWatcher,
      programEncounterFetchWatcher,
      programEncounterFetchFormWatcher
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
  console.log(subjectTypeName);
  console.log(programUuid);
  const programEncounterFormMapping = yield select(
    selectProgramEncounterFormMappingForSubjectType(subjectTypeName, programUuid)
  );
  yield put(setProgramEncounter(programEncounterFormMapping));
  console.log("Printing FM");
  console.log(programEncounterFormMapping);
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

export function* programEncounterFetchFormWatcher() {
  yield takeLatest(types.GET_PROGRAM_ENCOUNTER_FORM, programEncounterFetchFormWorker);
}

export function* programEncounterFetchFormWorker({ formUuid }) {
  const programEncounterForm = yield call(api.fetchForm, formUuid);
  console.log("Here we are getting dynamic form elements");
  console.log(programEncounterForm);
  yield put(setProgramEncounterForm(mapForm(programEncounterForm)));

  const formMapping = yield select(state =>
    find(
      //get takes state from store you can print this
      get(state, "dataEntry.metadata.operationalModules.formMappings"),
      (
        fm //this is function fm is parameter it is just like map form uuid from saga
      ) => !isNil(formUuid) && (fm.formUUID === formUuid && fm.formType === "ProgramEncounter")
    )
  );

  const encounterType = yield select(state =>
    find(
      //get takes state from store you can print this
      get(state, "dataEntry.metadata.operationalModules.encounterTypes"),
      (
        eT //this is function fm is parameter it is just like map form uuid from saga
      ) => eT.uuid === formMapping.encounterTypeUUID
    )
  );

  const unplannedVisit = new ProgramEncounter();
  unplannedVisit.uuid = General.randomUUID();
  unplannedVisit.encounterType = encounterType;
  unplannedVisit.name = unplannedVisit.encounterType.name;
  unplannedVisit.encounterDateTime = new Date();
  // const programEnrolment = new ProgramEnrolment();
  // programEnrolment.uuid = enrolmentUuid;
  //unplannedVisit.programEnrolment = programEnrolment;
  unplannedVisit.observations = [];

  //yield put.resolve(setProggramEncounterObj(unplannedVisit));

  console.log("unplanned visit", unplannedVisit);

  yield select(state => {
    console.log("state", state);
  });

  // const program = yield select(selectProgram(programName));

  // const state = yield select();
  // const subject = state.dataEntry.subjectProfile.subjectProfile;
  // subject.subjectType = SubjectType.create("Individual");

  // let programEnrolment = ProgramEnrolment.createEmptyInstance({ individual: subject, program });
  // yield put.resolve(setProgramEnrolment(programEnrolment));
}
