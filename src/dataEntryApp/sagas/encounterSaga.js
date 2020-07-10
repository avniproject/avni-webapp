import { all, call, fork, put, select, takeLatest, takeEvery } from "redux-saga/effects";
import { find, get, isNil, remove } from "lodash";
import moment from "moment";
import { types, setEncounterFormMappings } from "../reducers/encounterReducer";
import api from "../api";
import { selectFormMappingForSubjectType } from "./encounterSelector";
import { setSubjectProfile } from "../reducers/subjectDashboardReducer";
import { getSubjectGeneral } from "../reducers/generalSubjectDashboardReducer";
import { mapProfile } from "../../common/subjectModelMapper";

export default function*() {
  yield all([programEncouterOnLoadWatcher].map(fork));
}

export function* programEncouterOnLoadWatcher() {
  yield takeLatest(types.ON_LOAD, programEncouterOnLoadWorker);
}

export function* programEncouterOnLoadWorker({ subjectUuid }) {
  yield put.resolve(getSubjectGeneral(subjectUuid));

  const subjectProfileJson = yield call(api.fetchSubjectProfile, subjectUuid);
  const encounterFormMappings = yield select(
    selectFormMappingForSubjectType(subjectProfileJson.subjectType.uuid)
  );

  yield put.resolve(setEncounterFormMappings(encounterFormMappings));
  yield put.resolve(setSubjectProfile(mapProfile(subjectProfileJson)));
}
