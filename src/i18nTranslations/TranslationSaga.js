import { call, put, takeLatest } from "redux-saga/effects";
import { types, setOrgConfigInfo } from "./TranslationReducers";
import api from "./api";

export function* organisationConfigWatcher() {
  yield takeLatest(types.GET_ORG_CONFIG, setOrganisationConfig);
}

function* setOrganisationConfig() {
  const orgConfig = yield call(api.fetchOrganisationConfig);
  yield put(setOrgConfigInfo(orgConfig));
}
