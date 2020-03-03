import { all, call, fork, put, takeEvery, takeLatest } from "redux-saga/effects";
import { types, getTranslation, setOrgConfigInfo, setTranslation } from "./TranslationReducers";
import { storeDispachObservations } from "../common/utils/reduxStoreUtilty";
import api from "./api";

// const api = {
//   fetchOrganisationConfig: () =>
//     http.fetchJson("/web/organizations").then(response => response.json)
// };

// // let tranlationApi;
// // export function defaultLanguage(userDetails){
//  const tranlationApi = { fetchTranslationDetails: () =>
//   http.fetchJson(`/web/translations`).then(response => response.json)}
// // }

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
