import { call, put, select, take, takeLatest } from "redux-saga/effects";
//import {Form} from 'openchs-models';
import {
  getUserInfo,
  sendAuthConfigured,
  sendInitComplete,
  setOperationalModules,
  setRegistrationForm,
  setRegistrationSubjectType,
  setSubjects,
  setUserInfo,
  types
} from "./ducks";
import {
  cognitoConfig as cognitoConfigFromEnv,
  cognitoInDev,
  isDevEnv,
  isProdEnv
} from "../common/constants";
import { httpClient } from "../common/utils/httpClient";
import { configureAuth } from "./utils";
import SubjectService from "../dataEntryApp/services/SubjectService";
import { isNil } from "lodash";

const api = {
  fetchCognitoDetails: () =>
    httpClient.fetchJson("/cognito-details").then(response => response.json),
  fetchUserInfo: () =>
    httpClient.fetchJson("/me").then(response => response.json),
  fetchOperationalModules: () =>
    httpClient
      .fetchJson("/web/operationalModules/")
      .then(response => response.json),
  fetchForm: uuid =>
    httpClient.fetchJson(`/web/form/${uuid}`).then(response => response.json)
};

export function* initialiseCognito() {
  if (!(isProdEnv || cognitoInDev)) return;
  yield take(types.INIT_COGNITO);
  try {
    const cognitoDetails = cognitoInDev
      ? cognitoConfigFromEnv
      : yield call(api.fetchCognitoDetails);
    yield call(configureAuth, cognitoDetails);
    yield put(sendAuthConfigured());
  } catch (e) {
    yield call(alert, e);
  }
}

export function* onSetCognitoUser() {
  const action = yield take(types.SET_COGNITO_USER);
  yield call(httpClient.initAuthContext, {
    username: action.payload.authData.username,
    idToken: action.payload.authData.signInUserSession.idToken.jwtToken
  });
  yield put(getUserInfo());
}

export function* userInfoWatcher() {
  yield takeLatest(types.GET_USER_INFO, setUserDetails);
}

function* setUserDetails() {
  const userDetails = yield call(api.fetchUserInfo);
  yield put(setUserInfo(userDetails));
  if (isDevEnv && !cognitoInDev) {
    yield call(httpClient.initAuthContext, { username: userDetails.username });
  }
  yield put(sendInitComplete());
}

export function* dataEntrySearchWatcher() {
  yield takeLatest(types.SEARCH_SUBJECTS, dataEntrySearchWorker);
}

function* dataEntrySearchWorker() {
  const params = yield select(state => state.app.subjectSearchParams);
  const subjects = yield call(SubjectService.search, params);
  yield put(setSubjects(subjects));
}

export function* dataEntryLoadOperationalModules() {
  const operationalModules = yield call(api.fetchOperationalModules);
  yield put(setOperationalModules(operationalModules));
  yield put(setRegistrationSubjectType(operationalModules.subjectTypes[0]));
}

export function* dataEntryLoadRegistrationFormWatcher() {
  yield takeLatest(
    types.GET_REGISTRATION_FORM,
    dataEntryLoadRegistrationFormWorker
  );
}

function* dataEntryLoadRegistrationFormWorker() {
  const formUuid = yield select(state => {
    const { registrationSubjectType, operationalModules } = state.app;
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
