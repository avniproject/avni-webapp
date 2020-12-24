import { all, call, fork, put, select, takeLatest } from "redux-saga/effects";
import { types, setSubjectProfile, setTabsStatus } from "../reducers/subjectDashboardReducer";
import { mapProfile } from "../../common/subjectModelMapper";
import api from "../api";
import { setLoad } from "../reducers/loadReducer";
import { selectSubjectProfile, selectOperationalModules } from "./selectors";
import { getRegistrationForm, setRegistrationForm } from "../reducers/registrationReducer";
import { filter, isEmpty, map, includes } from "lodash";

export default function*() {
  yield all([subjectProfileFetchWatcher, voidSubjectWatcher, unVoidSubjectWatcher].map(fork));
}

export function* subjectProfileFetchWatcher() {
  yield takeLatest(types.GET_SUBJECT_PROFILE, subjectProfileFetchWorker);
}

export function* subjectProfileFetchWorker({ subjectUUID }) {
  yield put.resolve(setLoad(false));
  yield put.resolve(setRegistrationForm());
  yield put.resolve(setSubjectProfile());
  const subjectProfileJson = yield call(api.fetchSubjectProfile, subjectUUID);
  const subjectProfile = mapProfile(subjectProfileJson);
  const subjectType = subjectProfile.subjectType;
  const operationalModules = yield select(selectOperationalModules);
  const programUUIDs = map(operationalModules.programs, ({ uuid }) => uuid);
  const encounterTypeUUIDs = map(operationalModules.encounterTypes, ({ uuid }) => uuid);
  const showProgramTab =
    filter(
      operationalModules.formMappings,
      ({ subjectTypeUUID, programUUID }) =>
        subjectTypeUUID === subjectType.uuid &&
        !isEmpty(programUUID) &&
        includes(programUUIDs, programUUID)
    ).length > 0;
  const showGeneralTab =
    filter(
      operationalModules.formMappings,
      ({ subjectTypeUUID, formType, encounterTypeUUID }) =>
        subjectTypeUUID === subjectType.uuid &&
        formType === "Encounter" &&
        includes(encounterTypeUUIDs, encounterTypeUUID)
    ).length > 0;
  const showRelatives = filter(operationalModules.relations).length > 0;
  const defaultTabIndex = showGeneralTab && !showProgramTab ? 1 : 0;
  const registrationTabIndex = showProgramTab ? 1 : 0;
  const generalTabIndex = showProgramTab ? 2 : 1;
  yield put(
    setTabsStatus({
      showProgramTab,
      showGeneralTab,
      showRelatives,
      defaultTabIndex,
      registrationTabIndex,
      generalTabIndex
    })
  );
  yield put.resolve(getRegistrationForm(subjectProfile.subjectType.name));
  yield put(setSubjectProfile(subjectProfile));
  yield put.resolve(setLoad(true));
}

export function* voidSubjectWatcher() {
  yield takeLatest(types.VOID_SUBJECT, voidUnVoidSubject);
}

export function* voidUnVoidSubject({ voided }) {
  yield put.resolve(setLoad(false));
  const subject = yield select(selectSubjectProfile);
  subject.voided = voided;
  const resource = subject.toResource;
  yield call(api.saveSubject, resource);
  yield put(setSubjectProfile(subject));
  yield put.resolve(setLoad(true));
}

export function* unVoidSubjectWatcher() {
  yield takeLatest(types.UN_VOID_SUBJECT, voidUnVoidSubject);
}
