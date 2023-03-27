import { all, fork, call } from "redux-saga/effects";
import { adminSaga, defaultI18nProvider } from "react-admin";
import dataEntrySaga from "../dataEntryApp/sagas";
import broadcastSaga from "../news/sagas";
import translationsSaga from "../translations/sagas";
import uploadSagas from "../upload/sagas";
import reportSagas from "../reports/sagas";
import userGroupsSagas from "../userGroups/sagas";
import { organisationConfigWatcher } from "../i18nTranslations/TranslationSaga";

import {
  authProvider,
  dataProvider as springDataProvider
} from "../adminApp/react-admin-config/index";

import { getAdminOrgsWatcher, logoutWatcher, onSetAuthSession, userInfoWatcher } from "./saga";

const dataProvider = springDataProvider("");
const i18nProvider = defaultI18nProvider;

export default function* rootSaga() {
  yield all(
    [
      adminSaga(dataProvider, authProvider, i18nProvider),
      onSetAuthSession,
      userInfoWatcher,
      getAdminOrgsWatcher,
      logoutWatcher,
      organisationConfigWatcher,
      dataEntrySaga,
      broadcastSaga,
      translationsSaga,
      uploadSagas,
      reportSagas,
      userGroupsSagas
    ].map(fork)
  );
}
