import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import {
  setGenders,
  setOperationalModules,
  setOrganisationConfig,
  types
} from "../reducers/metadataReducer";
import commonApi from "../../common/service";
import { mapGender, mapOperationalModules } from "../../common/adapters";

function* loadOperationalModulesWatcher() {
  yield takeLatest(types.GET_OPERATIONAL_MODULES, loadOperationalModulesWorker);
}
function* loadOperationalModulesWorker() {
  const operationalModules = yield call(commonApi.fetchOperationalModules);
  yield put(setOperationalModules(yield call(mapOperationalModules, operationalModules)));
}

function* getGendersWatcher() {
  yield takeLatest(types.GET_GENDERS, getGendersWorker);
}
function* getGendersWorker() {
  const genders = yield call(commonApi.fetchGenders);
  yield put(setGenders(genders.content.map(mapGender)));
}

function* getOrganisationConfigWatcher() {
  yield takeLatest(types.GET_OPERATIONAL_MODULES, getOrganisationConfigWorker);
}
function* getOrganisationConfigWorker() {
  const organisationConfigs = yield call(commonApi.fetchOrganisationConfigs);
  yield put(setOrganisationConfig(organisationConfigs));
}

export default function* rootSaga() {
  yield all(
    [loadOperationalModulesWatcher, getGendersWatcher, getOrganisationConfigWatcher].map(fork)
  );
}
