import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import { types, setCompletedVisit, setVisitTypes } from "../reducers/completedVisitReducer";
import { mapViewVisit } from "../../common/subjectModelMapper";

import api from "../api";

export default function*() {
  yield all([completedVisitFetchWatcher, visitTypesFetchWatcher].map(fork));
}

export function* completedVisitFetchWatcher() {
  yield takeLatest(types.GET_COMPLETEDVISIT, completedVisitFetchWorker);
}

export function* completedVisitFetchWorker({ completedVisitUuid }) {
  const completedVisit = yield call(api.fetchcompletedVisit, completedVisitUuid);
  // console.log("################ completed"+completedVisit);
  //  const unique = [...new Set(viewVisit.content.map(item => item.encounterType.name))];
  //  console.log("##########"+ JSON.stringify(unique));
  yield put(setCompletedVisit(completedVisit));
}

export function* visitTypesFetchWatcher() {
  yield takeLatest(types.GET_VISITTYPES, visitTypesFetchWorker);
}

export function* visitTypesFetchWorker({ visitTypesUuid }) {
  const visitTypes = yield call(api.fetchVisitTypes, visitTypesUuid);
  yield put(setVisitTypes(visitTypes));
}
