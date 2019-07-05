import { all, call, fork } from 'redux-saga/effects';
import { adminSaga, defaultI18nProvider } from 'react-admin';

import { authProvider, dataProvider as springDataProvider } from './admin';
import { initialiseCognito, onSetCognitoUser, userInfoWatcher, dataEntrySearchWatcher } from "./app/saga";

const dataProvider = springDataProvider('');
const i18nProvider = defaultI18nProvider;


export default function* rootSaga() {
    yield call(initialiseCognito);
    yield all([
        fork(adminSaga(dataProvider, authProvider, i18nProvider)),
        fork(onSetCognitoUser),
        fork(userInfoWatcher),
        fork(dataEntrySearchWatcher),
    ]);
}
