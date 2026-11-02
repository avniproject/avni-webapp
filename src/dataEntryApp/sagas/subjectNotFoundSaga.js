import { call, put } from "redux-saga/effects";
import { get } from "lodash";
import { setSubjectNotFound } from "../reducers/subjectDashboardReducer";
import { setLoad } from "../reducers/loadReducer";

export const isNotFound = (error) => get(error, "status") === 404;

export function* callOrMarkSubjectNotFound(fn, subjectUuid) {
  yield put.resolve(setSubjectNotFound(null));
  try {
    return yield call(fn, subjectUuid);
  } catch (error) {
    if (!isNotFound(error)) throw error;
    yield put.resolve(setSubjectNotFound(subjectUuid));
    yield put.resolve(setLoad(true));
    return null;
  }
}
