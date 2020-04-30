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

export function* programEncounterFetchWatcher() {
  yield takeLatest(types.GET_PROGRAM_ENCOUNTER, ProgramEncounterFetchWorker);
}

export function* ProgramEncounterFetchWorker({ subjectTypeName, programUuid }) {
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
}

// For ProgramEncounter
export function* programEncounterFetchFormWatcher() {
  yield takeLatest(types.GET_PROGRAM_ENCOUNTER_FORM, programEncounterFetchFormWorker);
}

export function* programEncounterFetchFormWorker({ encounterTypeUuid, enrolmentUuid }) {
  const formMapping = yield select(state =>
    find(
      get(state, "dataEntry.metadata.operationalModules.formMappings"),
      fm =>
        !isNil(encounterTypeUuid) &&
        (fm.encounterTypeUUID === encounterTypeUuid && fm.formType === "ProgramEncounter")
    )
  );
  const programEncounterForm = yield call(api.fetchForm, formMapping.formUUID);
  yield put(setProgramEncounterForm(mapForm(programEncounterForm)));

  // const encounterType = yield select(state =>
  //   find(
  //     //get takes state from store you can print this
  //     get(state, "dataEntry.metadata.operationalModules.encounterTypes"),
  //     (
  //       eT //this is function fm is parameter it is just like map form uuid from saga
  //     ) => eT.uuid === formMapping.encounterTypeUUID
  //   )
  // );

  //Creating New programEncounter Object for Planned Encounter
  const plannedEncounters = yield select(state => {
    find(
      get(state, "dataEntry.programs.programEnrolment.programEncounters"),
      (
        pe //check condition
      ) =>
        !isNil(encounterTypeUuid) &&
        (pe.encounterType.uuid === enrolmentUuid && fm.formType === "ProgramEncounter")
    );
  });
  plannedEncounters.map(planEncounter => {
    const plannedVisit = new ProgramEncounter();
    plannedVisit.uuid = planEncounter.uuid;
    plannedVisit.encounterType = planEncounter.encounterType; //select(state => state.operationalModules.encounterTypes.find(eT => eT.uuid = encounterTypeUuid));
    plannedVisit.encounterDateTime = moment().toDate(); //new Date(); or planEncounter.encounterDateTime
    plannedVisit.earliestVisitDateTime = planEncounter.earliestVisitDateTime;
    plannedVisit.maxVisitDateTime = planEncounter.maxVisitDateTime;
    plannedVisit.name = planEncounter.name;
    const programEnrolment = new ProgramEnrolment();
    programEnrolment.uuid = enrolmentUuid;
    plannedVisit.programEnrolment = programEnrolment;
    plannedVisit.observations = [];
    plannedEncounterList.push(plannedVisit);
  });

  yield select(state => {
    console.log("from Program Saga...state", state);
  });
}
