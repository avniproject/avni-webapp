import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import { removeRelationshipFailed, saveRelationshipFailed, setRelationshipTypes, types } from "../reducers/relationshipReducer";
import api from "../api";
import { getAPIErrorMessage } from "./sagaUtils";

export default function* () {
  yield all([relationshipTypeWatcher, saveRelatioshipWatcher, removeRelatioshipWatcher].map(fork));
}

export function* relationshipTypeWatcher() {
  yield takeLatest(types.GET_RELATIONSHIP_TYPES, relationshipTypeWorker);
}

export function* saveRelatioshipWorker({ relationData }) {
  try {
    yield call(api.saveRelationShip, relationData);
  } catch (e) {
    yield put(saveRelationshipFailed(getAPIErrorMessage(e)));
  }
}

export function* saveRelatioshipWatcher() {
  yield takeLatest(types.SAVE_RELATION, saveRelatioshipWorker);
}

export function* removeRelatioshipWorker(RelationId) {
  try {
    yield call(api.removeRelationShip, RelationId.relationId);
  } catch (e) {
    yield put(removeRelationshipFailed(getAPIErrorMessage(e)));
  }
}

export function* removeRelatioshipWatcher() {
  yield takeLatest(types.REMOVE_RELATION, removeRelatioshipWorker);
}

export function* relationshipTypeWorker() {
  const relationshipTypes = yield call(api.fetchRelationshipTypes);
  yield put(setRelationshipTypes(relationshipTypes));
}
