import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import { types, setRelations } from "../reducers/relationshipReducer";
import api from "../api";
import { setLoad } from "../reducers/loadReducer";

export default function*() {
  yield all([relationshipFetchWatcher, saveRelatioshipWatcher, removeRelatioshipWatcher].map(fork));
}

export function* relationshipFetchWatcher() {
  yield takeLatest(types.GET_RELATION, relationshipFetchWorker);
}

export function* saveRelatioshipWorker({ relationData }) {
  yield call(api.saveRelationShip, relationData);
}

export function* saveRelatioshipWatcher() {
  yield takeLatest(types.SAVE_RELATION, saveRelatioshipWorker);
}

export function* removeRelatioshipWorker(RelationId) {
  yield call(api.removeRelationShip, RelationId.relationId);
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
