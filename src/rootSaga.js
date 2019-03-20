import { all, fork } from 'redux-saga/effects';
import { adminSaga, defaultI18nProvider } from 'react-admin';
import jsonServerProvider from 'ra-data-json-server';

import { initialiseCognito, userInfoWatcher } from "./app/saga";


export const authProvider = () => Promise.resolve();
export const dataProvider = jsonServerProvider('http://jsonplaceholder.typicode.com');
const i18nProvider = defaultI18nProvider;


export default function* rootSaga() {
    yield all([
        adminSaga(dataProvider, authProvider, i18nProvider),
        initialiseCognito,
        userInfoWatcher
    ].map(fork));
}
