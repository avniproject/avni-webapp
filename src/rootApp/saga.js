import { call, put, take, takeLatest } from "redux-saga/effects";
import { getUserInfo, sendAuthConfigured, sendInitComplete, setUserInfo, types } from "./ducks";
import {
  cognitoConfig as cognitoConfigFromEnv,
  cognitoInDev,
  isDevEnv,
  isProdEnv
} from "../common/constants";
import http from "common/utils/httpClient";
import { configureAuth } from "./utils";

const api = {
  fetchCognitoDetails: () => http.fetchJson("/cognito-details").then(response => response.json),
  fetchUserInfo: () => http.fetchJson("/me").then(response => response.json)
};

export function* initialiseCognito() {
  if (isProdEnv || cognitoInDev) {
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
  } else {
    return;
  }
}

export function* onSetCognitoUser() {
  const action = yield take(types.SET_COGNITO_USER);
  yield call(http.initAuthContext, {
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
    yield call(http.initAuthContext, { username: userDetails.username });
  }
  yield put(sendInitComplete());
}
