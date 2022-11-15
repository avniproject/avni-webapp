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
import { mapGender, mapOperationalModules } from "../../common/adapters";
import { setLoad } from "../reducers/loadReducer";

export function* dataEntryLoadOperationalModulesWatcher() {
  yield takeLatest(types.GET_OPERATIONAL_MODULES, dataEntryLoadOperationalModulesWorker);
}

export function* dataEntryLoadOperationalModulesWorker() {
  const operationalModules = yield call(api.fetchOperationalModules);

  yield put(setOperationalModules(yield call(mapOperationalModules, operationalModules)));
}

export function* legacyRulesBundleWatcher() {
  yield takeLatest(types.GET_LEGACY_RULES_BUNDLE, legacyRulesBundleWorker);
}

export function* legacyRulesBundleWorker() {
  const legacyRulesBundle = yield call(api.getLegacyRulesBundle);
  yield put(setLegacyRulesBundle(legacyRulesBundle));
}

export function* legacyRulesWatcher() {
  yield takeLatest(types.GET_LEGACY_RULES, legacyRulesWorker);
}

export function* legacyRulesWorker() {
  const legacyRules = yield call(api.getLegacyRules);
  yield put(setLegacyRules(legacyRules));
}

export function* getGendersWatcher() {
  yield takeLatest(types.GET_GENDERS, getGendersWorker);
}

export function* getGendersWorker() {
  const genders = yield call(api.fetchGenders);
  yield put(setGenders(genders.content.map(mapGender)));
}

export function* getOrganisationConfigWatcher() {
  yield takeLatest(types.GET_ORGANISATION_CONFIG, getOrganisationConfigWorker);
}
export function* getOrganisationConfigWorker() {
  const organisationConfigs = yield call(api.fetchOrganisationConfigs);
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
