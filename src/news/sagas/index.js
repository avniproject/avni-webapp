import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import {
  setGenders,
  setOperationalModules,
  setOrganisationConfig
} from "../reducers/metadataReducer";
import commonApi from "../../common/service";
import { mapGender, mapOperationalModules } from "../../common/adapters";
import { setLoad } from "../../dataEntryApp/reducers/loadReducer";

function* loadOperationalModulesWorker() {
  const operationalModules = yield call(commonApi.fetchOperationalModules);
  yield put(setOperationalModules(yield call(mapOperationalModules, operationalModules)));
}

function* getGendersWorker() {
  const genders = yield call(commonApi.fetchGenders);
  yield put(setGenders(genders.content.map(mapGender)));
}

function* getOrganisationConfigWorker() {
  const organisationConfigs = yield call(commonApi.fetchOrganisationConfigs);
  yield put.resolve(setLoad(false));
  yield put(setOrganisationConfig(organisationConfigs));
  yield put.resolve(setLoad(true));
}

export default function* rootSaga() {
  yield all(
    [loadOperationalModulesWorker, getGendersWorker, getOrganisationConfigWorker].map(fork)
  );
}
