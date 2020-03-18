import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import api from "./api";
import { setGroups, setGroupDetails, types } from "./reducers";

export function* getGroupsWatcher() {
  yield takeLatest(types.GET_GROUPS, getGroupsWorker);
}

export function* getGroupDetailsWatcher() {
  yield takeLatest(types.GET_GROUP_DETAILS, getGroupDetailsWorker);
}

export function* getGroupsWorker() {
  const valueFromApi = yield call(api.fetchAllGroups);
  yield put(setGroups(valueFromApi));
}

export function* getGroupDetailsWorker(params) {
  const valueFromApi = yield call(api.fetchGroupDetails, params.param);
  yield put(setGroupDetails(valueFromApi));
}

export function* createGroupWatcher() {
  yield takeLatest(types.CREATE_GROUP, createGroupWorker);
}

export function* createGroupWorker() {}

export default function* main() {
  yield all([getGroupsWatcher, getGroupDetailsWatcher].map(fork));
}
