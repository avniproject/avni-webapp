import { all, call, fork, put, select, takeLatest, takeEvery } from "redux-saga/effects";
import { find, get, isNil, remove } from "lodash";
import moment from "moment";
import { types, setEncounterFormMappings } from "../reducers/encounterReducer";
import api from "../api";
import { selectFormMappingForSubjectType } from "./encounterSelector";

export default function*() {
  yield all([programEncouterOnLoadWatcher].map(fork));
}

export function* programEncouterOnLoadWatcher() {
  yield takeLatest(types.ON_LOAD, programEncouterOnLoadWorker);
}

export function* programEncouterOnLoadWorker({ enrolmentUuid }) {
  // const subjectProfileJson = yield call(api.fetchSubjectProfile, subjectUuid);
  // yield put.resolve(setSubjectProfile(mapProfile(subjectProfileJson)));

  const encounterFormMapping = yield select(
    selectFormMappingForSubjectType("a2cafd3f-6d67-458b-b874-9d9800e475fd")
  );
  yield put(setEncounterFormMappings(encounterFormMapping));
}
