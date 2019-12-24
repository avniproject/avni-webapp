import referenceDataSaga from "./referenceDataSaga";
import subjectSaga from "./subjectSaga";
import { all, fork } from "redux-saga/effects";
import subjectDashboardSaga from "./subjectDashboardSaga";
import generealSubjectDashboardSaga from "./generalSubjectDashboardSaga";

export default function* rootSaga() {
  yield all(
    [referenceDataSaga, subjectSaga, subjectDashboardSaga, generealSubjectDashboardSaga].map(fork)
  );
}
