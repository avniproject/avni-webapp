import { all } from 'redux-saga/effects';

import {isDevEnv, authInDev} from "./common/constants";
import {initCognitoWatcher, userInfoWatcher} from "./app/saga";

export default function* rootSaga() {
    yield all([
        (!isDevEnv || authInDev) && initCognitoWatcher(),
        userInfoWatcher()
    ])
}
