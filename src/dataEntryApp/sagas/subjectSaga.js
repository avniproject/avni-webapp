import { FormElementGroup, Individual, ObservationsHolder, ProgramEnrolment } from "avni-models";
import {
  saveComplete,
  selectAddressLevelType,
  setRegistrationForm,
  setSubject,
  setValidationResults as setValidationResultsRegistration,
  setInitialSubjectState,
  onLoadSuccess,
  types as subjectTypes,
  selectRegistrationState,
  setState as setRegistrationState,
  setFilteredFormElements as setFilteredFormElementsRegistration
} from "../reducers/registrationReducer";
import SubjectSearchService from "../services/SubjectSearchService";
import { setSubjects, types as searchTypes } from "../reducers/searchReducer";
import { all, call, fork, put, select, takeEvery, takeLatest } from "redux-saga/effects";
import api from "../api";
import { getGenders, getOperationalModules } from "../reducers/metadataReducer";
import {
  selectRegistrationFormMappingForSubjectType,
  selectRegistrationSubject,
  selectSubjectTypeFromName
} from "./selectors";
import {
  selectEnrolmentFormMappingForSubjectType,
  selectProgramEnrolment,
  selectProgram
} from "./enrolmentSelectors";
import { mapForm } from "../../common/adapters";
import {
  saveProgramComplete,
  setInitialState,
  setProgramEnrolment,
  onLoadSuccess as enrolmentOnLoadSuccess,
  types as enrolmentTypes,
  selectProgramEnrolmentState,
  setState as setProgramEnrolmentState,
  setFilteredFormElements as setFilteredFormElementsEnrolment,
  setValidationResults as setValidationResultsEnrolment
} from "../reducers/programEnrolReducer";
import { setLoad } from "../reducers/loadReducer";
import _ from "lodash";
import { mapProgramEnrolment } from "../../common/subjectModelMapper";
import { mapProfile } from "common/subjectModelMapper";
import { setSubjectProfile } from "../reducers/subjectDashboardReducer";
import formElementService, { getFormElementStatuses } from "../services/FormElementService";
import {
  selectDecisions,
  selectVisitSchedules,
  selectChecklists
} from "dataEntryApp/reducers/serverSideRulesReducer";
import commonFormUtil from "dataEntryApp/reducers/commonFormUtil";
import Wizard from "dataEntryApp/state/Wizard";

//TODO: Lots of updateObs functions looks the same. See if it's possible to remove duplication.

function* dataEntryLoadRegistrationFormWorker({ subjectTypeName }) {
  const formMapping = yield select(selectRegistrationFormMappingForSubjectType(subjectTypeName));
  const registrationForm = yield call(api.fetchForm, formMapping.formUUID);
  yield put(setRegistrationForm(mapForm(registrationForm)));
}

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
    _.assign(programEnrolment, { program });
  } else if (formType === "ProgramEnrolment") {
    programEnrolment = ProgramEnrolment.createEmptyInstance({ individual: subject, program });
  } else if (formType === "ProgramExit" && programEnrolmentUuid) {
    programEnrolment = yield call(api.fetchProgramEnrolments, programEnrolmentUuid);
    programEnrolment = mapProgramEnrolment(programEnrolment, subject);
    programEnrolment.programExitDateTime = new Date();
    if (!programEnrolment.programExitObservations) {
      programEnrolment.programExitObservations = [];
    }
    _.assign(programEnrolment, { program });
  } else {
    programEnrolment = yield call(api.fetchProgramEnrolments, programEnrolmentUuid);
    programEnrolment = mapProgramEnrolment(programEnrolment, subject);
    programEnrolment.programExitObservations = [];
    programEnrolment.programExitDateTime = new Date();
    _.assign(programEnrolment, { program });
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
    enrolmentOnLoadSuccess(
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

export function* dataEntrySearchWatcher() {
  yield takeLatest(searchTypes.SEARCH_SUBJECTS, dataEntrySearchWorker);
}

function* dataEntrySearchWorker({ params }) {
  // const params = yield select(state => state.dataEntry.search.subjectSearchParams);
  yield put.resolve(setLoad(false));
  const subjects = yield call(SubjectSearchService.search, params);
  yield put(setSubjects(subjects));
  yield put.resolve(setLoad(true));
}

export function* dataEntryLoadRegistrationFormWatcher() {
  yield takeLatest(subjectTypes.GET_REGISTRATION_FORM, dataEntryLoadRegistrationFormWorker);
}

export function* saveSubjectWorker() {
  const subject = yield select(selectRegistrationSubject);
  const visitSchedules = yield select(selectVisitSchedules);
  const decisions = yield select(selectDecisions);

  let resource = subject.toResource;
  resource.visitSchedules = visitSchedules;
  resource.decisions = decisions;

  yield call(api.saveSubject, resource);
  yield put(saveComplete());
}

export function* saveSubjectWatcher() {
  yield takeLatest(subjectTypes.SAVE_SUBJECT, saveSubjectWorker);
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

function* loadRegistrationPageWatcher() {
  yield takeLatest(subjectTypes.ON_LOAD, loadRegistrationPageWorker);
}

export function* loadRegistrationPageWorker({ subjectTypeName }) {
  yield put.resolve(setInitialSubjectState());
  yield put.resolve(setFilteredFormElementsRegistration());
  yield put.resolve(getOperationalModules());

  const subjectType = yield select(selectSubjectTypeFromName(subjectTypeName));
  if (subjectType.isPerson()) {
    yield put.resolve(getGenders());
  }
  let subject = Individual.createEmptySubjectInstance();
  subject.subjectType = subjectType;

  const formMapping = yield select(selectRegistrationFormMappingForSubjectType(subjectTypeName));
  const registrationFormJson = yield call(api.fetchForm, formMapping.formUUID);
  const registrationForm = mapForm(registrationFormJson);
  yield put(setRegistrationForm(registrationForm));

  const {
    formElementGroup,
    filteredFormElements,
    onSummaryPage,
    wizard,
    isFormEmpty
  } = commonFormUtil.onLoad(registrationForm, subject);

  yield put.resolve(
    onLoadSuccess(
      subject,
      registrationForm,
      formElementGroup,
      filteredFormElements,
      onSummaryPage,
      wizard,
      isFormEmpty
    )
  );
}

function* loadEditRegistrationPageWatcher() {
  yield takeLatest(subjectTypes.ON_LOAD_EDIT, loadEditRegistrationPageWorker);
}

export function* loadEditRegistrationPageWorker({ subjectUuid }) {
  const subjectProfileJson = yield call(api.fetchSubjectProfile, subjectUuid);
  const subject = mapProfile(subjectProfileJson);
  yield put.resolve(setFilteredFormElementsRegistration());
  const selectedAddressLevelType = {
    name: subjectProfileJson.addressLevelTypeName,
    id: subjectProfileJson.addressLevelTypeId
  };
  yield put(selectAddressLevelType(selectedAddressLevelType));

  const formMapping = yield select(
    selectRegistrationFormMappingForSubjectType(subject.subjectType.name)
  );
  const registrationFormJson = yield call(api.fetchForm, formMapping.formUUID);
  const registrationForm = mapForm(registrationFormJson);

  const subjectType = yield select(selectSubjectTypeFromName(subject.subjectType.name));
  if (subjectType.isPerson()) {
    yield put.resolve(getGenders());
  }

  const {
    formElementGroup,
    filteredFormElements,
    onSummaryPage,
    wizard,
    isFormEmpty
  } = commonFormUtil.onLoad(registrationForm, subject);

  yield put.resolve(
    onLoadSuccess(
      subject,
      registrationForm,
      formElementGroup,
      filteredFormElements,
      onSummaryPage,
      wizard,
      isFormEmpty
    )
  );
}

function* updateObsWatcher() {
  yield takeEvery(subjectTypes.UPDATE_OBS, updateObsWorker);
}

export function* updateObsWorker({ formElement, value }) {
  yield put.resolve(setFilteredFormElementsRegistration());
  const subject = yield select(state => state.dataEntry.registration.subject);
  const validationResults = yield select(state => state.dataEntry.registration.validationResults);
  const observations = formElementService.updateObservations(
    subject.observations,
    formElement,
    value
  );
  const observationsHolder = new ObservationsHolder(observations);
  const formElementStatuses = getFormElementStatuses(
    subject,
    formElement.formElementGroup,
    observationsHolder
  );
  const filteredFormElements = FormElementGroup._sortedFormElements(
    formElement.formElementGroup.filterElements(formElementStatuses)
  );
  yield put(setFilteredFormElementsRegistration(filteredFormElements));
  observationsHolder.updatePrimitiveObs(filteredFormElements, formElementStatuses);
  subject.observations = observationsHolder.observations;

  yield put(setSubject(subject));
  yield put(
    setValidationResultsRegistration(
      formElementService.validate(
        formElement,
        value,
        subject.observations,
        validationResults,
        formElementStatuses
      )
    )
  );
}

function* updateEnrolmentObsWatcher() {
  yield takeEvery(enrolmentTypes.UPDATE_OBS, updateEnrolmentObsWorker);
}

function* updateExitEnrolmentObsWatcher() {
  yield takeEvery(enrolmentTypes.UPDATE_EXIT_OBS, updateExitEnrolmentObsWorker);
}

export function* updateExitEnrolmentObsWorker({ formElement, value }) {
  const state = yield select();
  const programEnrolment = state.dataEntry.enrolmentReducer.programEnrolment;
  const validationResults = yield select(
    state => state.dataEntry.enrolmentReducer.validationResults
  );

  const programExitObservations = formElementService.updateObservations(
    programEnrolment.programExitObservations,
    formElement,
    value
  );
  const observationsHolder = new ObservationsHolder(programExitObservations);
  const formElementStatuses = getFormElementStatuses(
    programEnrolment,
    formElement.formElementGroup,
    observationsHolder
  );
  const filteredFormElements = FormElementGroup._sortedFormElements(
    formElement.formElementGroup.filterElements(formElementStatuses)
  );
  yield put(setFilteredFormElementsEnrolment(filteredFormElements));
  observationsHolder.updatePrimitiveObs(filteredFormElements, formElementStatuses);
  programEnrolment.programExitObservations = observationsHolder.observations;

  yield put(setProgramEnrolment(programEnrolment));
  yield put(
    setValidationResultsEnrolment(
      formElementService.validate(
        formElement,
        value,
        programEnrolment.programExitObservations,
        validationResults,
        formElementStatuses
      )
    )
  );
}

export function* updateEnrolmentObsWorker({ formElement, value }) {
  const state = yield select();
  const programEnrolment = state.dataEntry.enrolmentReducer.programEnrolment;
  const validationResults = yield select(
    state => state.dataEntry.enrolmentReducer.validationResults
  );

  const observations = formElementService.updateObservations(
    programEnrolment.observations,
    formElement,
    value
  );
  const observationsHolder = new ObservationsHolder(observations);
  const formElementStatuses = getFormElementStatuses(
    programEnrolment,
    formElement.formElementGroup,
    observationsHolder
  );
  const filteredFormElements = FormElementGroup._sortedFormElements(
    formElement.formElementGroup.filterElements(formElementStatuses)
  );
  yield put(setFilteredFormElementsEnrolment(filteredFormElements));
  observationsHolder.updatePrimitiveObs(filteredFormElements, formElementStatuses);
  programEnrolment.observations = observationsHolder.observations;

  yield put(setProgramEnrolment(programEnrolment));
  yield put(
    setValidationResultsEnrolment(
      formElementService.validate(
        formElement,
        value,
        programEnrolment.observations,
        validationResults,
        formElementStatuses
      )
    )
  );
}

export function* registrationStaticPageNextWatcher() {
  yield takeLatest(subjectTypes.STATIC_PAGE_ON_NEXT, registrationStaticPageNextWorker);
}

export function* registrationStaticPageNextWorker() {
  const state = yield select(selectRegistrationState);
  if (state.isFormEmpty) {
    yield put(
      setRegistrationState({
        ...state,
        renderStaticPage: false,
        onSummaryPage: true,
        wizard: new Wizard(1, 1, 2)
      })
    );
  } else {
    yield put(setRegistrationState({ ...state, renderStaticPage: false }));
  }
}

export function* registrationNextWatcher() {
  yield takeLatest(subjectTypes.ON_NEXT, registrationWizardWorker, commonFormUtil.onNext);
}

export function* registrationPreviousWatcher() {
  yield takeLatest(subjectTypes.ON_PREVIOUS, registrationWizardWorker, commonFormUtil.onPrevious);
}

export function* registrationWizardWorker(getNextState) {
  const state = yield select(selectRegistrationState);
  const subject = state.subject.cloneForEdit();

  const {
    formElementGroup,
    filteredFormElements,
    validationResults,
    observations,
    onSummaryPage,
    renderStaticPage,
    wizard
  } = getNextState({
    formElementGroup: state.formElementGroup,
    filteredFormElements: state.filteredFormElements,
    observations: subject.observations,
    entity: subject,
    validationResults: state.validationResults,
    onSummaryPage: state.onSummaryPage,
    wizard: state.wizard.clone()
  });

  subject.observations = observations;
  const nextState = {
    ...state,
    subject,
    formElementGroup,
    filteredFormElements,
    validationResults,
    onSummaryPage,
    renderStaticPage,
    wizard
  };
  yield put(setRegistrationState(nextState));
}

export function* resetStateWorker() {
  yield takeLatest(subjectTypes.ON_RESET, resetStateWatcher);
}

export function* resetStateWatcher() {
  const registrationState = yield select(selectRegistrationState);

  const {
    formElementGroup,
    filteredFormElements,
    onSummaryPage,
    wizard,
    isFormEmpty
  } = commonFormUtil.onLoad(registrationState.registrationForm, registrationState.subject);

  yield put.resolve(
    onLoadSuccess(
      registrationState.subject,
      registrationState.registrationForm,
      formElementGroup,
      filteredFormElements,
      onSummaryPage,
      wizard,
      isFormEmpty
    )
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

export default function* subjectSaga() {
  yield all(
    [
      dataEntrySearchWatcher,
      dataEntryLoadRegistrationFormWatcher,
      enrolmentOnLoadWatcher,
      saveSubjectWatcher,
      loadRegistrationPageWatcher,
      saveProgramEnrolmentWatcher,
      updateObsWatcher,
      updateEnrolmentObsWatcher,
      loadEditRegistrationPageWatcher,
      updateExitEnrolmentObsWatcher,
      undoExitProgramEnrolmentWatcher,
      registrationNextWatcher,
      enrolmentNextWatcher,
      registrationPreviousWatcher,
      enrolmentPreviousWatcher,
      resetStateWorker,
      registrationStaticPageNextWatcher
    ].map(fork)
  );
}
