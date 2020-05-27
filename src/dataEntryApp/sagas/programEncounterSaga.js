import { all, call, fork, put, select, takeLatest, takeEvery } from "redux-saga/effects";
import { find, get, isNil, remove } from "lodash";
import moment from "moment";
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
  selectFormMappingByEncounterTypeUuid
} from "./programEncounterSelector";
import { mapForm } from "../../common/adapters";
import { ProgramEncounter, ProgramEnrolment, ObservationsHolder, Concept } from "avni-models";
import { ModelGeneral as General, EncounterType } from "avni-models";
import { getSubjectProfile } from "../reducers/subjectDashboardReducer";
import { mapProgramEncounter } from "common/subjectModelMapper";

export default function*() {
  yield all(
    [
      programEncouterOnLoadWatcher,
      programEncounterFetchFormWatcher,
      updateEncounterObsWatcher,
      saveProgramEncounterWatcher,
      loadEditProgramEncounterWatcher
    ].map(fork)
  );
}

export function* programEncouterOnLoadWatcher() {
  yield takeLatest(types.ON_LOAD, programEncouterOnLoadWorker);
}

export function* programEncouterOnLoadWorker({ enrolmentUuid }) {
  const programEnrolment = yield call(api.fetchProgramEnrolment, enrolmentUuid);
  const programEncounterFormMapping = yield select(
    selectFormMappingForSubjectType("Individual", programEnrolment.program.uuid)
  );
  yield put(setProgramEnrolment(programEnrolment));
  yield put(setUnplanProgramEncounters(programEncounterFormMapping));
}

export function* programEncounterFetchFormWatcher() {
  yield takeLatest(types.GET_PROGRAM_ENCOUNTER_FORM, programEncounterFetchFormWorker);
}

export function* programEncounterFetchFormWorker({ encounterTypeUuid, enrolmentUuid }) {
  const formMapping = yield select(selectFormMappingByEncounterTypeUuid(encounterTypeUuid));
  const programEncounterForm = yield call(api.fetchForm, formMapping.formUUID);
  const state = yield select();
  const programEnrolment = state.dataEntry.programEncounterReducer.programEnrolment;
  const programEnrolmentDateTime =
    state.dataEntry.programEncounterReducer.programEnrolment.enrolmentDateTime;
  const plannedEncounters =
    state.dataEntry.programEncounterReducer.programEnrolment.programEncounters;
  const unplannedEncounters = state.dataEntry.programEncounterReducer.unplanProgramEncounters;
  const planEncounter = find(
    plannedEncounters,
    pe => !isNil(pe.encounterType) && pe.encounterType.uuid === encounterTypeUuid
  );
  const unplanEncounter = find(
    unplannedEncounters,
    ue => !isNil(ue.encounterTypeUUID) && ue.encounterTypeUUID === encounterTypeUuid
  );
  const unplanEncounterType = find(
    get(state, "dataEntry.metadata.operationalModules.encounterTypes"),
    eT => eT.uuid === encounterTypeUuid
  );

  if (planEncounter) {
    const planVisit = new ProgramEncounter();
    const encounterType = new EncounterType();
    const programEnrolment = new ProgramEnrolment();

    programEnrolment.uuid = enrolmentUuid;
    programEnrolment.enrolmentDateTime = new Date(programEnrolmentDateTime);

    encounterType.id = planEncounter.encounterType.id;
    encounterType.name = planEncounter.encounterType.name;
    encounterType.operationalEncounterTypeName =
      planEncounter.encounterType.operationalEncounterTypeName;
    encounterType.uuid = planEncounter.encounterType.uuid;

    planVisit.uuid = planEncounter.uuid;
    planVisit.encounterType = encounterType;
    planVisit.encounterDateTime = moment().toDate();
    planVisit.earliestVisitDateTime = planEncounter.earliestVisitDateTime;
    planVisit.maxVisitDateTime = planEncounter.maxVisitDateTime;
    planVisit.name = planEncounter.name;
    planVisit.programEnrolment = programEnrolment;
    planVisit.observations = [];
    yield put.resolve(setProgramEncounter(planVisit));
  }

  if (unplanEncounter) {
    const unplanVisit = new ProgramEncounter();
    const encounterType = new EncounterType();
    const programEnrolment = new ProgramEnrolment();

    programEnrolment.uuid = enrolmentUuid;
    programEnrolment.enrolmentDateTime = new Date(programEnrolmentDateTime);

    encounterType.displayName = unplanEncounterType.displayName;
    encounterType.name = unplanEncounterType.name;
    encounterType.operationalEncounterTypeName = unplanEncounterType.operationalEncounterTypeName;
    encounterType.uuid = unplanEncounterType.uuid;
    encounterType.voided = unplanEncounterType.voided;

    unplanVisit.uuid = General.randomUUID();
    unplanVisit.encounterType = encounterType;
    unplanVisit.name = unplanVisit.encounterType.name;
    unplanVisit.encounterDateTime = new Date();
    unplanVisit.programEnrolment = programEnrolment;
    unplanVisit.observations = [];
    yield put.resolve(setProgramEncounter(unplanVisit));
  }
  yield put(setProgramEncounterForm(mapForm(programEncounterForm)));
  yield put(getSubjectProfile(programEnrolment.subjectUuid));
}

function* updateEncounterObsWatcher() {
  yield takeEvery(types.UPDATE_OBS, updateEncounterObsWorker);
}

export function* updateEncounterObsWorker({ formElement, value }) {
  const state = yield select();
  const programEncounter = state.dataEntry.programEncounterReducer.programEncounter;
  const validationResults = state.dataEntry.programEncounterReducer.validationResults;
  programEncounter.observations = updateObservations(
    programEncounter.observations,
    formElement,
    value
  );

  yield put(setProgramEncounter(programEncounter));
  yield put(
    setValidationResults(
      validate(formElement, value, programEncounter.observations, validationResults)
    )
  );
}

function updateObservations(observations, formElement, value) {
  const observationHolder = new ObservationsHolder(observations);
  if (formElement.concept.datatype === Concept.dataType.Coded && formElement.isMultiSelect()) {
    const answer = observationHolder.toggleMultiSelectAnswer(formElement.concept, value);
  } else if (
    formElement.concept.datatype === Concept.dataType.Coded &&
    formElement.isSingleSelect()
  ) {
    observationHolder.toggleSingleSelectAnswer(formElement.concept, value);
  } else if (
    formElement.concept.datatype === Concept.dataType.Duration &&
    !isNil(formElement.durationOptions)
  ) {
    observationHolder.updateCompositeDurationValue(formElement.concept, value);
  } else if (
    formElement.concept.datatype === Concept.dataType.Date &&
    !isNil(formElement.durationOptions)
  ) {
    observationHolder.addOrUpdatePrimitiveObs(formElement.concept, value);
  } else {
    observationHolder.addOrUpdatePrimitiveObs(formElement.concept, value);
  }
  return observationHolder.observations;
}

function validate(formElement, value, observations, validationResults) {
  let isNullForMultiselect = false;
  if (formElement.concept.datatype === Concept.dataType.Coded && formElement.isMultiSelect()) {
    const observationHolder = new ObservationsHolder(observations);
    const answers =
      observationHolder.findObservation(formElement.concept) &&
      observationHolder.findObservation(formElement.concept).getValue();

    isNullForMultiselect = isNil(answers);
  }

  const validationResult = formElement.validate(isNullForMultiselect ? null : value);

  remove(
    validationResults,
    existingValidationResult =>
      existingValidationResult.formIdentifier === validationResult.formIdentifier
  );

  validationResults.push(validationResult);
  return validationResults;
}

export function* saveProgramEncounterWorker() {
  const state = yield select();
  const programEncounter = state.dataEntry.programEncounterReducer.programEncounter;
  let resource = programEncounter.toResource;
  yield call(api.saveProgramEncouter, resource);
  yield put(saveProgramEncounterComplete());
}

export function* saveProgramEncounterWatcher() {
  yield takeLatest(types.SAVE_PROGRAM_ENCOUNTER, saveProgramEncounterWorker);
}

function* loadEditProgramEncounterWatcher() {
  yield takeLatest(types.ON_LOAD_EDIT_PROGRAM_ENCOUNTER, loadEditProgramEncounterWorker);
}

export function* loadEditProgramEncounterWorker({ programEncounterUuid, enrolUuid }) {
  const programEncounterJson = yield call(api.fetchProgramEncounter, programEncounterUuid);
  const programEnrolmentJson = yield call(api.fetchProgramEnrolment, enrolUuid);
  const programEncounter = mapProgramEncounter(programEncounterJson);
  const formMapping = yield select(
    selectFormMappingByEncounterTypeUuid(programEncounter.encounterType.uuid)
  );
  const programEncounterForm = yield call(api.fetchForm, formMapping.formUUID);
  const programEnrolment = new ProgramEnrolment();
  programEnrolment.uuid = enrolUuid;
  programEnrolment.enrolmentDateTime = new Date(programEnrolmentJson.enrolmentDateTime);
  programEncounter.programEnrolment = programEnrolment;

  yield put(setProgramEncounterForm(mapForm(programEncounterForm)));
  yield put.resolve(setProgramEncounter(programEncounter));
  yield put(getSubjectProfile(programEnrolmentJson.subjectUuid));
}
