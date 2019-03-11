import { all } from 'redux-saga/effects';

import { isProdEnv, cognitoInDev } from "./common/constants";
import { initializeCognito, userInfoWatcher } from "./app/saga";

export default function* rootSaga() {
    yield all([
        (isProdEnv || cognitoInDev) && initializeCognito(),
        userInfoWatcher()
    ])
}
