import referenceDataSaga from "./referenceDataSaga";
import subjectSaga from "./subjectSaga";
import { all, fork } from "redux-saga/effects";

export default function* rootSaga() {
  yield all([fork(referenceDataSaga), fork(subjectSaga)]);
}
