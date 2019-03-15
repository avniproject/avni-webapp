import { call, put, take, takeLatest } from 'redux-saga/effects';

import { types, setUserInfo as setUserInfoAction } from "./ducks";
import { cognitoInDev } from "../common/constants";
import { fetchJson } from "../common/utils";
import { cognitoConfig as cognitoConfigFromEnv } from '../common/awsConfig';
import { configureAuth } from "./utils";


const api = {
    fetchCognitoDetails: () => fetchJson('/cognito-details'),
    fetchUserInfo: () => fetchJson('/me')
};

export function* initializeCognito() {
    yield take(types.INIT_COGNITO);
    try {
        const cognitoDetails = cognitoInDev ? cognitoConfigFromEnv : yield call(api.fetchCognitoDetails);
        yield call(configureAuth, cognitoDetails);
    } catch (e) {
        yield call(alert, e);
    }
}

export function* userInfoWatcher() {
    yield takeLatest(types.GET_USER_INFO, setUserDetails);
}

function* setUserDetails() {
    const userDetails = yield call(api.fetchUserInfo);
    yield put(setUserInfoAction(userDetails));
}
