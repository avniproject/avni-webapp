import { Individual, ObservationsHolder } from "avni-models";
import {
  setSubject,
  getRegistrationForm,
  setLoaded,
  setRegistrationForm,
  types as subjectTypes,
  saveComplete
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
import {
  selectEnrolmentFormMappingForSubjectType,
  selectEnrolSubjectTypeFromName,
  selectEnrolmentSubject,
  selectProgramUUID
} from "./enrolmentSelectors";
import { mapForm } from "../../common/adapters";
import {
  getEnrolForm,
  setEnrolForm,
  types as enrolSubjectTypes
} from "../reducers/programEnrolReducer";

export function* dataEntrySearchWatcher() {
  yield takeLatest(searchTypes.SEARCH_SUBJECTS, dataEntrySearchWorker);
}

function* dataEntryLoadRegistrationFormWorker({ subjectTypeName }) {
  const formMapping = yield select(selectRegistrationFormMappingForSubjectType(subjectTypeName));
  const registrationForm = yield call(api.fetchForm, formMapping.formUuid);
  yield put(setRegistrationForm(mapForm(registrationForm)));
}

function* dataEntryLoadEnrolFormWorker({ subjectTypeName, programName }) {
  const formMapping = yield select(
    selectEnrolmentFormMappingForSubjectType(subjectTypeName, programName)
  );
  const enrolForm = yield call(api.fetchForm, formMapping.formUUID);
  yield put(setEnrolForm(mapForm(enrolForm)));
}

function* dataEntrySearchWorker() {
  const params = yield select(state => state.dataEntry.search.subjectSearchParams);
  const subjects = yield call(SubjectService.search, params);
  yield put(setSubjects(subjects));
}

export function* dataEntryLoadRegistrationFormWatcher() {
  yield takeLatest(subjectTypes.GET_REGISTRATION_FORM, dataEntryLoadRegistrationFormWorker);
}

export function* dataEntryLoadEnrolFormWatcher() {
  yield takeLatest(enrolSubjectTypes.GET_ENROL_FORM, dataEntryLoadEnrolFormWorker);
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
  const observationHolder = new ObservationsHolder(subject.observations);
  observationHolder.updateObs(formElement, value);
  subject.observations = observationHolder.observations;
  yield put(setSubject(subject));
}

export default function* subjectSaga() {
  yield all(
    [
      dataEntrySearchWatcher,
      dataEntryLoadRegistrationFormWatcher,
      dataEntryLoadEnrolFormWatcher,
      saveSubjectWatcher,
      loadRegistrationPageWatcher,
      updateObsWatcher
    ].map(fork)
  );
}
