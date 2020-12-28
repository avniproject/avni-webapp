import { ObservationsHolder, ProgramEnrolment } from "avni-models";
import { all, call, fork, put, select, takeEvery, takeLatest } from "redux-saga/effects";
import api from "../api";
import {
  selectEnrolmentFormMappingForSubjectType,
  selectProgram,
  selectProgramEnrolment
} from "./enrolmentSelectors";
import { mapForm } from "../../common/adapters";
import {
  onLoadSuccess,
  saveProgramComplete,
  selectProgramEnrolmentState,
  setFilteredFormElements as setFilteredFormElementsEnrolment,
  setInitialState,
  setState as setProgramEnrolmentState,
  types as enrolmentTypes
} from "../reducers/programEnrolReducer";
import { assign } from "lodash";
import { mapProgramEnrolment } from "../../common/subjectModelMapper";
import { mapProfile } from "common/subjectModelMapper";
import { setSubjectProfile } from "../reducers/subjectDashboardReducer";
import {
  selectChecklists,
  selectDecisions,
  selectVisitSchedules
} from "dataEntryApp/reducers/serverSideRulesReducer";
import commonFormUtil from "dataEntryApp/reducers/commonFormUtil";
import Wizard from "dataEntryApp/state/Wizard";

export function* enrolmentOnLoadWatcher() {
  yield takeLatest(enrolmentTypes.ON_LOAD, setupNewEnrolmentWorker);
}

function* setupNewEnrolmentWorker({
  subjectTypeName,
  programName,
  formType,
  programEnrolmentUuid,
  subjectUuid
}) {
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

  if (formType === "ProgramEnrolment" && programEnrolmentUuid) {
    programEnrolment = yield call(api.fetchProgramEnrolments, programEnrolmentUuid);
    programEnrolment = mapProgramEnrolment(programEnrolment, subject);
    programEnrolment.programExitObservations = [];
    assign(programEnrolment, { program });
  } else if (formType === "ProgramEnrolment") {
    programEnrolment = ProgramEnrolment.createEmptyInstance({ individual: subject, program });
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

  const formMapping = yield select(
    selectEnrolmentFormMappingForSubjectType(subjectTypeName, programName, formType)
  );
  const enrolFormJson = yield call(api.fetchForm, formMapping.formUUID);
  const enrolForm = mapForm(enrolFormJson);

  const {
    formElementGroup,
    filteredFormElements,
    onSummaryPage,
    wizard,
    isFormEmpty
  } = commonFormUtil.onLoad(enrolForm, programEnrolment);
  yield put.resolve(
    onLoadSuccess(
      programEnrolment,
      enrolForm,
      formElementGroup,
      filteredFormElements,
      onSummaryPage,
      wizard,
      isFormEmpty
    )
  );
}

export function* saveProgramEnrolmentWorker(params) {
  try {
    const programEnrolment = yield select(selectProgramEnrolment);
    const visitSchedules = yield select(selectVisitSchedules);
    const decisions = yield select(selectDecisions);
    const checklists = yield select(selectChecklists);
    if (decisions) decisions.exit = params.isExit;

    let resource = programEnrolment.toResource;
    resource.visitSchedules = visitSchedules;
    resource.decisions = decisions;
    resource.checklists = checklists;

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

export function* updateExitEnrolmentObsWorker({ formElement, value }) {
  const state = yield select(selectProgramEnrolmentState);
  const programEnrolment = state.programEnrolment.cloneForEdit();
  const { validationResults, filteredFormElements } = commonFormUtil.updateObservations(
    formElement,
    value,
    programEnrolment,
    new ObservationsHolder(programEnrolment.programExitObservations),
    state.validationResults
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

export function* updateEnrolmentObsWorker({ formElement, value }) {
  const state = yield select(selectProgramEnrolmentState);
  const programEnrolment = state.programEnrolment.cloneForEdit();
  const { validationResults, filteredFormElements } = commonFormUtil.updateObservations(
    formElement,
    value,
    programEnrolment,
    new ObservationsHolder(programEnrolment.observations),
    state.validationResults
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

export function* enrolmentNextWatcher() {
  yield takeLatest(enrolmentTypes.ON_NEXT, enrolmentWizardWorker, commonFormUtil.onNext, true);
}

export function* enrolmentPreviousWatcher() {
  yield takeLatest(
    enrolmentTypes.ON_PREVIOUS,
    enrolmentWizardWorker,
    commonFormUtil.onPrevious,
    false
  );
}

export function* enrolmentWizardWorker(getNextState, isNext) {
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
    const {
      formElementGroup,
      filteredFormElements,
      validationResults,
      observations,
      onSummaryPage,
      wizard
    } = getNextState({
      formElementGroup: state.formElementGroup,
      filteredFormElements: state.filteredFormElements,
      observations: state.programEnrolment.observations,
      entity: state.programEnrolment,
      validationResults: state.validationResults,
      onSummaryPage: state.onSummaryPage,
      wizard: state.wizard.clone()
    });

    const programEnrolment = state.programEnrolment.cloneForEdit();
    programEnrolment.observations = observations;
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
      saveProgramEnrolmentWatcher,
      enrolmentNextWatcher,
      enrolmentPreviousWatcher,
      updateExitEnrolmentObsWatcher,
      undoExitProgramEnrolmentWatcher
    ].map(fork)
  );
}
