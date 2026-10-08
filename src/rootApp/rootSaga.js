import { all, fork } from "redux-saga/effects";
import dataEntrySaga from "../dataEntryApp/sagas";
import broadcastSaga from "../news/sagas";
import translationsSaga from "../translations/sagas";
import uploadSagas from "../upload/sagas";
import reportSagas from "../reports/sagas";
import userGroupsSagas from "../userGroups/sagas";
import { organisationConfigWatcher } from "../i18nTranslations/TranslationSaga";

import { getAdminOrgsWatcher, logoutWatcher, onSetAuthSession, userInfoWatcher } from "./saga";

export default function* rootSaga() {
  yield all([
    fork(onSetAuthSession),
    fork(userInfoWatcher),
    fork(getAdminOrgsWatcher),
    fork(logoutWatcher),
    fork(organisationConfigWatcher),
    fork(dataEntrySaga),
    fork(broadcastSaga),
    fork(translationsSaga),
    fork(uploadSagas),
    fork(reportSagas),
    fork(userGroupsSagas)
  ]);
}
