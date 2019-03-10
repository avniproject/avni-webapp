import { all } from 'redux-saga/effects';

import {isDevEnv, isFauxProd} from "./common/constants";
import {initCognitoWatcher, userInfoWatcher} from "./app/saga";

export default function* rootSaga() {
    yield all([
        (!isDevEnv || isFauxProd) && initCognitoWatcher(),
        userInfoWatcher()
    ])
}
