import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import api from "./api";
import {
  setGroups,
  setGroupUsers,
  setAllUsers,
  setGroupPrivilegeList,
  types,
  setGroupDashboards,
  setAllDashboards
} from "./reducers";

export function* getGroupsWatcher() {
  yield takeLatest(types.GET_GROUPS, getGroupsWorker);
}

export function* getGroupUsersWatcher() {
  yield takeLatest(types.GET_GROUP_USERS, getGroupUsersWorker);
}

export function* getAllUsersWatcher() {
  yield takeLatest(types.GET_ALL_USERS, getAllUsersWorker);
}

export function* getGroupDashboardsWatcher() {
  yield takeLatest(types.GET_GROUP_DASHBOARDS, getGroupDashboardsWorker);
}

export function* getAllDashboardsWatcher() {
  yield takeLatest(types.GET_ALL_DASHBOARDS, getAllDashboardsWorker);
}

export function* getGroupPrivilegeListWatcher() {
  yield takeLatest(types.GET_GROUP_PRIVILEGE_LIST, getGroupPrivilegeListWorker);
}

export function* getGroupsWorker() {
  const valueFromApi = yield call(api.fetchAllGroups);
  yield put(setGroups(valueFromApi));
}

export function* getGroupUsersWorker(params) {
  const valueFromApi = yield call(api.fetchGroupUsers, params.param);
  yield put(setGroupUsers(valueFromApi));
}

export function* getAllUsersWorker() {
  const valueFromApi = yield call(api.fetchAllUsers);
  yield put(setAllUsers(valueFromApi));
}

export function* getGroupDashboardsWorker(params) {
  const valueFromApi = yield call(api.fetchGroupDashboards, params.groupId);
  yield put(setGroupDashboards(valueFromApi));
}

export function* getAllDashboardsWorker() {
  const valueFromApi = yield call(api.fetchAllDashboards);
  yield put(setAllDashboards(valueFromApi));
}

export function* getGroupPrivilegeListWorker(params) {
  const groupPrivileges = yield call(api.fetchGroupPrivileges, params.param);
  yield put(setGroupPrivilegeList(groupPrivileges));
}

export function* createGroupWatcher() {
  yield takeLatest(types.CREATE_GROUP, createGroupWorker);
}

export function* createGroupWorker() {}

export default function* main() {
  yield all(
    [
      getGroupsWatcher,
      getGroupUsersWatcher,
      getAllUsersWatcher,
      getGroupDashboardsWatcher,
      getAllDashboardsWatcher,
      getGroupPrivilegeListWatcher
    ].map(fork)
  );
}
