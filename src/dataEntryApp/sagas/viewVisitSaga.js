import { all, call, fork, put, takeLatest, select } from "redux-saga/effects";
import { types, setEncounter } from "../reducers/viewVisitReducer";
import { mapEncounter, mapProfile, mapProgramEncounter } from "../../common/subjectModelMapper";
import { setSubjectProfile } from "../reducers/subjectDashboardReducer";
import api from "../api";
import { selectFormMappingForEncounter } from "dataEntryApp/sagas/encounterSelector";
import { mapForm } from "common/adapters";
import { setForm } from "dataEntryApp/reducers/viewVisitReducer";
import { selectFormMappingForProgramEncounter } from "dataEntryApp/sagas/programEncounterSelector";

export default function*() {
  yield all([programEncounterFetchWatcher, encounterFetchWatcher].map(fork));
}

export function* programEncounterFetchWatcher() {
  yield takeLatest(types.GET_PROGRAM_ENCOUNTER, programEncounterFetchWorker);
}

export function* programEncounterFetchWorker({ encounterUuid }) {
  yield put(setEncounter());

  const programEncounterJson = yield call(api.fetchProgramEncounter, encounterUuid);
  const programEncounter = mapProgramEncounter(programEncounterJson);
  const subjectProfileJson = yield call(api.fetchSubjectProfile, programEncounterJson.subjectUUID);
  const subjectProfile = mapProfile(subjectProfileJson);
  const programEnrolmentJson = yield call(
    api.fetchProgramEnrolments,
    programEncounterJson.enrolmentUUID
  );

  const formMapping = yield select(
    selectFormMappingForProgramEncounter(
      programEncounter.encounterType.uuid,
      programEnrolmentJson.programUuid,
      subjectProfileJson.subjectType.uuid
    )
  );
  const programEncounterFormJson = yield call(api.fetchForm, formMapping.formUUID);
  const programEncounterForm = mapForm(programEncounterFormJson);

  yield put(setSubjectProfile(subjectProfile));
  yield put(setEncounter(programEncounter));
  yield put(setForm(programEncounterForm));
}

export function* encounterFetchWatcher() {
  yield takeLatest(types.GET_ENCOUNTER, encounterFetchWorker);
}

export function* encounterFetchWorker({ encounterUuid }) {
  yield put(setEncounter());

  const encounterJson = yield call(api.fetchEncounter, encounterUuid);
  const encounter = mapEncounter(encounterJson);
  const subjectProfileJson = yield call(api.fetchSubjectProfile, encounterJson.subjectUUID);
  const subjectProfile = mapProfile(subjectProfileJson);

  const formMapping = yield select(
    selectFormMappingForEncounter(encounter.encounterType.uuid, subjectProfileJson.subjectType.uuid)
  );
  const encounterFormJson = yield call(api.fetchForm, formMapping.formUUID);
  const encounterForm = mapForm(encounterFormJson);

  yield put(setSubjectProfile(subjectProfile));
  yield put(setEncounter(encounter));
  yield put(setForm(encounterForm));
}
