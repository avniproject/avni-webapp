import { call, put, takeEvery } from 'redux-saga/effects';

import { types, setUserInfo as setUserInfoAction } from "./ducks";
import { isFauxProd } from "../common/constants";
import { fetchJson } from "../common/utils";
import { cognitoConfig as cognitoConfigFromEnv } from '../common/awsConfig';
import { configureAuth } from "./utils";


const api = {
    fetchCognitoDetails: () => fetchJson('/cognito-details'),
    fetchUserInfo: () => fetchJson('/userInfo')
};

export function* initCognitoWatcher() {
    yield takeEvery(types.INIT_COGNITO, initializeCognito);
}

export function* userInfoWatcher() {
    yield takeEvery(types.GET_USER_INFO, setUserDetails);
}

function* initializeCognito() {
    try {
        const cognitoDetails = isFauxProd ? cognitoConfigFromEnv : yield call(api.fetchCognitoDetails);
        yield call(configureAuth, cognitoDetails);
    }
    catch (e) {
        yield call(alert, e);
    }
}

function* setUserDetails() {
    const userDetails = yield call(api.fetchUserInfo);
    yield put(setUserInfoAction(userDetails));
}
