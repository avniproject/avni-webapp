import { all, call, fork, put, select, takeLatest } from "redux-saga/effects";
import {
  setEncounterForm,
  setProgramEnrolmentForm,
  setSubjectProgram,
  types
} from "../reducers/programSubjectDashboardReducer";
import api from "../api";
import { mapProgram } from "../../common/subjectModelMapper";
import { setLoad } from "../reducers/loadReducer";
import { selectEnrolmentFormMappingForSubjectType } from "./enrolmentSelectors";
import { mapForm } from "../../common/adapters";

export default function*() {
  yield all(
    [subjectProgramFetchWatcher, programEnrolmentFormWatcher, programEncounterFormWatcher].map(fork)
  );
}

export function* subjectProgramFetchWatcher() {
  yield takeLatest(types.GET_SUBJECT_PROGRAM, subjectProgramFetchWorker);
}

export function* subjectProgramFetchWorker({ subjectProgramUUID }) {
  yield put.resolve(setLoad(false));
  const subjectProgram = yield call(api.fetchSubjectProgram, subjectProgramUUID);
  yield put(setSubjectProgram(mapProgram(subjectProgram)));
  yield put.resolve(setLoad(true));
}

export function* programEnrolmentFormWatcher() {
  yield takeLatest(types.GET_PROGRAM_ENROLMENT_FORM, programEnrolmentFormWorker);
}

export function* programEnrolmentFormWorker({ subjectTypeName, programName, formType }) {
  yield put.resolve(setProgramEnrolmentForm());
  const formMapping = yield select(
    selectEnrolmentFormMappingForSubjectType(subjectTypeName, programName, formType)
  );
  const programEnrolmentForm = yield call(api.fetchForm, formMapping.formUUID);
  yield put.resolve(setProgramEnrolmentForm(mapForm(programEnrolmentForm)));
}

export function* programEncounterFormWatcher() {
  yield takeLatest(types.GET_ENCOUNTER_FORM, programEncounterFormWorker);
}

export function* programEncounterFormWorker({ formUUID }) {
  const encounterForm = yield call(api.fetchForm, formUUID);
  const form = { formUUID, form: mapForm(encounterForm) };
  yield put.resolve(setEncounterForm(form));
}
