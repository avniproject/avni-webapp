import referenceDataSaga from "./referenceDataSaga";
import subjectSaga from "./subjectSaga";
import { all, fork } from "redux-saga/effects";
import subjectDashboardSaga from "./subjectDashboardSaga";

export default function* rootSaga() {
  yield all([referenceDataSaga, subjectSaga, subjectDashboardSaga].map(fork));
}
