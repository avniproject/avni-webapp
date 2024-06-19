import { ObservationsHolder, ProgramEnrolment } from "avni-models";
import { all, call, fork, put, select, takeEvery, takeLatest } from "redux-saga/effects";
import api from "../api";
import { selectEnrolmentFormMappingForSubjectType, selectProgram, selectProgramEnrolment } from "./enrolmentSelectors";
import { mapForm } from "../../common/adapters";
import {
  onLoadSuccess,
  saveProgramComplete,
  selectProgramEnrolmentState,
  selectEnrolmentForm,
  selectIdentifierAssignments,
  setFilteredFormElements as setFilteredFormElementsEnrolment,
  setInitialState,
  setState as setProgramEnrolmentState,
  types as enrolmentTypes
} from "../reducers/programEnrolReducer";
import { assign, keys } from "lodash";
import { mapProgramEnrolment } from "../../common/subjectModelMapper";
import { mapProfile } from "common/subjectModelMapper";
import { setSubjectProfile } from "../reducers/subjectDashboardReducer";
import { selectChecklists, selectDecisions, selectVisitSchedules } from "dataEntryApp/reducers/serverSideRulesReducer";
import commonFormUtil from "dataEntryApp/reducers/commonFormUtil";
import Wizard from "dataEntryApp/state/Wizard";
import identifierAssignmentService from "dataEntryApp/services/IdentifierAssignmentService";

export function* enrolmentOnLoadWatcher() {
  yield takeLatest(enrolmentTypes.ON_LOAD, setupNewEnrolmentWorker);
}

function* setupNewEnrolmentWorker({ subjectTypeName, programName, formType, programEnrolmentUuid, subjectUuid }) {
  yield put.resolve(setInitialState());
  yield put.resolve(setFilteredFormElementsEnrolment());

  yield put.resolve(setSubjectProfile());
  const subjectProfileJson = yield call(api.fetchSubjectProfile, subjectUuid);
  const subjectProfile = mapProfile(subjectProfileJson);
  yield put.resolve(setSubjectProfile(subjectProfile));

  const program = yield select(selectProgram(programName));
  const state = yield select();
  const subject = state.dataEntry.subjectProfile.subjectProfile;

  let programEnrolment;
  let isNewEnrolment = false;
  let identifierAssignments = [];

  if (formType === "ProgramEnrolment" && programEnrolmentUuid) {
    programEnrolment = yield call(api.fetchProgramEnrolments, programEnrolmentUuid);
    programEnrolment = mapProgramEnrolment(programEnrolment, subject);
    programEnrolment.programExitObservations = [];
    assign(programEnrolment, { program });
  } else if (formType === "ProgramEnrolment") {
    programEnrolment = ProgramEnrolment.createEmptyInstance({ individual: subject, program });
    isNewEnrolment = true;
  } else if (formType === "ProgramExit" && programEnrolmentUuid) {
    programEnrolment = yield call(api.fetchProgramEnrolments, programEnrolmentUuid);
    programEnrolment = mapProgramEnrolment(programEnrolment, subject);
    programEnrolment.programExitDateTime = new Date();
    if (!programEnrolment.programExitObservations) {
      programEnrolment.programExitObservations = [];
    }
    assign(programEnrolment, { program });
  } else {
    programEnrolment = yield call(api.fetchProgramEnrolments, programEnrolmentUuid);
    programEnrolment = mapProgramEnrolment(programEnrolment, subject);
    programEnrolment.programExitObservations = [];
    programEnrolment.programExitDateTime = new Date();
    assign(programEnrolment, { program });
  }

  const formMapping = yield select(selectEnrolmentFormMappingForSubjectType(subjectTypeName, programName, formType));
  const enrolFormJson = yield call(api.fetchForm, formMapping.formUUID);
  const enrolForm = mapForm(enrolFormJson);

  if (isNewEnrolment) {
    identifierAssignments = yield call(api.fetchIdentifierAssignments, formMapping.formUUID);
    identifierAssignmentService.addIdentifiersToObservations(enrolForm, programEnrolment.observations, identifierAssignments);
  }

  const { formElementGroup, filteredFormElements, onSummaryPage, wizard, isFormEmpty } = commonFormUtil.onLoad(
    enrolForm,
    programEnrolment,
    false,
    !isNewEnrolment
  );
  yield put.resolve(
    onLoadSuccess(
      programEnrolment,
      enrolForm,
      formElementGroup,
      filteredFormElements,
      onSummaryPage,
      wizard,
      isFormEmpty,
      identifierAssignments
    )
  );
}

export function* saveProgramEnrolmentWorker(params) {
  try {
    const programEnrolment = yield select(selectProgramEnrolment);
    const visitSchedules = yield select(selectVisitSchedules);
    const decisions = yield select(selectDecisions);
    if (decisions) decisions.exit = params.isExit;
    const checklists = yield select(selectChecklists);
    const enrolmentForm = yield select(selectEnrolmentForm);
    const identifierAssignments = yield select(selectIdentifierAssignments);

    let resource = programEnrolment.toResource;
    resource.visitSchedules = visitSchedules;
    resource.decisions = decisions;
    resource.checklists = checklists;
    resource.identifierAssignmentUuids = identifierAssignmentService.getIdentifierAssignmentUuids(
      enrolmentForm,
      programEnrolment.observations,
      identifierAssignments
    );

    yield call(api.saveProgramEnrolment, resource);
    yield put(saveProgramComplete());
  } catch (e) {
    console.log(e);
  }
}

export function* saveProgramEnrolmentWatcher() {
  yield takeLatest(enrolmentTypes.SAVE_PROGRAM_ENROLMENT, saveProgramEnrolmentWorker);
}

export function* undoExitProgramEnrolmentWorker({ programEnrolmentUuid }) {
  const state = yield select();
  const subject = state.dataEntry.subjectProfile.subjectProfile;

  let programEnrolment = yield call(api.fetchProgramEnrolments, programEnrolmentUuid);
  programEnrolment = mapProgramEnrolment(programEnrolment, subject);
  programEnrolment.programExitDateTime = undefined;
  programEnrolment.programExitObservations = [];

  let resource = programEnrolment.toResource;
  yield call(api.saveProgramEnrolment, resource);
  yield put(saveProgramComplete());
}

export function* undoExitProgramEnrolmentWatcher() {
  yield takeLatest(enrolmentTypes.UNDO_EXIT_ENROLMENT, undoExitProgramEnrolmentWorker);
}

function* updateEnrolmentObsWatcher() {
  yield takeEvery(enrolmentTypes.UPDATE_OBS, updateEnrolmentObsWorker);
}

function* updateExitEnrolmentObsWatcher() {
  yield takeEvery(enrolmentTypes.UPDATE_EXIT_OBS, updateExitEnrolmentObsWorker);
}

export function* updateExitEnrolmentObsWorker({ formElement, value, childFormElement }) {
  const state = yield select(selectProgramEnrolmentState);
  const programEnrolment = state.programEnrolment.cloneForEdit();
  const { validationResults, filteredFormElements } = commonFormUtil.updateObservations(
    formElement,
    value,
    programEnrolment,
    new ObservationsHolder(programEnrolment.programExitObservations),
    state.validationResults,
    childFormElement
  );
  yield put(
    setProgramEnrolmentState({
      ...state,
      filteredFormElements,
      programEnrolment,
      validationResults
    })
  );
}

export function* updateEnrolmentObsWorker({ formElement, value, childFormElement, questionGroupIndex }) {
  const state = yield select(selectProgramEnrolmentState);
  const programEnrolment = state.programEnrolment.cloneForEdit();
  const { validationResults, filteredFormElements } = commonFormUtil.updateObservations(
    formElement,
    value,
    programEnrolment,
    new ObservationsHolder(programEnrolment.observations),
    state.validationResults,
    childFormElement,
    questionGroupIndex
  );
  yield put(
    setProgramEnrolmentState({
      ...state,
      filteredFormElements,
      programEnrolment,
      validationResults
    })
  );
}

function* addNewQuestionGroupWatcher() {
  yield takeEvery(enrolmentTypes.ADD_NEW_QG, addNewQuestionGroupWorker);
}

export function* addNewQuestionGroupWorker({ formElement }) {
  const state = yield select(selectProgramEnrolmentState);
  const programEnrolment = state.programEnrolment.cloneForEdit();
  const { filteredFormElements } = commonFormUtil.addNewQuestionGroup(programEnrolment, formElement, programEnrolment.observations);
  yield put(
    setProgramEnrolmentState({
      ...state,
      programEnrolment,
      filteredFormElements
    })
  );
}

function* removeQuestionGroupWatcher() {
  yield takeEvery(enrolmentTypes.REMOVE_QG, removeQuestionGroupWorker);
}

export function* removeQuestionGroupWorker({ formElement, questionGroupIndex }) {
  const state = yield select(selectProgramEnrolmentState);
  const programEnrolment = state.programEnrolment.cloneForEdit();
  const { filteredFormElements } = commonFormUtil.removeQuestionGroup(
    programEnrolment,
    formElement,
    programEnrolment.observations,
    questionGroupIndex
  );
  yield put(
    setProgramEnrolmentState({
      ...state,
      programEnrolment,
      filteredFormElements
    })
  );
}

export function* enrolmentNextWatcher() {
  yield takeLatest(enrolmentTypes.ON_NEXT, enrolmentWizardWorker, commonFormUtil.onNext, true);
}

export function* enrolmentPreviousWatcher() {
  yield takeLatest(enrolmentTypes.ON_PREVIOUS, enrolmentWizardWorker, commonFormUtil.onPrevious, false);
}

export function* enrolmentWizardWorker(getNextState, isNext, params) {
  const state = yield select(selectProgramEnrolmentState);

  if (state.isFormEmpty) {
    yield put(
      setProgramEnrolmentState({
        ...state,
        onSummaryPage: isNext,
        wizard: isNext ? new Wizard(1, 1, 2) : new Wizard(1)
      })
    );
  } else {
    const obsToUpdate = params.isExit ? "programExitObservations" : "observations";
    const { formElementGroup, filteredFormElements, validationResults, observations, onSummaryPage, wizard } = getNextState({
      formElementGroup: state.formElementGroup,
      filteredFormElements: state.filteredFormElements,
      observations: state.programEnrolment[obsToUpdate],
      entity: state.programEnrolment,
      validationResults: state.validationResults,
      onSummaryPage: state.onSummaryPage,
      wizard: state.wizard.clone(),
      entityValidations: params.isExit ? state.programEnrolment.validateExit() : state.programEnrolment.validateEnrolment(),
      staticFormElementIds: state.wizard.isFirstPage() ? keys(ProgramEnrolment.validationKeys) : []
    });

    const programEnrolment = state.programEnrolment.cloneForEdit();
    programEnrolment[obsToUpdate] = observations;
    const nextState = {
      ...state,
      programEnrolment,
      formElementGroup,
      filteredFormElements,
      validationResults,
      onSummaryPage,
      wizard
    };
    yield put(setProgramEnrolmentState(nextState));
  }
}

export default function* enrolmentSaga() {
  yield all(
    [
      enrolmentOnLoadWatcher,
      updateEnrolmentObsWatcher,
      addNewQuestionGroupWatcher,
      removeQuestionGroupWatcher,
      saveProgramEnrolmentWatcher,
      enrolmentNextWatcher,
      enrolmentPreviousWatcher,
      updateExitEnrolmentObsWatcher,
      undoExitProgramEnrolmentWatcher
    ].map(fork)
  );
}
