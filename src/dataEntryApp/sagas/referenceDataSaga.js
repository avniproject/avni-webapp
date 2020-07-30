import {
  setGenders,
  setOperationalModules,
  setAllLocations,
  setOrganisationConfig,
  types
} from "../reducers/metadataReducer";
import { all, call, fork, put, select, takeLatest } from "redux-saga/effects";
import api from "../api";
import { isEmpty } from "lodash/core";
import { mapGender, mapOperationalModules } from "../../common/adapters";
import { setLoad } from "../reducers/loadReducer";

export function* dataEntryLoadOperationalModulesWatcher() {
  yield takeLatest(types.GET_OPERATIONAL_MODULES, dataEntryLoadOperationalModulesWorker);
}

export function* dataEntryLoadOperationalModulesWorker() {
  const operationalModulesFromState = yield select(
    ({
      dataEntry: {
        metadata: { operationalModules }
      }
    }) => operationalModules
  );
  if (!isEmpty(operationalModulesFromState)) {
    return;
  }

  const operationalModules = yield call(api.fetchOperationalModules);

  yield put(setOperationalModules(yield call(mapOperationalModules, operationalModules)));
}

export function* getGendersWatcher() {
  yield takeLatest(types.GET_GENDERS, getGendersWorker);
}

export function* getGendersWorker() {
  const genders = yield call(api.fetchGenders);
  yield put(setGenders(genders.content.map(mapGender)));
}

export function* getAllLocationWatcher() {
  yield takeLatest(types.GET_ALL_LOCATION, getAllLocationsWorker);
}

export function* getAllLocationsWorker() {
  const allLocations = yield call(api.fetchAllLocation);
  yield put(setAllLocations(allLocations));
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
      getAllLocationWatcher,
      getOrganisationConfigWatcher
    ].map(fork)
  );
}
