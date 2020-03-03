import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import { types, setOrgConfigInfo, setTranslation } from "./TranslationReducers";
import { storeDispachObservations } from "../common/utils/reduxStoreUtilty";
import api from "./api";

export function* organisationConfigWatcher() {
  yield takeLatest(types.GET_ORG_CONFIG, setOrganisationConfig);
}

function* setOrganisationConfig() {
  const orgConfig = yield call(api.fetchOrganisationConfig);
  yield put(setOrgConfigInfo(orgConfig));
}

export default function*() {
  yield all([translationWatcher].map(fork));
}

export function* translationWatcher() {
  yield takeLatest(types.GET_TRANSLATION, setTranslationDetails);
}

export function* setTranslationDetails() {
  const translationsData = yield call(api.fetchTranslationDetails);
  storeDispachObservations(types.TRANSLATION_DATA, translationsData);
  yield put(setTranslation(translationsData));
}
