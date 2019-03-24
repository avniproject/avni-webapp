import { all, fork } from 'redux-saga/effects';
import { adminSaga, defaultI18nProvider } from 'react-admin';

import { authProvider, dataProvider as springDataProvider } from './admin';
import { initialiseCognito, onSetCognitoUser, userInfoWatcher } from "./app/saga";

const dataProvider = springDataProvider('');
const i18nProvider = defaultI18nProvider;


export default function* rootSaga() {
    yield all([
        adminSaga(dataProvider, authProvider, i18nProvider),
        initialiseCognito,
        onSetCognitoUser,
        userInfoWatcher
    ].map(fork));
}
