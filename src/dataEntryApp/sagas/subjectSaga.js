import {
  Individual,
  ObservationsHolder,
  Concept,
  ProgramEnrolment,
  SubjectType
} from "avni-models";
import {
  setSubject,
  getRegistrationForm,
  setLoaded,
  setRegistrationForm,
  types as subjectTypes,
  saveComplete,
  setValidationResults,
  selectAddressLevelType
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
  selectProgram,
  selectEnrolmentSubject
} from "./enrolmentSelectors";
import { mapForm } from "../../common/adapters";
import {
  onLoad,
  setEnrolForm,
  setProgramEnrolment,
  saveProgramComplete,
  getProgramEnrolment,
  types as enrolmentTypes
} from "../reducers/programEnrolReducer";
import _ from "lodash";
import BrowserStore from "../api/browserStore";
import { disableSession } from "../../common/constants";
import { mapProgramEnrolment } from "../../common/subjectModelMapper";
import { mapProfile } from "common/subjectModelMapper";

export function* dataEntrySearchWatcher() {
  yield takeLatest(searchTypes.SEARCH_SUBJECTS, dataEntrySearchWorker);
}

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
  programEnrolmentUuid
}) {
  const formMapping = yield select(
    selectEnrolmentFormMappingForSubjectType(subjectTypeName, programName, formType)
  );
  const enrolForm = yield call(api.fetchForm, formMapping.formUUID);
  yield put(setEnrolForm(mapForm(enrolForm)));
  const program = yield select(selectProgram(programName));
  const state = yield select();
  const subject = state.dataEntry.subjectProfile.subjectProfile;
  subject.subjectType = SubjectType.create("Individual");

  if (formType == "ProgramEnrolment" && programEnrolmentUuid) {
    let programEnrolment = yield call(api.fetchProgramEnrolments, programEnrolmentUuid);
    programEnrolment = mapProgramEnrolment(programEnrolment);
    programEnrolment.individual = subject;
    programEnrolment.programExitObservations = [];
    yield put.resolve(setProgramEnrolment(programEnrolment));
  } else if (formType == "ProgramEnrolment") {
    let programEnrolment = ProgramEnrolment.createEmptyInstance({ individual: subject, program });
    yield put.resolve(setProgramEnrolment(programEnrolment));
  } else if (formType == "ProgramExit" && programEnrolmentUuid) {
    let programEnrolment = yield call(api.fetchProgramEnrolments, programEnrolmentUuid);
    programEnrolment = mapProgramEnrolment(programEnrolment);
    programEnrolment.individual = subject;

    if (!programEnrolment.programExitObservations) {
      programEnrolment.programExitObservations = [];
      programEnrolment.programExitDateTime = new Date();
    }

    yield put.resolve(setProgramEnrolment(programEnrolment));
  } else {
    let programEnrolment = yield call(api.fetchProgramEnrolments, programEnrolmentUuid);
    programEnrolment = mapProgramEnrolment(programEnrolment);
    programEnrolment.programExitObservations = [];
    programEnrolment.programExitDateTime = new Date();
    programEnrolment.individual = subject;
    yield put.resolve(setProgramEnrolment(programEnrolment));
  }
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

export function* saveProgramEnrolmentWorker() {
  const programEnrolment = yield select(selectEnrolmentSubject);
  let resource = programEnrolment.toResource;

  yield call(api.saveProgram, resource);
  yield put(saveProgramComplete());
}

export function* saveProgramEnrolmentWatcher() {
  yield takeLatest(enrolmentTypes.SAVE_PROGRAM_ENROLMENT, saveProgramEnrolmentWorker);
}

export function* undoExitProgramEnrolmentWorker({ programEnrolmentUuid }) {
  let programEnrolment = yield call(api.fetchProgramEnrolments, programEnrolmentUuid);
  programEnrolment = mapProgramEnrolment(programEnrolment);
  programEnrolment.programExitDateTime = undefined;
  programEnrolment.programExitObservations = [];

  const state = yield select();
  const subject = state.dataEntry.subjectProfile.subjectProfile;
  subject.subjectType = SubjectType.create("Individual");

  programEnrolment.individual = subject;

  let resource = programEnrolment.toResource;
  yield call(api.saveProgram, resource);
  yield put(saveProgramComplete());
}

export function* undoExitProgramEnrolmentWatcher() {
  yield takeLatest(enrolmentTypes.UNDO_EXIT_ENROLMENT, undoExitProgramEnrolmentWorker);
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

function validate(formElement, value, observations, validationResults) {
  let isNullForMultiselect = false;
  if (formElement.concept.datatype === Concept.dataType.Coded && formElement.isMultiSelect()) {
    const observationHolder = new ObservationsHolder(observations);
    const answers =
      observationHolder.findObservation(formElement.concept) &&
      observationHolder.findObservation(formElement.concept).getValue();

    isNullForMultiselect = _.isNil(answers);
  }

  const validationResult = formElement.validate(isNullForMultiselect ? null : value);

  _.remove(
    validationResults,
    existingValidationResult =>
      existingValidationResult.formIdentifier === validationResult.formIdentifier
  );

  validationResults.push(validationResult);
  return validationResults;
}

function* loadEditRegistrationPageWatcher() {
  yield takeLatest(subjectTypes.ON_LOAD_EDIT, loadEditRegistrationPageWorker);
}

export function* loadEditRegistrationPageWorker({ subjectUuid }) {
  const subjectProfileJson = yield call(api.fetchSubjectProfile, subjectUuid);
  const subject = mapProfile(subjectProfileJson);
  const selectedAddressLevelType = {
    name: subjectProfileJson.addressLevelTypeName,
    id: subjectProfileJson.addressLevelTypeId
  };
  yield put(selectAddressLevelType(selectedAddressLevelType));

  yield put.resolve(getOperationalModules());
  yield put.resolve(getRegistrationForm(subject.subjectType.name));
  yield put.resolve(getGenders());

  if (disableSession) {
    yield put.resolve(setSubject(subject));
    yield put.resolve(setLoaded());
  } else {
    let subjectFromSession = BrowserStore.fetchSubject();
    if (subjectFromSession) {
      yield put.resolve(setSubject(subjectFromSession));
      yield put.resolve(setLoaded());
    } else {
      yield put.resolve(setSubject(subject));
      yield put.resolve(setLoaded());
    }
  }
}

/*
Takes observations and returns updated observations. It do not modify the passed parameters.
 */
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
    !_.isNil(formElement.durationOptions)
  ) {
    observationHolder.updateCompositeDurationValue(formElement.concept, value);
  } else if (
    formElement.concept.datatype === Concept.dataType.Date &&
    !_.isNil(formElement.durationOptions)
  ) {
    //  addOrUpdatePrimitiveObs
    observationHolder.addOrUpdatePrimitiveObs(formElement.concept, value);
  } else {
    observationHolder.addOrUpdatePrimitiveObs(formElement.concept, value);
  }
  return observationHolder.observations;
}

function* updateObsWatcher() {
  yield takeEvery(subjectTypes.UPDATE_OBS, updateObsWorker);
}

export function* updateObsWorker({ formElement, value }) {
  const subject = yield select(state => state.dataEntry.registration.subject);
  const validationResults = yield select(state => state.dataEntry.registration.validationResults);
  subject.observations = updateObservations(subject.observations, formElement, value);
  yield put(setSubject(subject));
  yield put(
    setValidationResults(validate(formElement, value, subject.observations, validationResults))
  );
  sessionStorage.setItem("subject", JSON.stringify(subject));
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
  const validationResults = yield select(state => state.dataEntry.registration.validationResults);

  console.log(programEnrolment);

  // if(programEnrolment.observations.length === 0) {
  //   programEnrolment.observations = updateObservations(
  //     programEnrolment.observations,
  //     formElement,
  //     value
  //   );
  //  } else {
  programEnrolment.programExitObservations = updateObservations(
    programEnrolment.programExitObservations,
    formElement,
    value
  );
  //  }

  console.log(programEnrolment);

  yield put(setProgramEnrolment(programEnrolment));
  yield put(
    setValidationResults(
      validate(formElement, value, programEnrolment.programExitObservations, validationResults)
    )
  );
}

export function* updateEnrolmentObsWorker({ formElement, value }) {
  const state = yield select();
  const programEnrolment = state.dataEntry.enrolmentReducer.programEnrolment;
  const validationResults = yield select(state => state.dataEntry.registration.validationResults);

  console.log(programEnrolment);

  programEnrolment.observations = updateObservations(
    programEnrolment.observations,
    formElement,
    value
  );

  console.log(programEnrolment);

  yield put(setProgramEnrolment(programEnrolment));
  yield put(
    setValidationResults(
      validate(formElement, value, programEnrolment.programExitObservations, validationResults)
    )
  );
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
      undoExitProgramEnrolmentWatcher
    ].map(fork)
  );
}
