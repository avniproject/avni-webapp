import { all, call, fork, put, select, takeEvery, takeLatest } from "redux-saga/effects";
import { find, keys } from "lodash";
import {
  onLoadSuccess,
  saveProgramEncounterComplete,
  selectProgramEncounterState,
  setFilteredFormElements,
  setProgramEnrolment,
  setState,
  setUnplanProgramEncounters,
  types
} from "dataEntryApp/reducers/programEncounterReducer";
import api from "../api";
import {
  selectFormMappingForCancelProgramEncounter,
  selectFormMappingForProgramEncounter,
  selectFormMappingForSubjectType
} from "./programEncounterSelector";
import { mapForm } from "../../common/adapters";
import { AbstractEncounter, ModelGeneral as General, ObservationsHolder, ProgramEncounter } from "avni-models";
import { setSubjectProfile } from "../reducers/subjectDashboardReducer";
import { mapObservations, mapProfile, mapProgramEncounter, mapProgramEnrolment } from "common/subjectModelMapper";
import { setLoad } from "../reducers/loadReducer";
import { selectDecisions, selectVisitSchedules } from "dataEntryApp/reducers/serverSideRulesReducer";
import commonFormUtil from "dataEntryApp/reducers/commonFormUtil";
import Wizard from "dataEntryApp/state/Wizard";
import { setEligibleProgramEncounters } from "../reducers/programEncounterReducer";

export default function*() {
  yield all(
    [
      programEncounterOnLoadWatcher,
      updateEncounterObsWatcher,
      addNewQuestionGroupWatcher,
      removeQuestionGroupWatcher,
      saveProgramEncounterWatcher,
      editProgramEncounterWatcher,
      updateEncounterCancelObsWatcher,
      createProgramEncounterWatcher,
      createProgramEncounterForScheduledWatcher,
      createCancelProgramEncounterWatcher,
      editCancelProgramEncounterWatcher,
      nextWatcher,
      previousWatcher,
      programEncounterEligibilityWatcher
    ].map(fork)
  );
}

export function* programEncounterOnLoadWatcher() {
  yield takeLatest(types.ON_LOAD, programEncounterOnLoadWorker);
}

export function* programEncounterOnLoadWorker({ enrolmentUuid }) {
  yield put.resolve(setLoad(false));
  yield put.resolve(setFilteredFormElements());
  const programEnrolment = yield call(api.fetchProgramEnrolment, enrolmentUuid);
  yield put(setProgramEnrolment(programEnrolment));

  const subjectProfileJson = yield call(api.fetchSubjectProfile, programEnrolment.subjectUuid);
  yield put.resolve(setSubjectProfile(mapProfile(subjectProfileJson)));

  const programEncounterFormMapping = yield select(
    selectFormMappingForSubjectType(subjectProfileJson.subjectType.uuid, programEnrolment.program.uuid)
  );
  yield put(setUnplanProgramEncounters(programEncounterFormMapping));
  yield put.resolve(setLoad(true));
}

export function* programEncounterEligibilityWatcher() {
  yield takeLatest(types.GET_ELIGIBLE_PROGRAM_ENCOUNTERS, programEncounterEligibilityWorker);
}

export function* programEncounterEligibilityWorker({ enrolmentUuid }) {
  yield put.resolve(setLoad(false));
  const eligibleEncounters = yield call(api.fetchEligibleProgramEncounterTypes, enrolmentUuid);
  yield put.resolve(setEligibleProgramEncounters(eligibleEncounters));
  yield put.resolve(setLoad(true));
}

export function* createProgramEncounterWatcher() {
  yield takeLatest(types.CREATE_PROGRAM_ENCOUNTER, createProgramEncounterWorker);
}

export function* createProgramEncounterWorker({ encounterTypeUuid, enrolUuid }) {
  const programEnrolmentJson = yield call(api.fetchProgramEnrolments, enrolUuid);
  const state = yield select();
  const latestProgramEncounter = yield call(
    api.fetchCompletedProgramEncounters,
    enrolUuid,
    `encounterTypeUuids=${encounterTypeUuid}&&page=0&&size=1&&sort=encounterDateTime,desc`
  );

  const encounterTypeDetails = yield call(api.fetchEncounterTypeDetails, encounterTypeUuid);
  /*create new encounter obj */
  const programEncounter = new ProgramEncounter();
  programEncounter.uuid = General.randomUUID();
  programEncounter.encounterDateTime = new Date();
  let isImmutableAndHasCompletedEncounter = encounterTypeDetails.immutable && latestProgramEncounter.content[0];
  programEncounter.observations = isImmutableAndHasCompletedEncounter
    ? mapObservations(latestProgramEncounter.content[0].observations)
    : [];
  programEncounter.encounterType = find(state.dataEntry.metadata.operationalModules.encounterTypes, eT => eT.uuid === encounterTypeUuid);
  programEncounter.name = programEncounter.encounterType.displayName;
  yield setProgramEncounterDetails(programEncounter, programEnrolmentJson);
}

export function* createProgramEncounterForScheduledWatcher() {
  yield takeLatest(types.CREATE_PROGRAM_ENCOUNTER_FOR_SCHEDULED, createProgramEncounterForScheduledWorker);
}

export function* createProgramEncounterForScheduledWorker({ programEncounterUuid }) {
  const programEncounterJson = yield call(api.fetchProgramEncounter, programEncounterUuid);
  const latestProgramEncounter = yield call(
    api.fetchCompletedProgramEncounters,
    programEncounterJson.enrolmentUUID,
    `encounterTypeUuids=${programEncounterJson.encounterType.uuid}&&page=0&&size=1&&sort=encounterDateTime,desc`
  );

  const programEnrolmentJson = yield call(api.fetchProgramEnrolments, programEncounterJson.enrolmentUUID);
  let isImmutableAndHasCompletedEncounter = programEncounterJson.encounterType.immutable && latestProgramEncounter.content[0];
  const programEncounter = mapProgramEncounter(
    programEncounterJson,
    isImmutableAndHasCompletedEncounter ? latestProgramEncounter.content[0].observations : programEncounterJson["observations"]
  );
  programEncounter.encounterDateTime = new Date();
  yield setProgramEncounterDetails(programEncounter, programEnrolmentJson);
}

function* updateEncounterObsWatcher() {
  yield takeEvery(types.UPDATE_OBS, updateEncounterObsWorker);
}
export function* updateEncounterObsWorker({ formElement, value, childFormElement, questionGroupIndex }) {
  const state = yield select(selectProgramEncounterState);
  const programEncounter = state.programEncounter.cloneForEdit();
  const { validationResults, filteredFormElements } = commonFormUtil.updateObservations(
    formElement,
    value,
    programEncounter,
    new ObservationsHolder(programEncounter.observations),
    state.validationResults,
    childFormElement,
    questionGroupIndex
  );
  yield put(
    setState({
      ...state,
      filteredFormElements,
      programEncounter,
      validationResults
    })
  );
}

function* addNewQuestionGroupWatcher() {
  yield takeEvery(types.ADD_NEW_QG, addNewQuestionGroupWorker);
}
export function* addNewQuestionGroupWorker({ formElement }) {
  const state = yield select(selectProgramEncounterState);
  const programEncounter = state.programEncounter.cloneForEdit();
  const { filteredFormElements } = commonFormUtil.addNewQuestionGroup(programEncounter, formElement, programEncounter.observations);
  yield put(
    setState({
      ...state,
      programEncounter,
      filteredFormElements
    })
  );
}

function* removeQuestionGroupWatcher() {
  yield takeEvery(types.REMOVE_QG, removeNewQuestionGroupWorker);
}
export function* removeNewQuestionGroupWorker({ formElement, questionGroupIndex }) {
  const state = yield select(selectProgramEncounterState);
  const programEncounter = state.programEncounter.cloneForEdit();
  const { filteredFormElements } = commonFormUtil.removeQuestionGroup(
    programEncounter,
    formElement,
    programEncounter.observations,
    questionGroupIndex
  );
  yield put(
    setState({
      ...state,
      programEncounter,
      filteredFormElements
    })
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
  const programEnrolmentJson = yield call(api.fetchProgramEnrolments, programEncounterJson.enrolmentUUID);
  yield setProgramEncounterDetails(mapProgramEncounter(programEncounterJson), programEnrolmentJson, true);
}

export function* setProgramEncounterDetails(programEncounter, programEnrolmentJson, isEdit = false) {
  const subjectProfileJson = yield call(api.fetchSubjectProfile, programEnrolmentJson.subjectUuid);
  const subject = mapProfile(subjectProfileJson);
  const formMapping = yield select(
    selectFormMappingForProgramEncounter(
      programEncounter.encounterType.uuid,
      programEnrolmentJson.programUuid,
      subjectProfileJson.subjectType.uuid
    )
  );
  const programEncounterFormJson = yield call(api.fetchForm, formMapping.formUUID);
  const programEncounterForm = mapForm(programEncounterFormJson);
  const programEnrolment = mapProgramEnrolment(programEnrolmentJson, subject);
  programEncounter.programEnrolment = programEnrolment;

  const { formElementGroup, filteredFormElements, onSummaryPage, wizard, isFormEmpty } = commonFormUtil.onLoad(
    programEncounterForm,
    programEncounter,
    false,
    isEdit
  );

  yield put.resolve(
    onLoadSuccess(programEncounter, programEncounterForm, formElementGroup, filteredFormElements, onSummaryPage, wizard, isFormEmpty)
  );
  yield put.resolve(setSubjectProfile(subject));
}

function* updateEncounterCancelObsWatcher() {
  yield takeEvery(types.UPDATE_CANCEL_OBS, updateEncounterCancelObsWorker);
}
export function* updateEncounterCancelObsWorker({ formElement, value, childFormElement }) {
  const state = yield select(selectProgramEncounterState);
  const programEncounter = state.programEncounter.cloneForEdit();
  const { validationResults, filteredFormElements } = commonFormUtil.updateObservations(
    formElement,
    value,
    programEncounter,
    new ObservationsHolder(programEncounter.cancelObservations),
    state.validationResults,
    childFormElement
  );
  yield put(
    setState({
      ...state,
      filteredFormElements,
      programEncounter,
      validationResults
    })
  );
}

export function* createCancelProgramEncounterWatcher() {
  yield takeLatest(types.CREATE_CANCEL_PROGRAM_ENCOUNTER, createCancelProgramEncounterWorker);
}
export function* createCancelProgramEncounterWorker({ programEncounterUuid }) {
  const programEncounterJson = yield call(api.fetchProgramEncounter, programEncounterUuid);
  const programEnrolmentJson = yield call(api.fetchProgramEnrolments, programEncounterJson.enrolmentUUID);
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
  const programEnrolmentJson = yield call(api.fetchProgramEnrolments, programEncounterJson.enrolmentUUID);
  yield setCancelProgramEncounterDetails(mapProgramEncounter(programEncounterJson), programEnrolmentJson);
}

export function* setCancelProgramEncounterDetails(programEncounter, programEnrolmentJson) {
  const subjectProfileJson = yield call(api.fetchSubjectProfile, programEnrolmentJson.subjectUuid);
  const subject = mapProfile(subjectProfileJson);
  const programEnrolment = mapProgramEnrolment(programEnrolmentJson, subject);
  programEncounter.programEnrolment = programEnrolment;

  const formMapping = yield select(
    selectFormMappingForCancelProgramEncounter(
      programEncounter.encounterType.uuid,
      programEnrolmentJson.programUuid,
      subjectProfileJson.subjectType.uuid
    )
  );
  const cancelProgramEncounterFormJson = yield call(api.fetchForm, formMapping.formUUID);
  const cancelProgramEncounterForm = mapForm(cancelProgramEncounterFormJson);

  const { formElementGroup, filteredFormElements, onSummaryPage, wizard, isFormEmpty } = commonFormUtil.onLoad(
    cancelProgramEncounterForm,
    programEncounter
  );

  yield put.resolve(
    onLoadSuccess(programEncounter, cancelProgramEncounterForm, formElementGroup, filteredFormElements, onSummaryPage, wizard, isFormEmpty)
  );
  yield put.resolve(setSubjectProfile(subject));
}

export function* nextWatcher() {
  yield takeLatest(types.ON_NEXT, wizardWorker, commonFormUtil.onNext, true);
}

export function* previousWatcher() {
  yield takeLatest(types.ON_PREVIOUS, wizardWorker, commonFormUtil.onPrevious, false);
}

export function* wizardWorker(getNextState, isNext, params) {
  const state = yield select(selectProgramEncounterState);

  if (state.isFormEmpty) {
    yield put(
      setState({
        ...state,
        onSummaryPage: isNext,
        wizard: isNext ? new Wizard(1, 1, 2) : new Wizard(1)
      })
    );
  } else {
    const obsToUpdate = params.isCancel ? "cancelObservations" : "observations";
    const { formElementGroup, filteredFormElements, validationResults, observations, onSummaryPage, wizard } = getNextState({
      formElementGroup: state.formElementGroup,
      filteredFormElements: state.filteredFormElements,
      observations: state.programEncounter[obsToUpdate],
      entity: state.programEncounter,
      validationResults: state.validationResults,
      onSummaryPage: state.onSummaryPage,
      wizard: state.wizard.clone(),
      entityValidations: params.isCancel ? [] : state.programEncounter.validate(),
      staticFormElementIds: state.wizard.isFirstPage() ? keys(AbstractEncounter.fieldKeys) : []
    });

    const programEncounter = state.programEncounter.cloneForEdit();
    programEncounter[obsToUpdate] = observations;
    const nextState = {
      ...state,
      programEncounter,
      formElementGroup,
      filteredFormElements,
      validationResults,
      onSummaryPage,
      wizard
    };
    yield put(setState(nextState));
  }
}
