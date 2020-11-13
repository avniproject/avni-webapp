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
import {
  ProgramEncounter,
  ModelGeneral as General,
  ObservationsHolder,
  FormElementGroup
} from "avni-models";
import { setSubjectProfile } from "../reducers/subjectDashboardReducer";
import { mapProgramEncounter, mapProgramEnrolment, mapProfile } from "common/subjectModelMapper";
import formElementService, { getFormElementStatuses } from "../services/FormElementService";
import { setLoad } from "../reducers/loadReducer";
import { setFilteredFormElements } from "../reducers/RulesReducer";
import {
  selectDecisions,
  selectVisitSchedules
} from "dataEntryApp/reducers/serverSideRulesReducer";

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
  yield put.resolve(setLoad(false));
  yield put.resolve(setFilteredFormElements());
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
  yield put.resolve(setLoad(true));
}

export function* createProgramEncounterWatcher() {
  yield takeLatest(types.CREATE_PROGRAM_ENCOUNTER, createProgramEncounterWorker);
}
export function* createProgramEncounterWorker({ encounterTypeUuid, enrolUuid }) {
  const programEnrolmentJson = yield call(api.fetchProgramEnrolments, enrolUuid);
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
    api.fetchProgramEnrolments,
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
  const observations = formElementService.updateObservations(
    programEncounter.observations,
    formElement,
    value
  );
  const observationsHolder = new ObservationsHolder(observations);
  const formElementStatuses = getFormElementStatuses(
    programEncounter,
    formElement.formElementGroup,
    observationsHolder
  );
  const filteredFormElements = FormElementGroup._sortedFormElements(
    formElement.formElementGroup.filterElements(formElementStatuses)
  );
  yield put(setFilteredFormElements(filteredFormElements));
  observationsHolder.updatePrimitiveObs(filteredFormElements, formElementStatuses);
  programEncounter.observations = observationsHolder.observations;

  yield put(setProgramEncounter(programEncounter));
  yield put(
    setValidationResults(
      formElementService.validate(
        formElement,
        value,
        programEncounter.observations,
        validationResults,
        formElementStatuses
      )
    )
  );
}

export function* saveProgramEncounterWatcher() {
  yield takeLatest(types.SAVE_PROGRAM_ENCOUNTER, saveProgramEncounterWorker);
}
export function* saveProgramEncounterWorker(params) {
  const state = yield select();
  const programEncounter = state.dataEntry.programEncounterReducer.programEncounter;

  const visitSchedules = yield select(selectVisitSchedules);
  const decisions = yield select(selectDecisions);
  if (decisions) decisions.cancel = params.isCancel;

  let resource = programEncounter.toResource;
  resource.visitSchedules = visitSchedules;
  resource.decisions = decisions;

  yield call(api.saveProgramEncouter, resource);
  yield put(saveProgramEncounterComplete());
}

function* editProgramEncounterWatcher() {
  yield takeLatest(types.EDIT_PROGRAM_ENCOUNTER, editProgramEncounterWorker);
}
export function* editProgramEncounterWorker({ programEncounterUuid }) {
  const programEncounterJson = yield call(api.fetchProgramEncounter, programEncounterUuid);
  const programEnrolmentJson = yield call(
    api.fetchProgramEnrolments,
    programEncounterJson.enrolmentUUID
  );
  yield setProgramEncounterDetails(mapProgramEncounter(programEncounterJson), programEnrolmentJson);
}

export function* setProgramEncounterDetails(programEncounter, programEnrolmentJson) {
  const subjectProfileJson = yield call(api.fetchSubjectProfile, programEnrolmentJson.subjectUuid);
  const subject = mapProfile(subjectProfileJson);
  const formMapping = yield select(
    selectFormMappingForProgramEncounter(
      programEncounter.encounterType.uuid,
      programEnrolmentJson.programUuid,
      subjectProfileJson.subjectType.uuid
    )
  );
  const programEncounterForm = yield call(api.fetchForm, formMapping.formUUID);
  const programEnrolment = mapProgramEnrolment(programEnrolmentJson, subject);
  programEncounter.programEnrolment = programEnrolment;

  yield put.resolve(setProgramEncounter(programEncounter));
  yield put.resolve(setProgramEncounterForm(mapForm(programEncounterForm)));
  yield put.resolve(setSubjectProfile(subject));
}

function* updateEncounterCancelObsWatcher() {
  yield takeEvery(types.UPDATE_CANCEL_OBS, updateEncounterCancelObsWorker);
}
export function* updateEncounterCancelObsWorker({ formElement, value }) {
  const state = yield select();
  const programEncounter = state.dataEntry.programEncounterReducer.programEncounter;
  const validationResults = state.dataEntry.programEncounterReducer.validationResults;
  const cancelObservations = formElementService.updateObservations(
    programEncounter.cancelObservations,
    formElement,
    value
  );
  const observationsHolder = new ObservationsHolder(cancelObservations);
  const formElementStatuses = getFormElementStatuses(
    programEncounter,
    formElement.formElementGroup,
    observationsHolder
  );
  const filteredFormElements = FormElementGroup._sortedFormElements(
    formElement.formElementGroup.filterElements(formElementStatuses)
  );
  yield put(setFilteredFormElements(filteredFormElements));
  observationsHolder.updatePrimitiveObs(filteredFormElements, formElementStatuses);
  programEncounter.cancelObservations = observationsHolder.observations;

  yield put(setProgramEncounter(programEncounter));
  yield put(
    setValidationResults(
      formElementService.validate(
        formElement,
        value,
        programEncounter.cancelObservations,
        validationResults,
        formElementStatuses
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
    api.fetchProgramEnrolments,
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
    api.fetchProgramEnrolments,
    programEncounterJson.enrolmentUUID
  );
  yield setCancelProgramEncounterDetails(
    mapProgramEncounter(programEncounterJson),
    programEnrolmentJson
  );
}

export function* setCancelProgramEncounterDetails(programEncounter, programEnrolmentJson) {
  const subjectProfileJson = yield call(api.fetchSubjectProfile, programEnrolmentJson.subjectUuid);
  const subject = mapProfile(subjectProfileJson);
  const formMapping = yield select(
    selectFormMappingForCancelProgramEncounter(
      programEncounter.encounterType.uuid,
      programEnrolmentJson.programUuid,
      subjectProfileJson.subjectType.uuid
    )
  );
  const cancelProgramEncounterForm = yield call(api.fetchForm, formMapping.formUUID);
  const programEnrolment = mapProgramEnrolment(programEnrolmentJson, subject);
  programEncounter.programEnrolment = programEnrolment;

  yield put.resolve(setProgramEncounter(programEncounter));
  yield put.resolve(setProgramEncounterForm(mapForm(cancelProgramEncounterForm)));
  yield put.resolve(setSubjectProfile(subject));
}
