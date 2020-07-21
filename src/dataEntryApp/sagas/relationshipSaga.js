import { all, call, fork, put, takeLatest, select } from "redux-saga/effects";
import { types, setRelations } from "../reducers/relationshipReducer";
import api from "../api";
import { setLoad } from "../reducers/loadReducer";

export default function*() {
  yield all([relationshipFetchWatcher, saveRelatioshipWatcher, removeRelatioshipWatcher].map(fork));
}

export function* relationshipFetchWatcher() {
  yield takeLatest(types.GET_RELATION, relationshipFetchWorker);
}

export function* saveRelatioshipWorker(relationData) {
  // const state = yield select();
  // const programEncounter = state.dataEntry.programEncounterReducer.programEncounter;
  // let resource = programEncounter;
  yield call(api.saveRelationShip, relationData);
  // yield put(saveProgramEncounterComplete());
}

export function* saveRelatioshipWatcher() {
  yield takeLatest(types.SAVE_RELATION, saveRelatioshipWorker);
}

export function* removeRelatioshipWorker(relationData) {
  // const state = yield select();
  // const programEncounter = state.dataEntry.programEncounterReducer.programEncounter;
  // let resource = programEncounter;
  yield call(api.removeRelationShip, relationData);
  // yield put(saveProgramEncounterComplete());
}

export function* removeRelatioshipWatcher() {
  yield takeLatest(types.REMOVE_RELATION, removeRelatioshipWorker);
}

export function* relationshipFetchWorker() {
  const relations = yield call(api.fetchRelations);
  yield put.resolve(setLoad(false));
  yield put(setRelations(relations));
  yield put.resolve(setLoad(true));
}
