import { call, put, take, takeLatest } from 'redux-saga/effects';
import { types, getUserInfo, setUserInfo, sendInitComplete } from "./ducks";
import { cognitoInDev, isProdEnv, isDevEnv } from "../common/constants";
import { httpClient } from "../utils/httpClient";
import { cognitoConfig as cognitoConfigFromEnv } from '../common/constants';
import { configureAuth } from "./utils";

const api = {
    fetchCognitoDetails: () => httpClient.fetchJson('/cognito-details'),
    fetchUserInfo: () => httpClient.fetchJson('/me'),
};

export function* initialiseCognito() {
    if (!(isProdEnv || cognitoInDev)) return;
    yield take(types.INIT_COGNITO);
    try {
        const cognitoDetails = cognitoInDev ? cognitoConfigFromEnv : yield call(api.fetchCognitoDetails);
        yield call(configureAuth, cognitoDetails);
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
