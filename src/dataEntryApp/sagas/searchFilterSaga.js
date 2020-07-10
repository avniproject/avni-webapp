import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import { types, setSearchFilters } from "../reducers/searchFilterReducer";
import api from "../api";
import { setLoad } from "../reducers/loadReducer";

export default function*() {
  yield all([searchFilterFetchWatcher].map(fork));
}

export function* searchFilterFetchWatcher() {
  yield takeLatest(types.GET_SEARCHFILTER, searchFilterFetchWorker);
}

export function* searchFilterFetchWorker({ searchData }) {
  const searchFilters = yield call(api.searchResult, searchData);
  console.log("Search Data" + searchFilters);
  yield put.resolve(setLoad(false));
  yield put(setSearchFilters(searchFilters));
  yield put.resolve(setLoad(true));
}
