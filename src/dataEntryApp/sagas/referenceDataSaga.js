import {
  setGenders,
  setOperationalModules,
  setOrganisationConfig,
  setLegacyRulesBundle,
  setLegacyRules,
  types
} from "dataEntryApp/reducers/metadataReducer";
import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import api from "../api";
import commonApi from "../../common/service";
import { mapGender, mapOperationalModules } from "../../common/adapters";
import { setLoad } from "../reducers/loadReducer";

function* dataEntryLoadOperationalModulesWatcher() {
  yield takeLatest(types.GET_OPERATIONAL_MODULES, dataEntryLoadOperationalModulesWorker);
}

export function* dataEntryLoadOperationalModulesWorker() {
  const operationalModules = yield call(commonApi.fetchOperationalModules);

  yield put(setOperationalModules(yield call(mapOperationalModules, operationalModules)));
}

function* legacyRulesBundleWatcher() {
  yield takeLatest(types.GET_LEGACY_RULES_BUNDLE, legacyRulesBundleWorker);
}

function* legacyRulesBundleWorker() {
  const legacyRulesBundle = yield call(api.getLegacyRulesBundle);
  yield put(setLegacyRulesBundle(legacyRulesBundle));
}

function* legacyRulesWatcher() {
  yield takeLatest(types.GET_LEGACY_RULES, legacyRulesWorker);
}

function* legacyRulesWorker() {
  const legacyRules = yield call(api.getLegacyRules);
  yield put(setLegacyRules(legacyRules));
}

function* getGendersWatcher() {
  yield takeLatest(types.GET_GENDERS, getGendersWorker);
}

function* getGendersWorker() {
  const genders = yield call(commonApi.fetchGenders);
  yield put(setGenders(genders.content.map(mapGender)));
}

function* getOrganisationConfigWatcher() {
  yield takeLatest(types.GET_ORGANISATION_CONFIG, getOrganisationConfigWorker);
}
function* getOrganisationConfigWorker() {
  const organisationConfigs = yield call(commonApi.fetchOrganisationConfigs);
  yield put.resolve(setLoad(false));
  yield put(setOrganisationConfig(organisationConfigs));
  yield put.resolve(setLoad(true));
}

export default function* referenceDataSaga() {
  yield all(
    [
      dataEntryLoadOperationalModulesWatcher,
      getGendersWatcher,
      getOrganisationConfigWatcher,
      legacyRulesBundleWatcher,
      legacyRulesWatcher
    ].map(fork)
  );
}
