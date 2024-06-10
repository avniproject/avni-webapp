import { Individual, ObservationsHolder, StaticFormElementGroup } from "avni-models";
import {
  onLoadSuccess,
  saveComplete,
  selectAddressLevelType,
  selectIdentifierAssignments,
  selectRegistrationState,
  setRegistrationForm,
  setState as setRegistrationState,
  types as subjectTypes
} from "../reducers/registrationReducer";
import SubjectSearchService from "../services/SubjectSearchService";
import { setSubjects, types as searchTypes } from "../reducers/searchReducer";
import { all, call, fork, put, select, takeEvery, takeLatest } from "redux-saga/effects";
import api from "../api";
import { getGenders } from "../reducers/metadataReducer";
import {
  selectRegistrationFormMappingForSubjectType,
  selectRegistrationProfilePictureFile,
  selectRegistrationRemoveProfilePicture,
  selectRegistrationSubject,
  selectSubjectTypeFromName
} from "./selectors";
import { mapForm } from "../../common/adapters";
import { setLoad } from "../reducers/loadReducer";
import { find, isNil, sortBy, keys } from "lodash";
import { mapProfile } from "common/subjectModelMapper";
import { selectDecisions, selectVisitSchedules } from "dataEntryApp/reducers/serverSideRulesReducer";
import commonFormUtil from "dataEntryApp/reducers/commonFormUtil";
import Wizard from "dataEntryApp/state/Wizard";
import { filterFormElements } from "dataEntryApp/services/FormElementService";
import { selectRegistrationForm, setFilteredFormElements, setInitialSubjectState } from "dataEntryApp/reducers/registrationReducer";
import identifierAssignmentService from "dataEntryApp/services/IdentifierAssignmentService";
import { bucketName, uploadImage } from "../../common/utils/S3Client";

export function* dataEntryLoadRegistrationFormWatcher() {
  yield takeLatest(subjectTypes.GET_REGISTRATION_FORM, dataEntryLoadRegistrationFormWorker);
}

function* dataEntryLoadRegistrationFormWorker({ subjectTypeName }) {
  const formMapping = yield select(selectRegistrationFormMappingForSubjectType(subjectTypeName));
  const registrationForm = yield call(api.fetchForm, formMapping.formUUID);
  yield put(setRegistrationForm(mapForm(registrationForm)));
}

export function* dataEntrySearchWatcher() {
  yield takeLatest(searchTypes.SEARCH_SUBJECTS, dataEntrySearchWorker);
}

function* dataEntrySearchWorker({ params }) {
  yield put.resolve(setLoad(false));
  const subjects = yield call(SubjectSearchService.search, params);
  yield put(setSubjects(subjects));
  yield put.resolve(setLoad(true));
}

export function* saveSubjectWatcher() {
  yield takeLatest(subjectTypes.SAVE_SUBJECT, saveSubjectWorker);
}

export function* saveSubjectWorker() {
  const subject = yield select(selectRegistrationSubject);
  const visitSchedules = yield select(selectVisitSchedules);
  const decisions = yield select(selectDecisions);
  const registrationForm = yield select(selectRegistrationForm);
  const identifierAssignments = yield select(selectIdentifierAssignments);
  const profilePictureFile = yield select(selectRegistrationProfilePictureFile);
  const removeProfilePicFile = yield select(selectRegistrationRemoveProfilePicture);
  const [profilePicKey] = yield call(uploadImage, subject.profilePicture, profilePictureFile, bucketName.PROFILE_PICS);
  subject.profilePicture = removeProfilePicFile ? null : profilePicKey;
  let resource = subject.toResource;
  resource.visitSchedules = visitSchedules;
  resource.decisions = decisions;
  resource.identifierAssignmentUuids = identifierAssignmentService.getIdentifierAssignmentUuids(
    registrationForm,
    subject.observations,
    identifierAssignments
  );

  yield call(api.saveSubject, resource);
  yield put(saveComplete());
}

function* loadNewRegistrationPageWatcher() {
  yield takeLatest(subjectTypes.ON_LOAD, loadNewRegistrationPageWorker);
}

export function* loadNewRegistrationPageWorker({ subjectTypeName }) {
  yield put.resolve(setInitialSubjectState());
  yield put.resolve(setFilteredFormElements());

  const subjectType = yield select(selectSubjectTypeFromName(subjectTypeName));
  if (subjectType.isPerson()) {
    yield put.resolve(getGenders());
  }
  let subject = Individual.createEmptySubjectInstance();
  subject.subjectType = subjectType;

  const formMapping = yield select(selectRegistrationFormMappingForSubjectType(subjectTypeName));
  const registrationFormJson = yield call(api.fetchForm, formMapping.formUUID);
  const registrationForm = mapForm(registrationFormJson);

  const identifierAssignments = yield call(api.fetchIdentifierAssignments, formMapping.formUUID);
  identifierAssignmentService.addIdentifiersToObservations(registrationForm, subject.observations, identifierAssignments);
  yield setRegistrationOnLoadState(registrationForm, subject, identifierAssignments);
}

function* loadEditRegistrationPageWatcher() {
  yield takeLatest(subjectTypes.ON_LOAD_EDIT, loadEditRegistrationPageWorker);
}

export function* loadEditRegistrationPageWorker({ subjectUuid }) {
  yield put.resolve(setInitialSubjectState());
  yield put.resolve(setFilteredFormElements());

  const subjectProfileJson = yield call(api.fetchSubjectProfile, subjectUuid);
  const subject = mapProfile(subjectProfileJson);
  const selectedAddressLevelType = subjectProfileJson.addressLevelTypeName
    ? { name: subjectProfileJson.addressLevelTypeName, id: subjectProfileJson.addressLevelTypeId }
    : { id: -1, name: "" };
  yield put(selectAddressLevelType(selectedAddressLevelType));

  const formMapping = yield select(selectRegistrationFormMappingForSubjectType(subject.subjectType.name));
  const registrationFormJson = yield call(api.fetchForm, formMapping.formUUID);
  const registrationForm = mapForm(registrationFormJson);

  if (subject.subjectType.isPerson()) {
    yield put.resolve(getGenders());
  }
  yield setRegistrationOnLoadState(registrationForm, subject, []);
}

export function* setRegistrationOnLoadState(registrationForm, subject, identifierAssignments) {
  if (subject.subjectType.isPerson()) {
    const formElementGroup = new StaticFormElementGroup(registrationForm);
    const wizard = new Wizard(isNil(registrationForm) ? 1 : registrationForm.numberOfPages + 1, 2);
    const filteredFormElements = [];
    const onSummaryPage = false;
    const firstGroupWithAtLeastOneVisibleElement = find(
      sortBy(registrationForm.nonVoidedFormElementGroups(), "displayOrder"),
      formElementGroup => filterFormElements(formElementGroup, subject).length !== 0
    );
    const isFormEmpty = isNil(firstGroupWithAtLeastOneVisibleElement);

    yield put.resolve(
      onLoadSuccess(
        subject,
        registrationForm,
        formElementGroup,
        filteredFormElements,
        onSummaryPage,
        wizard,
        isFormEmpty,
        identifierAssignments
      )
    );
  } else {
    const { formElementGroup, filteredFormElements, onSummaryPage, wizard, isFormEmpty } = commonFormUtil.onLoad(
      registrationForm,
      subject,
      true,
      true
    );

    yield put.resolve(
      onLoadSuccess(
        subject,
        registrationForm,
        formElementGroup,
        filteredFormElements,
        onSummaryPage,
        wizard,
        isFormEmpty,
        identifierAssignments
      )
    );
  }
}

function* updateObsWatcher() {
  yield takeEvery(subjectTypes.UPDATE_OBS, updateObsWorker);
}

export function* updateObsWorker({ formElement, value, childFormElement, questionGroupIndex }) {
  const state = yield select(selectRegistrationState);
  const subject = state.subject.cloneForEdit();
  const { validationResults, filteredFormElements } = commonFormUtil.updateObservations(
    formElement,
    value,
    subject,
    new ObservationsHolder(subject.observations),
    state.validationResults,
    childFormElement,
    questionGroupIndex
  );
  yield put(
    setRegistrationState({
      ...state,
      filteredFormElements,
      subject,
      validationResults
    })
  );
}

function* addNewQuestionGroupWatcher() {
  yield takeEvery(subjectTypes.ADD_NEW_QG, addNewQuestionGroupWorker);
}
export function* addNewQuestionGroupWorker({ formElement }) {
  const state = yield select(selectRegistrationState);
  const subject = state.subject.cloneForEdit();
  const { filteredFormElements } = commonFormUtil.addNewQuestionGroup(subject, formElement, subject.observations);
  yield put(
    setRegistrationState({
      ...state,
      subject,
      filteredFormElements
    })
  );
}

function* removeQuestionGroupWatcher() {
  yield takeEvery(subjectTypes.REMOVE_QG, removeQuestionGroupWorker);
}
export function* removeQuestionGroupWorker({ formElement, questionGroupIndex }) {
  const state = yield select(selectRegistrationState);
  const subject = state.subject.cloneForEdit();
  const { filteredFormElements } = commonFormUtil.removeQuestionGroup(subject, formElement, subject.observations, questionGroupIndex);
  yield put(
    setRegistrationState({
      ...state,
      subject,
      filteredFormElements
    })
  );
}

export function* registrationNextWatcher() {
  yield takeLatest(subjectTypes.ON_NEXT, registrationWizardWorkerNext);
}

export function* registrationWizardWorkerNext() {
  const state = yield select(selectRegistrationState);
  const subject = state.subject.cloneForEdit();

  const { formElementGroup, filteredFormElements, validationResults, observations, onSummaryPage, wizard } = commonFormUtil.onNext({
    formElementGroup: state.formElementGroup,
    filteredFormElements: state.filteredFormElements,
    observations: subject.observations,
    entity: subject,
    validationResults: state.validationResults,
    onSummaryPage: state.onSummaryPage,
    wizard: state.wizard.clone(),
    entityValidations: subject.validate(),
    staticFormElementIds: state.wizard.isFirstPage() ? keys(Individual.validationKeys) : []
  });

  subject.observations = observations;
  const nextState = {
    ...state,
    subject,
    formElementGroup,
    filteredFormElements,
    validationResults,
    onSummaryPage,
    wizard
  };
  yield put(setRegistrationState(nextState));
}

export function* registrationPreviousWatcher() {
  yield takeLatest(subjectTypes.ON_PREVIOUS, registrationWizardWorkerPrev);
}

export function* registrationWizardWorkerPrev() {
  const state = yield select(selectRegistrationState);
  const subject = state.subject.cloneForEdit();

  const previousGroup = state.formElementGroup.previous();

  //The previousGroup is going to be null only when we are going to the static page for the person subject type.
  //In that case we need to set formElementGroup as static FEG and filteredFormElements as empty.
  const shouldGoToStaticPageForPersonSubjectType = isNil(previousGroup) && subject.subjectType.isPerson() && !state.onSummaryPage;
  if (shouldGoToStaticPageForPersonSubjectType) {
    const wizard = state.wizard.clone();
    wizard.movePrevious();
    const nextState = {
      ...state,
      formElementGroup: new StaticFormElementGroup(state.registrationForm),
      filteredFormElements: [],
      wizard
    };
    yield put(setRegistrationState(nextState));
  } else {
    const { formElementGroup, filteredFormElements, validationResults, observations, onSummaryPage, wizard } = commonFormUtil.onPrevious({
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
      formElementGroup: formElementGroup,
      filteredFormElements,
      validationResults,
      onSummaryPage,
      wizard
    };
    yield put(setRegistrationState(nextState));
  }
}

export default function* subjectSaga() {
  yield all(
    [
      dataEntrySearchWatcher,
      dataEntryLoadRegistrationFormWatcher,
      loadNewRegistrationPageWatcher,
      loadEditRegistrationPageWatcher,
      updateObsWatcher,
      addNewQuestionGroupWatcher,
      removeQuestionGroupWatcher,
      registrationNextWatcher,
      registrationPreviousWatcher,
      saveSubjectWatcher
    ].map(fork)
  );
}
