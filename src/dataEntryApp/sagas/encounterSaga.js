import { all, call, fork, put, select, takeLatest, takeEvery } from "redux-saga/effects";
import { find } from "lodash";
import {
  types,
  setEncounterFormMappings,
  setEncounterForm,
  setEncounter,
  saveEncounterComplete,
  setValidationResults
} from "../reducers/encounterReducer";
import api from "../api";
import {
  selectFormMappingsForSubjectType,
  selectFormMappingForEncounter,
  selectFormMappingForCancelEncounter
} from "./encounterSelector";
import { mapForm } from "../../common/adapters";
import { Encounter, Individual, ModelGeneral as General } from "avni-models";
import { setSubjectProfile } from "../reducers/subjectDashboardReducer";
import { getSubjectGeneral } from "../reducers/generalSubjectDashboardReducer";
import { mapProfile, mapEncounter } from "../../common/subjectModelMapper";
import formElementService from "../services/FormElementService";
import { setLoad } from "../reducers/loadReducer";

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
      editCancelEncounterWatcher
    ].map(fork)
  );
}

export function* encouterOnLoadWatcher() {
  yield takeLatest(types.ON_LOAD, encouterOnLoadWorker);
}
export function* encouterOnLoadWorker({ subjectUuid }) {
  yield put.resolve(setLoad(false));
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
  encounter.observations = formElementService.updateObservations(
    encounter.observations,
    formElement,
    value
  );

  yield put(setEncounter(encounter));
  yield put(
    setValidationResults(
      formElementService.validate(formElement, value, encounter.observations, validationResults)
    )
  );
}

export function* saveEncounterWatcher() {
  yield takeLatest(types.SAVE_ENCOUNTER, saveEncounterWorker);
}
export function* saveEncounterWorker() {
  const state = yield select();
  const encounter = state.dataEntry.encounterReducer.encounter;
  let resource = encounter.toResource;
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
  const formMapping = yield select(
    selectFormMappingForEncounter(encounter.encounterType.uuid, subjectProfileJson.subjectType.uuid)
  );
  const encounterForm = yield call(api.fetchForm, formMapping.formUUID);
  const individual = new Individual();
  individual.uuid = subjectProfileJson.uuid;
  individual.registrationDate = new Date(subjectProfileJson.registrationDate);
  encounter.individual = individual;

  yield put.resolve(setEncounter(encounter));
  yield put.resolve(setEncounterForm(mapForm(encounterForm)));
  yield put.resolve(setSubjectProfile(mapProfile(subjectProfileJson)));
}

function* updateCancelEncounterObsWatcher() {
  yield takeEvery(types.UPDATE_CANCEL_OBS, updateCancelEncounterObsWorker);
}
export function* updateCancelEncounterObsWorker({ formElement, value }) {
  const state = yield select();
  const encounter = state.dataEntry.encounterReducer.encounter;
  const validationResults = state.dataEntry.encounterReducer.validationResults;
  encounter.cancelObservations = formElementService.updateObservations(
    encounter.cancelObservations,
    formElement,
    value
  );

  yield put(setEncounter(encounter));
  yield put(
    setValidationResults(
      formElementService.validate(
        formElement,
        value,
        encounter.cancelObservations,
        validationResults
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
  const cancelFormMapping = yield select(
    selectFormMappingForCancelEncounter(
      encounter.encounterType.uuid,
      subjectProfileJson.subjectType.uuid
    )
  );
  const cancelEncounterForm = yield call(api.fetchForm, cancelFormMapping.formUUID);
  const individual = new Individual();
  individual.uuid = subjectProfileJson.uuid;
  individual.registrationDate = new Date(subjectProfileJson.registrationDate);
  encounter.individual = individual;

  yield put.resolve(setEncounter(encounter));
  yield put.resolve(setEncounterForm(mapForm(cancelEncounterForm)));
  yield put.resolve(setSubjectProfile(mapProfile(subjectProfileJson)));
}
