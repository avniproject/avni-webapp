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
  setValidationResults,
  // getUnplanProgramEncounters,
  onLoad
} from "../reducers/programEncounterReducer";
import api from "../api";
import { selectProgramEncounterFormMappingForSubjectType } from "./programEncounterSelector";
import { mapForm } from "../../common/adapters";
import { ProgramEncounter, ProgramEnrolment, ObservationsHolder, Concept } from "avni-models";
import { ModelGeneral as General, EncounterType } from "avni-models";
import { getSubjectProfile } from "../reducers/subjectDashboardReducer";

export default function*() {
  yield all(
    [
      programEncouterOnLoadWatcher,
      // programEncounterFetchWatcher,
      programEncounterFetchFormWatcher,
      updateEncounterObsWatcher,
      saveProgramEncounterWatcher
    ].map(fork)
  );
}

// export function* programEncounterFetchWatcher() {
//   yield takeLatest(types.GET_UNPLAN_PROGRAM_ENCOUNTERS, ProgramEncounterFetchWorker);
// }

// export function* ProgramEncounterFetchWorker({ subjectTypeName, programUuid }) {
//   const programEncounterFormMapping = yield select(
//     selectProgramEncounterFormMappingForSubjectType(subjectTypeName, programUuid)
//   );
//   yield put(setUnplanProgramEncounters(programEncounterFormMapping));
// }

export function* programEncouterOnLoadWatcher() {
  yield takeLatest(types.ON_LOAD, programEncouterOnLoadWorker);
}

export function* programEncouterOnLoadWorker({ enrolmentUuid }) {
  const programEnrolment = yield call(api.fetchProgramEnrolment, enrolmentUuid);
  const programEncounterFormMapping = yield select(
    selectProgramEncounterFormMappingForSubjectType("Individual", programEnrolment.program.uuid)
  );
  yield put(setProgramEnrolment(programEnrolment));
  yield put(setUnplanProgramEncounters(programEncounterFormMapping));
  //yield put(getUnplanProgramEncounters("Individual", programEnrolment.program.uuid));
}

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
  const programEnrolment = yield select(
    state => state.dataEntry.programEncounterReducer.programEnrolment
  );

  yield put(getSubjectProfile(programEnrolment.subjectUuid));

  const programEnrolmentDateTime = yield select(
    state => state.dataEntry.programEncounterReducer.programEnrolment.enrolmentDateTime
  );

  const plannedEncounters = yield select(
    state => state.dataEntry.programEncounterReducer.programEnrolment.programEncounters
  );

  const planEncounter = find(
    plannedEncounters,
    pe => !isNil(pe.encounterType) && pe.encounterType.uuid === encounterTypeUuid
  );

  if (planEncounter) {
    let plannedVisit = new ProgramEncounter();
    let encounterType = new EncounterType();
    encounterType.id = planEncounter.encounterType.id;
    encounterType.name = planEncounter.encounterType.name;
    encounterType.operationalEncounterTypeName =
      planEncounter.encounterType.operationalEncounterTypeName;
    encounterType.uuid = planEncounter.encounterType.uuid;

    plannedVisit.uuid = planEncounter.uuid;
    plannedVisit.encounterType = encounterType;
    plannedVisit.encounterDateTime = moment().toDate();
    plannedVisit.earliestVisitDateTime = planEncounter.earliestVisitDateTime;
    plannedVisit.maxVisitDateTime = planEncounter.maxVisitDateTime;
    plannedVisit.name = planEncounter.name;
    const programEnrolment = new ProgramEnrolment();
    programEnrolment.uuid = enrolmentUuid;
    programEnrolment.enrolmentDateTime = new Date(programEnrolmentDateTime);
    plannedVisit.programEnrolment = programEnrolment;
    plannedVisit.observations = [];
    yield put.resolve(setProgramEncounter(plannedVisit));
  }

  const unplannedEncounters = yield select(
    state => state.dataEntry.programEncounterReducer.unplanProgramEncounters
  );

  const unplanEncounter = find(
    unplannedEncounters,
    ue => !isNil(ue.encounterTypeUUID) && ue.encounterTypeUUID === encounterTypeUuid
  );

  const unplanEncounterType = yield select(state =>
    find(
      get(state, "dataEntry.metadata.operationalModules.encounterTypes"),
      eT => eT.uuid === encounterTypeUuid
    )
  );

  if (unplanEncounter) {
    let unplannedVisit = new ProgramEncounter();
    let encounterType = new EncounterType();
    encounterType.displayName = unplanEncounterType.displayName;
    encounterType.name = unplanEncounterType.name;
    encounterType.operationalEncounterTypeName = unplanEncounterType.operationalEncounterTypeName;
    encounterType.uuid = unplanEncounterType.uuid;
    encounterType.voided = unplanEncounterType.voided;

    unplannedVisit.uuid = General.randomUUID();
    unplannedVisit.encounterType = encounterType;
    unplannedVisit.name = unplannedVisit.encounterType.name;
    unplannedVisit.encounterDateTime = new Date();
    const programEnrolment = new ProgramEnrolment();
    programEnrolment.uuid = enrolmentUuid;
    programEnrolment.enrolmentDateTime = new Date(programEnrolmentDateTime);
    unplannedVisit.programEnrolment = programEnrolment;
    unplannedVisit.observations = [];
    yield put.resolve(setProgramEncounter(unplannedVisit));
  }
}

function* updateEncounterObsWatcher() {
  yield takeEvery(types.UPDATE_OBS, updateEncounterObsWorker);
}

export function* updateEncounterObsWorker({ formElement, value }) {
  const state = yield select();
  const programEncounter = state.dataEntry.programEncounterReducer.programEncounter;
  const validationResults = yield select(
    state => state.dataEntry.programEncounterReducer.validationResults
  );
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
  yield put(saveProgramEncounterComplete(true));
}

export function* saveProgramEncounterWatcher() {
  yield takeLatest(types.SAVE_PROGRAM_ENCOUNTER, saveProgramEncounterWorker);
}
