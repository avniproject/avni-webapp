import { all, call, fork, put, select, takeLatest, takeEvery } from "redux-saga/effects";
import { find } from "lodash";
import {
  types,
  setProgramEnrolment,
  setUnplanProgramEncounters,
  setProgramEncounterForm,
  setProgramEncounter,
  saveProgramEncounterComplete,
  setValidationResults
} from "../reducers/programEncounterReducer";
import api from "../api";
import {
  selectFormMappingForSubjectType,
  selectFormMappingForProgramEncounter,
  selectFormMappingForCancelProgramEncounter
} from "./programEncounterSelector";
import { mapForm } from "../../common/adapters";
import { ProgramEncounter, ProgramEnrolment, ModelGeneral as General } from "avni-models";
import { setSubjectProfile } from "../reducers/subjectDashboardReducer";
import { mapProgramEncounter } from "common/subjectModelMapper";
import { mapProfile } from "../../common/subjectModelMapper";
import formElementService from "../services/FormElementService";

export default function*() {
  yield all(
    [
      programEncouterOnLoadWatcher,
      updateEncounterObsWatcher,
      saveProgramEncounterWatcher,
      editProgramEncounterWatcher,
      updateEncounterCancelObsWatcher,
      createProgramEncounterWatcher,
      createProgramEncounterForScheduledWatcher,
      createCancelProgramEncounterWatcher,
      editCancelProgramEncounterWatcher
    ].map(fork)
  );
}

export function* programEncouterOnLoadWatcher() {
  yield takeLatest(types.ON_LOAD, programEncouterOnLoadWorker);
}

export function* programEncouterOnLoadWorker({ enrolmentUuid }) {
  const programEnrolment = yield call(api.fetchProgramEnrolment, enrolmentUuid);
  yield put(setProgramEnrolment(programEnrolment));

  const subjectProfileJson = yield call(api.fetchSubjectProfile, programEnrolment.subjectUuid);
  yield put.resolve(setSubjectProfile(mapProfile(subjectProfileJson)));

  const programEncounterFormMapping = yield select(
    selectFormMappingForSubjectType(
      subjectProfileJson.subjectType.uuid,
      programEnrolment.program.uuid
    )
  );
  yield put(setUnplanProgramEncounters(programEncounterFormMapping));
}

export function* createProgramEncounterWatcher() {
  yield takeLatest(types.CREATE_PROGRAM_ENCOUNTER, createProgramEncounterWorker);
}
export function* createProgramEncounterWorker({ encounterTypeUuid, enrolUuid }) {
  const programEnrolmentJson = yield call(api.fetchProgramEnrolment, enrolUuid);
  const state = yield select();

  /*create new encounter obj */
  const programEncounter = new ProgramEncounter();
  programEncounter.uuid = General.randomUUID();
  programEncounter.encounterDateTime = new Date();
  programEncounter.observations = [];
  programEncounter.encounterType = find(
    state.dataEntry.metadata.operationalModules.encounterTypes,
    eT => eT.uuid === encounterTypeUuid
  );
  programEncounter.name = programEncounter.encounterType.name;
  yield setProgramEncounterDetails(programEncounter, programEnrolmentJson);
}

export function* createProgramEncounterForScheduledWatcher() {
  yield takeLatest(
    types.CREATE_PROGRAM_ENCOUNTER_FOR_SCHEDULED,
    createProgramEncounterForScheduledWorker
  );
}
export function* createProgramEncounterForScheduledWorker({ programEncounterUuid }) {
  const programEncounterJson = yield call(api.fetchProgramEncounter, programEncounterUuid);
  const programEnrolmentJson = yield call(
    api.fetchProgramEnrolment,
    programEncounterJson.enrolmentUUID
  );
  const programEncounter = mapProgramEncounter(programEncounterJson);
  programEncounter.encounterDateTime = new Date();
  yield setProgramEncounterDetails(programEncounter, programEnrolmentJson);
}

function* updateEncounterObsWatcher() {
  yield takeEvery(types.UPDATE_OBS, updateEncounterObsWorker);
}
export function* updateEncounterObsWorker({ formElement, value }) {
  const state = yield select();
  const programEncounter = state.dataEntry.programEncounterReducer.programEncounter;
  const validationResults = state.dataEntry.programEncounterReducer.validationResults;
  programEncounter.observations = formElementService.updateObservations(
    programEncounter.observations,
    formElement,
    value
  );

  yield put(setProgramEncounter(programEncounter));
  yield put(
    setValidationResults(
      formElementService.validate(
        formElement,
        value,
        programEncounter.observations,
        validationResults
      )
    )
  );
}

export function* saveProgramEncounterWatcher() {
  yield takeLatest(types.SAVE_PROGRAM_ENCOUNTER, saveProgramEncounterWorker);
}
export function* saveProgramEncounterWorker() {
  const state = yield select();
  const programEncounter = state.dataEntry.programEncounterReducer.programEncounter;
  let resource = programEncounter.toResource;
  yield call(api.saveProgramEncouter, resource);
  yield put(saveProgramEncounterComplete());
}

function* editProgramEncounterWatcher() {
  yield takeLatest(types.EDIT_PROGRAM_ENCOUNTER, editProgramEncounterWorker);
}
export function* editProgramEncounterWorker({ programEncounterUuid }) {
  const programEncounterJson = yield call(api.fetchProgramEncounter, programEncounterUuid);
  const programEnrolmentJson = yield call(
    api.fetchProgramEnrolment,
    programEncounterJson.enrolmentUUID
  );
  yield setProgramEncounterDetails(mapProgramEncounter(programEncounterJson), programEnrolmentJson);
}

export function* setProgramEncounterDetails(programEncounter, programEnrolmentJson) {
  const subjectProfileJson = yield call(api.fetchSubjectProfile, programEnrolmentJson.subjectUuid);
  const formMapping = yield select(
    selectFormMappingForProgramEncounter(
      programEncounter.encounterType.uuid,
      programEnrolmentJson.program.uuid,
      subjectProfileJson.subjectType.uuid
    )
  );
  const programEncounterForm = yield call(api.fetchForm, formMapping.formUUID);
  const programEnrolment = new ProgramEnrolment();
  programEnrolment.uuid = programEnrolmentJson.uuid;
  programEnrolment.enrolmentDateTime = new Date(programEnrolmentJson.enrolmentDateTime);
  programEncounter.programEnrolment = programEnrolment;

  yield put.resolve(setProgramEncounter(programEncounter));
  yield put.resolve(setProgramEncounterForm(mapForm(programEncounterForm)));
  yield put.resolve(setSubjectProfile(mapProfile(subjectProfileJson)));
}

function* updateEncounterCancelObsWatcher() {
  yield takeEvery(types.UPDATE_CANCEL_OBS, updateEncounterCancelObsWorker);
}
export function* updateEncounterCancelObsWorker({ formElement, value }) {
  const state = yield select();
  const programEncounter = state.dataEntry.programEncounterReducer.programEncounter;
  const validationResults = state.dataEntry.programEncounterReducer.validationResults;
  programEncounter.cancelObservations = formElementService.updateObservations(
    programEncounter.cancelObservations,
    formElement,
    value
  );

  yield put(setProgramEncounter(programEncounter));
  yield put(
    setValidationResults(
      formElementService.validate(
        formElement,
        value,
        programEncounter.cancelObservations,
        validationResults
      )
    )
  );
}

export function* createCancelProgramEncounterWatcher() {
  yield takeLatest(types.CREATE_CANCEL_PROGRAM_ENCOUNTER, createCancelProgramEncounterWorker);
}
export function* createCancelProgramEncounterWorker({ programEncounterUuid }) {
  const programEncounterJson = yield call(api.fetchProgramEncounter, programEncounterUuid);
  const programEnrolmentJson = yield call(
    api.fetchProgramEnrolment,
    programEncounterJson.enrolmentUUID
  );
  const programEncounter = mapProgramEncounter(programEncounterJson);
  programEncounter.cancelDateTime = new Date();
  programEncounter.cancelObservations = [];
  yield setCancelProgramEncounterDetails(programEncounter, programEnrolmentJson);
}

export function* editCancelProgramEncounterWatcher() {
  yield takeLatest(types.EDIT_CANCEL_PROGRAM_ENCOUNTER, editCancelProgramEncounterWorker);
}
export function* editCancelProgramEncounterWorker({ programEncounterUuid }) {
  const programEncounterJson = yield call(api.fetchProgramEncounter, programEncounterUuid);
  const programEnrolmentJson = yield call(
    api.fetchProgramEnrolment,
    programEncounterJson.enrolmentUUID
  );
  yield setCancelProgramEncounterDetails(
    mapProgramEncounter(programEncounterJson),
    programEnrolmentJson
  );
}

export function* setCancelProgramEncounterDetails(programEncounter, programEnrolmentJson) {
  const subjectProfileJson = yield call(api.fetchSubjectProfile, programEnrolmentJson.subjectUuid);
  const formMapping = yield select(
    selectFormMappingForCancelProgramEncounter(
      programEncounter.encounterType.uuid,
      programEnrolmentJson.program.uuid,
      subjectProfileJson.subjectType.uuid
    )
  );
  const cancelProgramEncounterForm = yield call(api.fetchForm, formMapping.formUUID);
  const programEnrolment = new ProgramEnrolment();
  programEnrolment.uuid = programEnrolmentJson.uuid;
  programEnrolment.enrolmentDateTime = new Date(programEnrolmentJson.enrolmentDateTime);
  programEncounter.programEnrolment = programEnrolment;

  yield put.resolve(setProgramEncounter(programEncounter));
  yield put.resolve(setProgramEncounterForm(mapForm(cancelProgramEncounterForm)));
  yield put.resolve(setSubjectProfile(mapProfile(subjectProfileJson)));
}
