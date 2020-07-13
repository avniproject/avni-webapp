import { all, call, fork, put, select, takeLatest, takeEvery } from "redux-saga/effects";
import { find, get, isNil, remove } from "lodash";
import moment from "moment";
import { types, setEncounterFormMappings, setEncounterForm } from "../reducers/encounterReducer";
import api from "../api";
import {
  selectFormMappingsForSubjectType,
  selectFormMappingForEncounter
} from "./encounterSelector";
import { mapForm } from "../../common/adapters";
import { setSubjectProfile } from "../reducers/subjectDashboardReducer";
import { getSubjectGeneral } from "../reducers/generalSubjectDashboardReducer";
import { mapProfile } from "../../common/subjectModelMapper";

export default function*() {
  yield all([encouterOnLoadWatcher, encounterFetchFormWatcher].map(fork));
}

export function* encouterOnLoadWatcher() {
  yield takeLatest(types.ON_LOAD, encouterOnLoadWorker);
}

export function* encouterOnLoadWorker({ subjectUuid }) {
  yield put.resolve(getSubjectGeneral(subjectUuid));

  const subjectProfileJson = yield call(api.fetchSubjectProfile, subjectUuid);
  const encounterFormMappings = yield select(
    selectFormMappingsForSubjectType(subjectProfileJson.subjectType.uuid)
  );

  yield put.resolve(setEncounterFormMappings(encounterFormMappings));
  yield put.resolve(setSubjectProfile(mapProfile(subjectProfileJson)));
}

export function* encounterFetchFormWatcher() {
  yield takeLatest(types.GET_ENCOUNTER_FORM, encounterFetchFormWorker);
}

export function* encounterFetchFormWorker({ encounterTypeUuid, subjectUuid }) {
  const formMapping = yield select(selectFormMappingForEncounter(encounterTypeUuid));
  const encounterForm = yield call(api.fetchForm, formMapping.formUUID);
  yield put(setEncounterForm(mapForm(encounterForm)));
}
