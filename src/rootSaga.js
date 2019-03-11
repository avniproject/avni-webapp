import { all } from 'redux-saga/effects';

import {isProdEnv, authInDev} from "./common/constants";
import {initCognitoWatcher, userInfoWatcher} from "./app/saga";

export default function* rootSaga() {
    yield all([
        (isProdEnv || authInDev) && initCognitoWatcher(),
        userInfoWatcher()
    ])
}
