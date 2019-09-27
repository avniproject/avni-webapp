import { setDashboardData, setOrgConfig, types } from "../reducers/onLoadReducer";
import { all, call, fork, put, select, takeLatest } from "redux-saga/effects";
import { isEmpty } from "lodash/core";
import api from "../api";
import { mapOrganisationConfig } from "../../common/adapters";

export function* onLoadWatcher() {
  yield takeLatest(types.GET_ORG_CONFIG, onLoadWorker);
}

export function* onLoadWorker() {
  const valueFromState = yield select(
    ({ translations: { organisationConfig } }) => organisationConfig
  );
  if (!isEmpty(valueFromState)) {
    return;
  }
  const valueFromApi = yield call(api.fetchOrgConfig);
  yield put(setOrgConfig(yield call(mapOrganisationConfig, valueFromApi)));
}

export function* fetchDashboardWatcher() {
  yield takeLatest(types.GET_DASHBOARD_DATA, fetchDashboardWorker);
}

export function* fetchDashboardWorker({ platform, emptyValue }) {
  const data = yield call(api.fetchDashboardData, { platform, emptyValue });
  yield put(setDashboardData(data));
}

export default function* onLoadSaga() {
  yield all([onLoadWatcher, fetchDashboardWatcher].map(fork));
}
