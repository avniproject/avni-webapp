import { all } from "redux-saga/effects";
import dataEntrySaga from "../dataEntryApp/sagas";
import broadcastSaga from "../news/sagas";
import translationsSaga from "../translations/sagas";
import uploadSagas from "../upload/sagas";
import reportSagas from "../reports/sagas";
import userGroupsSagas from "../userGroups/sagas";
import { organisationConfigWatcher } from "../i18nTranslations/TranslationSaga";

import { getAdminOrgsWatcher, logoutWatcher, onSetAuthSession, userInfoWatcher } from "./saga";
import { forkRestartingOnNetworkError } from "./restartOnNetworkError";

export default function* rootSaga() {
  yield all(
    [
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
      userGroupsSagas,
    ].map(forkRestartingOnNetworkError),
  );
}
