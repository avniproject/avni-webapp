import { first, isNil } from "lodash";
import {
  setRegistrationForm,
  types as subjectTypes
} from "../reducers/subjectReducer";
import SubjectService from "../services/SubjectService";
import { setSubjects, types as searchTypes } from "../reducers/searchReducer";
import { all, call, fork, put, select, takeLatest } from "redux-saga/effects";
import api from "../api";
import { Form } from "openchs-models";

export function* dataEntrySearchWatcher() {
  yield takeLatest(searchTypes.SEARCH_SUBJECTS, dataEntrySearchWorker);
}

function* dataEntryLoadRegistrationFormWorker() {
  const formUuid = yield select(state => {
    const {
      dataEntry: {
        metadata: { operationalModules },
        subject: {
          registrationSubjectType = first(operationalModules.subjectTypes)
        }
      }
    } = state;
    const registrationFormMapping = operationalModules.formMappings.find(
      fm =>
        isNil(fm.programId) &&
        isNil(fm.encounterTypeId) &&
        fm.subjectTypeId === registrationSubjectType.id
    );
    return registrationFormMapping.formUuid;
  });
  const registrationForm = yield call(api.fetchForm, formUuid);
  // const form = Form.fromResource(registrationForm);
  yield put(setRegistrationForm(registrationForm));
}

function* dataEntrySearchWorker() {
  const params = yield select(
    state => state.dataEntry.search.subjectSearchParams
  );
  const subjects = yield call(SubjectService.search, params);
  yield put(setSubjects(subjects));
}

export function* dataEntryLoadRegistrationFormWatcher() {
  yield takeLatest(
    subjectTypes.GET_REGISTRATION_FORM,
    dataEntryLoadRegistrationFormWorker
  );
}

export default function* subjectSaga() {
  yield all([
    fork(dataEntrySearchWatcher),
    fork(dataEntryLoadRegistrationFormWatcher)
  ]);
}
