import referenceDataSaga from "./referenceDataSaga";
import subjectSaga from "./subjectSaga";
import { all, fork } from "redux-saga/effects";
import subjectDashboardSaga from "./subjectDashboardSaga";
import generalSubjectDashboardSaga from "./generalSubjectDashboardSaga";
import programSubjectDashboardSaga from "./programSubjectDashboardSaga";
import { saveUserInfoWatcher } from "rootApp/saga";
// import translationApiSaga from "../sagas/TranslationSaga"

export default function* rootSaga() {
  yield all(
    [
      referenceDataSaga,
      subjectSaga,
      subjectDashboardSaga,
      generalSubjectDashboardSaga,
      programSubjectDashboardSaga,
      saveUserInfoWatcher
      // translationApiSaga
    ].map(fork)
  );
}
