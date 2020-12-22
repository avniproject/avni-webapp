import referenceDataSaga from "./referenceDataSaga";
import subjectSaga from "./subjectSaga";
import { all, fork } from "redux-saga/effects";
import subjectDashboardSaga from "./subjectDashboardSaga";
import generalSubjectDashboardSaga from "./generalSubjectDashboardSaga";
import programSubjectDashboardSaga from "./programSubjectDashboardSaga";
import programEncounterSaga from "./programEncounterSaga";
import encounterSaga from "./encounterSaga";
import { saveUserInfoWatcher } from "rootApp/saga";
import programSaga from "./programSaga";
import viewVisitSaga from "./viewVisitSaga";
import completedVisitSaga from "./completedVisitSaga";
import relationshipSaga from "./relationshipSaga";

export default function* rootSaga() {
  yield all(
    [
      referenceDataSaga,
      subjectSaga,
      subjectDashboardSaga,
      generalSubjectDashboardSaga,
      programSubjectDashboardSaga,
      saveUserInfoWatcher,
      programSaga,
      viewVisitSaga,
      completedVisitSaga,
      programEncounterSaga,
      relationshipSaga,
      encounterSaga
      // translationApiSaga
    ].map(fork)
  );
}
