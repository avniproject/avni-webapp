import { all } from 'redux-saga/effects';

import { isProdEnv, authInDev } from "./common/constants";
import { initializeCognito, userInfoWatcher } from "./app/saga";

export default function* rootSaga() {
    yield all([
        (isProdEnv || authInDev) && initializeCognito(),
        userInfoWatcher()
    ])
}
