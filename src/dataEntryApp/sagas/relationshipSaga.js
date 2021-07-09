import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import { types, setRelationshipTypes } from "../reducers/relationshipReducer";
import api from "../api";

export default function*() {
  yield all([relationshipTypeWatcher, saveRelatioshipWatcher, removeRelatioshipWatcher].map(fork));
}

export function* relationshipTypeWatcher() {
  yield takeLatest(types.GET_RELATIONSHIP_TYPES, relationshipTypeWorker);
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

export function* relationshipTypeWorker() {
  const relationshipTypes = yield call(api.fetchRelationshipTypes);
  yield put(setRelationshipTypes(relationshipTypes));
}
