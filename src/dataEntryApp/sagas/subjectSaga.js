import {
  FormElementGroup,
  Individual,
  ObservationsHolder,
  ProgramEnrolment,
  SubjectType
} from "avni-models";
import {
  getRegistrationForm,
  saveComplete,
  selectAddressLevelType,
  setLoaded,
  setRegistrationForm,
  setSubject,
  setValidationResults,
  types as subjectTypes
} from "../reducers/registrationReducer";
import SubjectService from "../services/SubjectService";
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
  setEnrolForm,
  setInitialState,
  setLoaded as setEnrolmentLoaded,
  setProgramEnrolment,
  types as enrolmentTypes
} from "../reducers/programEnrolReducer";
import { setLoad } from "../reducers/loadReducer";
import _ from "lodash";
import { mapProgramEnrolment } from "../../common/subjectModelMapper";
import { mapProfile } from "common/subjectModelMapper";
import { setSubjectProfile } from "../reducers/subjectDashboardReducer";
import { setFilteredFormElements } from "../reducers/RulesReducer";
import formElementService, { getFormElementStatuses } from "../services/FormElementService";
import {
  selectDecisions,
  selectVisitSchedules
} from "dataEntryApp/reducers/serverSideRulesReducer";

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
  const formMapping = yield select(
    selectEnrolmentFormMappingForSubjectType(subjectTypeName, programName, formType)
  );
  const enrolForm = yield call(api.fetchForm, formMapping.formUUID);
  yield put.resolve(setEnrolForm(mapForm(enrolForm)));
  const program = yield select(selectProgram(programName));
  const state = yield select();
  const subject = state.dataEntry.subjectProfile.subjectProfile;
  //subject.subjectType = SubjectType.create("Individual");
  if (formType === "ProgramEnrolment" && programEnrolmentUuid) {
    let programEnrolment = yield call(api.fetchProgramEnrolments, programEnrolmentUuid);
    programEnrolment = mapProgramEnrolment(programEnrolment, subject);
    programEnrolment.programExitObservations = [];
    _.assign(programEnrolment, { program });
    yield put.resolve(setProgramEnrolment(programEnrolment));
  } else if (formType === "ProgramEnrolment") {
    let programEnrolment = ProgramEnrolment.createEmptyInstance({ individual: subject, program });
    yield put.resolve(setProgramEnrolment(programEnrolment));
  } else if (formType === "ProgramExit" && programEnrolmentUuid) {
    let programEnrolment = yield call(api.fetchProgramEnrolments, programEnrolmentUuid);
    programEnrolment = mapProgramEnrolment(programEnrolment, subject);

    if (!programEnrolment.programExitObservations) {
      programEnrolment.programExitObservations = [];
      programEnrolment.programExitDateTime = new Date();
    }
    _.assign(programEnrolment, { program });
    yield put.resolve(setProgramEnrolment(programEnrolment));
  } else {
    let programEnrolment = yield call(api.fetchProgramEnrolments, programEnrolmentUuid);
    programEnrolment = mapProgramEnrolment(programEnrolment, subject);
    programEnrolment.programExitObservations = [];
    programEnrolment.programExitDateTime = new Date();
    _.assign(programEnrolment, { program });
    yield put.resolve(setProgramEnrolment(programEnrolment));
  }

  yield put.resolve(setSubjectProfile());
  const subjectProfileJson = yield call(api.fetchSubjectProfile, subjectUuid);
  const subjectProfile = mapProfile(subjectProfileJson);
  yield put.resolve(setSubjectProfile(subjectProfile));
  yield put.resolve(setEnrolmentLoaded());
}

export function* dataEntrySearchWatcher() {
  yield takeLatest(searchTypes.SEARCH_SUBJECTS, dataEntrySearchWorker);
}

function* dataEntrySearchWorker({ params }) {
  // const params = yield select(state => state.dataEntry.search.subjectSearchParams);
  yield put.resolve(setLoad(false));
  const subjects = yield call(SubjectService.search, params);
  yield put(setSubjects(subjects));
  yield put.resolve(setLoad(true));
}

export function* dataEntryLoadRegistrationFormWatcher() {
  yield takeLatest(subjectTypes.GET_REGISTRATION_FORM, dataEntryLoadRegistrationFormWorker);
}

export function* saveSubjectWorker() {
  const subject = yield select(selectRegistrationSubject);
  const visitSchedules = yield select(selectVisitSchedules);

  let resource = subject.toResource;
  resource.visitSchedules = visitSchedules;
  yield call(api.saveSubject, resource);
  yield put(saveComplete());
}

export function* saveSubjectWatcher() {
  yield takeLatest(subjectTypes.SAVE_SUBJECT, saveSubjectWorker);
}

export function* saveProgramEnrolmentWorker() {
  try {
    const programEnrolment = yield select(selectProgramEnrolment);
    const visitSchedules = yield select(selectVisitSchedules);
    const decisions = yield select(selectDecisions);

    let resource = programEnrolment.toResource;
    resource.visitSchedules = visitSchedules;
    resource.decisions = decisions;

    yield call(api.saveProgram, resource);
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
  subject.subjectType = SubjectType.create("Individual");

  let programEnrolment = yield call(api.fetchProgramEnrolments, programEnrolmentUuid);
  programEnrolment = mapProgramEnrolment(programEnrolment, subject);
  programEnrolment.programExitDateTime = undefined;
  programEnrolment.programExitObservations = [];

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

  yield put.resolve(setSubject(subject));
  yield put.resolve(setLoaded());
}

function* updateObsWatcher() {
  yield takeEvery(subjectTypes.UPDATE_OBS, updateObsWorker);
}

export function* updateObsWorker({ formElement, value }) {
  yield put.resolve(setFilteredFormElements());
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
  yield put(setFilteredFormElements(filteredFormElements));
  observationsHolder.updatePrimitiveObs(filteredFormElements, formElementStatuses);
  subject.observations = observationsHolder.observations;

  yield put(setSubject(subject));
  yield put(
    setValidationResults(
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
  const validationResults = yield select(state => state.dataEntry.registration.validationResults);

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
  yield put(setFilteredFormElements(filteredFormElements));
  observationsHolder.updatePrimitiveObs(filteredFormElements, formElementStatuses);
  programEnrolment.programExitObservations = observationsHolder.observations;

  yield put(setProgramEnrolment(programEnrolment));
  yield put(
    setValidationResults(
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
  const validationResults = yield select(state => state.dataEntry.registration.validationResults);

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
  yield put(setFilteredFormElements(filteredFormElements));
  observationsHolder.updatePrimitiveObs(filteredFormElements, formElementStatuses);
  programEnrolment.observations = observationsHolder.observations;

  yield put(setProgramEnrolment(programEnrolment));
  yield put(
    setValidationResults(
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
