import { all, call, fork, put, select, takeLatest, takeEvery } from "redux-saga/effects";
import { find } from "lodash";
import {
  types,
  setEncounterFormMappings,
  setEncounter,
  saveEncounterComplete,
  setValidationResults,
  onLoadSuccess
} from "../reducers/encounterReducer";
import api from "../api";
import {
  selectFormMappingsForSubjectType,
  selectFormMappingForEncounter,
  selectFormMappingForCancelEncounter
} from "./encounterSelector";
import { mapForm } from "../../common/adapters";
import {
  Encounter,
  ModelGeneral as General,
  ObservationsHolder,
  FormElementGroup
} from "avni-models";
import { setSubjectProfile } from "../reducers/subjectDashboardReducer";
import { getSubjectGeneral } from "../reducers/generalSubjectDashboardReducer";
import { mapProfile, mapEncounter } from "../../common/subjectModelMapper";
import formElementService, { getFormElementStatuses } from "../services/FormElementService";
import { setLoad } from "../reducers/loadReducer";
import { setFilteredFormElements } from "../reducers/RulesReducer";
import {
  selectDecisions,
  selectVisitSchedules
} from "dataEntryApp/reducers/serverSideRulesReducer";
import commonFormUtil from "dataEntryApp/reducers/commonFormUtil";
import { selectEncounterState, setState } from "dataEntryApp/reducers/encounterReducer";

//TODO: Move all cancel related functionality to a separate saga

export default function*() {
  yield all(
    [
      encouterOnLoadWatcher,
      updateEncounterObsWatcher,
      saveEncounterWatcher,
      createEncounterWatcher,
      createEncounterForScheduledWatcher,
      editEncounterWatcher,
      updateCancelEncounterObsWatcher,
      createCancelEncounterWatcher,
      editCancelEncounterWatcher,
      nextWatcher
    ].map(fork)
  );
}

export function* encouterOnLoadWatcher() {
  yield takeLatest(types.ON_LOAD, encouterOnLoadWorker);
}
export function* encouterOnLoadWorker({ subjectUuid }) {
  yield put.resolve(setLoad(false));
  yield put.resolve(setFilteredFormElements());
  yield put.resolve(getSubjectGeneral(subjectUuid));
  const subjectProfileJson = yield call(api.fetchSubjectProfile, subjectUuid);
  const encounterFormMappings = yield select(
    selectFormMappingsForSubjectType(subjectProfileJson.subjectType.uuid)
  );
  yield put.resolve(setEncounterFormMappings(encounterFormMappings));
  yield put.resolve(setSubjectProfile(mapProfile(subjectProfileJson)));
  yield put.resolve(setLoad(true));
}

export function* createEncounterWatcher() {
  yield takeLatest(types.CREATE_ENCOUNTER, createEncounterWorker);
}
export function* createEncounterWorker({ encounterTypeUuid, subjectUuid }) {
  const subjectProfileJson = yield call(api.fetchSubjectProfile, subjectUuid);
  const state = yield select();

  /*create new encounter obj */
  const encounter = new Encounter();
  encounter.uuid = General.randomUUID();
  encounter.encounterDateTime = new Date();
  encounter.observations = [];
  encounter.encounterType = find(
    state.dataEntry.metadata.operationalModules.encounterTypes,
    eT => eT.uuid === encounterTypeUuid
  );
  encounter.name = encounter.encounterType.name;

  yield setEncounterDetails(encounter, subjectProfileJson);
}

export function* createEncounterForScheduledWatcher() {
  yield takeLatest(types.CREATE_ENCOUNTER_FOR_SCHEDULED, createEncounterForScheduledWorker);
}
export function* createEncounterForScheduledWorker({ encounterUuid }) {
  const encounterJson = yield call(api.fetchEncounter, encounterUuid);
  const subjectProfileJson = yield call(api.fetchSubjectProfile, encounterJson.subjectUUID);
  const encounter = mapEncounter(encounterJson);
  encounter.encounterDateTime = new Date();
  yield setEncounterDetails(encounter, subjectProfileJson);
}

function* updateEncounterObsWatcher() {
  yield takeEvery(types.UPDATE_OBS, updateEncounterObsWorker);
}
export function* updateEncounterObsWorker({ formElement, value }) {
  const state = yield select();
  const encounter = state.dataEntry.encounterReducer.encounter;
  const validationResults = state.dataEntry.encounterReducer.validationResults;
  const observations = formElementService.updateObservations(
    encounter.observations,
    formElement,
    value
  );
  const observationsHolder = new ObservationsHolder(observations);
  const formElementStatuses = getFormElementStatuses(
    encounter,
    formElement.formElementGroup,
    observationsHolder
  );
  const filteredFormElements = FormElementGroup._sortedFormElements(
    formElement.formElementGroup.filterElements(formElementStatuses)
  );
  yield put(setFilteredFormElements(filteredFormElements));
  observationsHolder.updatePrimitiveObs(filteredFormElements, formElementStatuses);
  encounter.observations = observationsHolder.observations;

  yield put(setEncounter(encounter));
  yield put(
    setValidationResults(
      formElementService.validate(
        formElement,
        value,
        encounter.observations,
        validationResults,
        formElementStatuses
      )
    )
  );
}

export function* saveEncounterWatcher() {
  yield takeLatest(types.SAVE_ENCOUNTER, saveEncounterWorker);
}

export function* saveEncounterWorker(params) {
  const state = yield select();
  const encounter = state.dataEntry.encounterReducer.encounter;

  const visitSchedules = yield select(selectVisitSchedules);
  const decisions = yield select(selectDecisions);
  if (decisions) decisions.cancel = params.isCancel;

  let resource = encounter.toResource;
  resource.visitSchedules = visitSchedules;
  resource.decisions = decisions;

  yield call(api.saveEncounter, resource);
  yield put(saveEncounterComplete());
}

function* editEncounterWatcher() {
  yield takeLatest(types.EDIT_ENCOUNTER, editEncounterWorker);
}
export function* editEncounterWorker({ encounterUuid }) {
  const encounterJson = yield call(api.fetchEncounter, encounterUuid);
  const subjectProfileJson = yield call(api.fetchSubjectProfile, encounterJson.subjectUUID);
  yield setEncounterDetails(mapEncounter(encounterJson), subjectProfileJson);
}

export function* setEncounterDetails(encounter, subjectProfileJson) {
  const subject = mapProfile(subjectProfileJson);
  const formMapping = yield select(
    selectFormMappingForEncounter(encounter.encounterType.uuid, subjectProfileJson.subjectType.uuid)
  );
  const encounterFormJson = yield call(api.fetchForm, formMapping.formUUID);
  const encounterForm = mapForm(encounterFormJson);
  encounter.individual = subject;

  // const state = yield select();
  // const legacyRules = selectLegacyRules(state);
  // const legacyRulesMap = selectLegacyRulesAllRules(store.getState());
  const { formElementGroup, filteredFormElements } = commonFormUtil.onLoad(
    encounterForm,
    encounter
  );

  yield put.resolve(
    onLoadSuccess(encounter, encounterForm, formElementGroup, filteredFormElements)
  );
  yield put.resolve(setSubjectProfile(subject));
}

function* updateCancelEncounterObsWatcher() {
  yield takeEvery(types.UPDATE_CANCEL_OBS, updateCancelEncounterObsWorker);
}
export function* updateCancelEncounterObsWorker({ formElement, value }) {
  const state = yield select();
  const encounter = state.dataEntry.encounterReducer.encounter;
  const validationResults = state.dataEntry.encounterReducer.validationResults;
  const cancelObservations = formElementService.updateObservations(
    encounter.cancelObservations,
    formElement,
    value
  );

  const observationsHolder = new ObservationsHolder(cancelObservations);
  const formElementStatuses = getFormElementStatuses(
    encounter,
    formElement.formElementGroup,
    observationsHolder
  );
  const filteredFormElements = FormElementGroup._sortedFormElements(
    formElement.formElementGroup.filterElements(formElementStatuses)
  );
  yield put(setFilteredFormElements(filteredFormElements));
  observationsHolder.updatePrimitiveObs(filteredFormElements, formElementStatuses);
  encounter.cancelObservations = observationsHolder.observations;

  yield put(setEncounter(encounter));
  yield put(
    setValidationResults(
      formElementService.validate(
        formElement,
        value,
        encounter.cancelObservations,
        validationResults,
        formElementStatuses
      )
    )
  );
}

export function* createCancelEncounterWatcher() {
  yield takeLatest(types.CREATE_CANCEL_ENCOUNTER, createCancelEncounterWorker);
}
export function* createCancelEncounterWorker({ encounterUuid }) {
  const encounterJson = yield call(api.fetchEncounter, encounterUuid);
  const subjectProfileJson = yield call(api.fetchSubjectProfile, encounterJson.subjectUUID);
  const encounter = mapEncounter(encounterJson);
  encounter.cancelDateTime = new Date();
  encounter.cancelObservations = [];
  yield setCancelEncounterDetails(encounter, subjectProfileJson);
}

export function* editCancelEncounterWatcher() {
  yield takeLatest(types.EDIT_CANCEL_ENCOUNTER, editCancelEncounterWorker);
}
export function* editCancelEncounterWorker({ encounterUuid }) {
  const encounterJson = yield call(api.fetchEncounter, encounterUuid);
  const subjectProfileJson = yield call(api.fetchSubjectProfile, encounterJson.subjectUUID);
  yield setCancelEncounterDetails(mapEncounter(encounterJson), subjectProfileJson);
}

export function* setCancelEncounterDetails(encounter, subjectProfileJson) {
  const subject = mapProfile(subjectProfileJson);
  encounter.individual = subject;

  const cancelFormMapping = yield select(
    selectFormMappingForCancelEncounter(
      encounter.encounterType.uuid,
      subjectProfileJson.subjectType.uuid
    )
  );
  const cancelEncounterFormJson = yield call(api.fetchForm, cancelFormMapping.formUUID);
  const encounterCancellationForm = mapForm(cancelEncounterFormJson);
  const { formElementGroup, filteredFormElements } = commonFormUtil.onLoad(
    encounterCancellationForm,
    cancelEncounterFormJson
  );

  yield put.resolve(
    onLoadSuccess(encounter, encounterCancellationForm, formElementGroup, filteredFormElements)
  );
  yield put.resolve(setSubjectProfile(subject));
}

export function* nextWatcher() {
  yield takeLatest(types.ON_NEXT, nextWorker);
}

export function* nextWorker() {
  const state = yield select(selectEncounterState);

  const {
    formElementGroup,
    filteredFormElements,
    validationResults,
    observations
  } = commonFormUtil.onNext({
    ...state,
    observations: state.encounter.observations,
    entity: state.encounter
  });

  const encounter = state.encounter.cloneForEdit();
  encounter.observations = observations;
  const nextState = {
    ...state,
    encounter,
    formElementGroup,
    filteredFormElements,
    validationResults
  };
  yield put(setState(nextState));
}
