import { all } from 'redux-saga/effects';
import { adminSaga, defaultI18nProvider } from 'react-admin';
//import restProvider from 'ra-data-simple-rest';
import jsonServerProvider from 'ra-data-json-server';

import { isProdEnv, cognitoInDev } from "./common/constants";
import { initializeCognito, userInfoWatcher } from "./app/saga";


export const authProvider = () => Promise.resolve();
// export const dataProvider = restProvider('/');
export const dataProvider = jsonServerProvider('http://jsonplaceholder.typicode.com');
const i18nProvider = defaultI18nProvider;


export default function* rootSaga() {
    yield all([
        adminSaga(dataProvider, authProvider, i18nProvider),
        (isProdEnv || cognitoInDev) && initializeCognito(),
        userInfoWatcher()
    ])
}
