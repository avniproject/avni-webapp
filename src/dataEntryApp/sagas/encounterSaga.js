import { all, call, fork, put, select, takeLatest, takeEvery } from "redux-saga/effects";
import { find, get, isNil, remove } from "lodash";
import moment from "moment";
import { types, setEncounterFormMappings } from "../reducers/encounterReducer";
import api from "../api";
import { selectFormMappingForSubjectType } from "./encounterSelector";
import { getSubjectProfile, setSubjectProfile } from "../reducers/subjectDashboardReducer";
import { mapProfile } from "../../common/subjectModelMapper";

export default function*() {
  yield all([programEncouterOnLoadWatcher].map(fork));
}

export function* programEncouterOnLoadWatcher() {
  yield takeLatest(types.ON_LOAD, programEncouterOnLoadWorker);
}

export function* programEncouterOnLoadWorker({ subjectUuid }) {
  const subjectProfileJson = yield call(api.fetchSubjectProfile, subjectUuid);
  yield put.resolve(setSubjectProfile(mapProfile(subjectProfileJson)));

  const encounterFormMappings = yield select(
    selectFormMappingForSubjectType(subjectProfileJson.subjectType.uuid)
  );
  yield put(setEncounterFormMappings(encounterFormMappings));
}
