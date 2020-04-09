import { Individual, ObservationsHolder, Concept } from "avni-models";
import {
  setSubject,
  getRegistrationForm,
  setLoaded,
  setRegistrationForm,
  types as subjectTypes,
  saveComplete,
  setValidationResults
} from "../reducers/registrationReducer";
import SubjectService from "../services/SubjectService";
import { setSubjects, types as searchTypes } from "../reducers/searchReducer";
import { all, call, fork, takeEvery, put, select, takeLatest } from "redux-saga/effects";
import api from "../api";
import { getGenders, getOperationalModules } from "../reducers/metadataReducer";
import {
  selectRegistrationFormMappingForSubjectType,
  selectSubjectTypeFromName,
  selectRegistrationSubject
} from "./selectors";
import { mapForm } from "../../common/adapters";
import _, { isEmpty } from "lodash";

export function* dataEntrySearchWatcher() {
  yield takeLatest(searchTypes.SEARCH_SUBJECTS, dataEntrySearchWorker);
}

function* dataEntryLoadRegistrationFormWorker({ subjectTypeName }) {
  const formMapping = yield select(selectRegistrationFormMappingForSubjectType(subjectTypeName));
  const registrationForm = yield call(api.fetchForm, formMapping.formUUID);
  yield put(setRegistrationForm(mapForm(registrationForm)));
}

function* dataEntrySearchWorker() {
  const params = yield select(state => state.dataEntry.search.subjectSearchParams);
  const subjects = yield call(SubjectService.search, params);
  yield put(setSubjects(subjects));
}

export function* dataEntryLoadRegistrationFormWatcher() {
  yield takeLatest(subjectTypes.GET_REGISTRATION_FORM, dataEntryLoadRegistrationFormWorker);
}

export function* saveSubjectWorker() {
  const subject = yield select(selectRegistrationSubject);
  let resource = subject.toResource;
  yield call(api.saveSubject, resource);
  yield put(saveComplete());
}

export function* saveSubjectWatcher() {
  yield takeLatest(subjectTypes.SAVE_SUBJECT, saveSubjectWorker);
}

function* loadRegistrationPageWatcher() {
  yield takeLatest(subjectTypes.ON_LOAD, loadRegistrationPageWorker);
}

export function* loadRegistrationPageWorker({ subjectTypeName }) {
  yield put.resolve(getOperationalModules());
  yield put.resolve(getRegistrationForm(subjectTypeName));
  yield put.resolve(getGenders());

  const subjectType = yield select(selectSubjectTypeFromName(subjectTypeName));

  let subject = Individual.createEmptyInstance();
  subject.subjectType = subjectType;
  yield put.resolve(setSubject(subject));
  yield put.resolve(setLoaded());
}

function* updateObsWatcher() {
  yield takeEvery(subjectTypes.UPDATE_OBS, updateObsWorker);
}

export function* updateObsWorker({ formElement, value }) {
  const subject = yield select(state => state.dataEntry.registration.subject);
  const validationResults = yield select(state => state.dataEntry.registration.validationResults);
  const validationResult = formElement.validate(value);
  const observationHolder = new ObservationsHolder(subject.observations);
  // observationHolder.updateObs(formElement, value);
  // observationHolder.observations.map((concept)=>{
  //   console.log(concept);

  if (formElement.concept.datatype === Concept.dataType.Coded && formElement.isMultiSelect()) {
    observationHolder.toggleMultiSelectAnswer(formElement.concept, value);
  } else if (
    formElement.concept.datatype === Concept.dataType.Coded &&
    formElement.isSingleSelect()
  ) {
    observationHolder.toggleSingleSelectAnswer(formElement.concept, value);
  } else {
    observationHolder.addOrUpdatePrimitiveObs(formElement.concept, value);
  }
  // })

  subject.observations = observationHolder.observations;
  yield put(setSubject(subject));

  _.remove(
    validationResults,
    existingValidationResult =>
      existingValidationResult.formIdentifier === validationResult.formIdentifier
  );
  validationResults.push(validationResult);

  yield put(setValidationResults(validationResults));
  sessionStorage.setItem("subject", JSON.stringify(subject));
}

export default function* subjectSaga() {
  yield all(
    [
      dataEntrySearchWatcher,
      dataEntryLoadRegistrationFormWatcher,
      saveSubjectWatcher,
      loadRegistrationPageWatcher,
      updateObsWatcher
    ].map(fork)
  );
}
