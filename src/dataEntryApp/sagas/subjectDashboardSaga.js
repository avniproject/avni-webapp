import { all, call, fork, put, select, takeLatest } from "redux-saga/effects";
import {
  types,
  setSubjectProfile,
  setTabsStatus,
  setGroupMembers,
  setVoidServerError,
  setSubjectDashboardLoaded
} from "../reducers/subjectDashboardReducer";
import {
  mapProfile,
  mapGroupMembers,
  mapProgram,
  mapGeneral
} from "../../common/subjectModelMapper";
import api from "../api";
import commonApi from "../../common/service";
import { setLoad } from "../reducers/loadReducer";
import { selectSubjectProfile, selectOperationalModules } from "./selectors";
import {
  getRegistrationForm,
  selectRegistrationForm,
  setRegistrationForm
} from "../reducers/registrationReducer";
import { filter, isEmpty, map, includes, get } from "lodash";
import { setSubjectProgram } from "../reducers/programSubjectDashboardReducer";
import { setSubjectGeneral } from "../reducers/generalSubjectDashboardReducer";
import { setPrograms } from "../reducers/programReducer";
import { subjectGeneralFetchWorker } from "./generalSubjectDashboardSaga";
import { subjectProgramFetchWorker } from "./programSubjectDashboardSaga";
import { getMsgsNotYetSent, getMsgsSent } from "../reducers/messagesReducer";

export default function*() {
  yield all(
    [
      subjectProfileFetchWatcher,
      voidSubjectWatcher,
      unVoidSubjectWatcher,
      fetchGroupMembersWatcher,
      voidProgramEnrolmentWatcher,
      voidProgramEncounterWatcher,
      voidGeneralEncounterWatcher,
      loadSubjectDashboardWatcher
    ].map(fork)
  );
}

export function* loadSubjectDashboardWatcher() {
  yield takeLatest(types.LOAD_SUBJECT_DASHBOARD, loadSubjectDashboardWorker);
}

export function* loadSubjectDashboardWorker({ subjectUUID }) {
  yield put.resolve(setSubjectDashboardLoaded(false));
  yield call(subjectProfileFetchWorker, { subjectUUID });
  yield call(subjectGeneralFetchWorker, { subjectGeneralUUID: subjectUUID });
  yield call(subjectProgramFetchWorker, { subjectProgramUUID: subjectUUID });
  yield put.resolve(setSubjectDashboardLoaded(true));
}

export function* subjectProfileFetchWatcher() {
  yield takeLatest(types.GET_SUBJECT_PROFILE, subjectProfileFetchWorker);
}

export function* subjectProfileFetchWorker({ subjectUUID }) {
  yield put.resolve(setLoad(false));
  yield put.resolve(setRegistrationForm());
  yield put.resolve(setSubjectProfile());
  const organisationConfigs = yield call(commonApi.fetchOrganisationConfigs);
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
  const hasAnyGeneralEncounters =
    filter(
      operationalModules.formMappings,
      ({ subjectTypeUUID, formType, encounterTypeUUID }) =>
        subjectTypeUUID === subjectType.uuid &&
        formType === "Encounter" &&
        includes(encounterTypeUUIDs, encounterTypeUUID)
    ).length > 0;
  const showGeneralTab = showProgramTab && hasAnyGeneralEncounters;
  const displayGeneralInfoInProfileTab = hasAnyGeneralEncounters && !showGeneralTab;
  const showRelatives = filter(operationalModules.relations).length > 0;
  const showGroupMembers = subjectType.isGroup();
  const defaultTabIndex = showGeneralTab && !showProgramTab ? 1 : 0;
  const registrationTabIndex = showProgramTab ? 1 : 0;
  const generalTabIndex = showProgramTab ? 2 : 1;
  const hideDOB = get(organisationConfigs, "organisationConfig.hideDateOfBirth", false);
  const showMessagesTab = get(organisationConfigs, "organisationConfig.enableMessaging", false);
  if (showMessagesTab) {
    yield put(getMsgsSent(subjectProfileJson.id));
    yield put(getMsgsNotYetSent(subjectProfileJson.id));
  }
  yield put(
    setTabsStatus({
      showProgramTab,
      showGeneralTab,
      showRelatives,
      defaultTabIndex,
      registrationTabIndex,
      generalTabIndex,
      showGroupMembers,
      hideDOB,
      showMessagesTab,
      displayGeneralInfoInProfileTab
    })
  );
  yield put.resolve(getRegistrationForm(subjectProfile.subjectType.name));
  const registrationForm = yield select(selectRegistrationForm);
  yield put(setRegistrationForm(registrationForm));
  yield put(setSubjectProfile(subjectProfile));
  yield put.resolve(setLoad(true));
}

export function* voidSubjectWatcher() {
  yield takeLatest(types.VOID_SUBJECT, voidSubject);
}

export function* voidSubject() {
  yield put.resolve(setLoad(false));
  const subject = yield select(selectSubjectProfile);
  const [response, error] = yield call(api.voidSubject, subject.uuid);
  if (!response && error) {
    yield put(setVoidServerError(error));
  } else {
    subject.voided = response.data.voided;
    yield put(setSubjectProfile(subject));
  }
  yield put.resolve(setLoad(true));
}

export function* unVoidSubject() {
  yield put.resolve(setLoad(false));
  const subject = yield select(selectSubjectProfile);
  subject.voided = false;
  const resource = subject.toResource;
  yield call(api.saveSubject, resource);
  yield put(setSubjectProfile(subject));
  yield put.resolve(setLoad(true));
}

export function* unVoidSubjectWatcher() {
  yield takeLatest(types.UN_VOID_SUBJECT, unVoidSubject);
}

export function* fetchGroupMembersWatcher() {
  yield takeLatest(types.GET_GROUP_MEMBERS, fetchGroupMembersWorker);
}
export function* fetchGroupMembersWorker({ groupUUID }) {
  yield put.resolve(setLoad(false));
  yield put.resolve(setGroupMembers());
  const groupMembersJson = yield call(api.fetchGroupMembers, groupUUID);
  const groupMembers = mapGroupMembers(groupMembersJson);
  yield put(setGroupMembers(groupMembers));
  yield put.resolve(setLoad(true));
}

export function* voidProgramEnrolmentWatcher() {
  yield takeLatest(types.VOID_PROGRAM_ENROLMENT, voidProgramEnrolmentWorker);
}

export function* voidProgramEnrolmentWorker({ uuid }) {
  yield put.resolve(setLoad(false));
  const [response, error] = yield call(api.voidProgramEnrolment, uuid);
  if (!response && error) {
    yield put(setVoidServerError(error));
  } else {
    const subject = yield select(selectSubjectProfile);
    const subjectProgram = yield call(api.fetchSubjectProgram, subject.uuid);
    yield put(setSubjectProgram(mapProgram(subjectProgram)));
    const programs = yield call(api.fetchPrograms, subject.uuid);
    yield put(setPrograms(programs));
  }
  yield put.resolve(setLoad(true));
}

export function* voidProgramEncounterWatcher() {
  yield takeLatest(types.VOID_PROGRAM_ENCOUNTER, voidProgramEncounterWorker);
}

export function* voidProgramEncounterWorker({ uuid }) {
  yield put.resolve(setLoad(false));
  const [response, error] = yield call(api.voidProgramEncounter, uuid);
  if (!response && error) {
    yield put(setVoidServerError(error));
  } else {
    const subject = yield select(selectSubjectProfile);
    const subjectProgram = yield call(api.fetchSubjectProgram, subject.uuid);
    yield put(setSubjectProgram(mapProgram(subjectProgram)));
  }
  yield put.resolve(setLoad(true));
}

export function* voidGeneralEncounterWatcher() {
  yield takeLatest(types.VOID_GENERAL_ENCOUNTER, voidGeneralEncounterWorker);
}

export function* voidGeneralEncounterWorker({ uuid }) {
  yield put.resolve(setLoad(false));
  const [response, error] = yield call(api.voidEncounter, uuid);
  if (!response && error) {
    yield put(setVoidServerError(error));
  } else {
    const subject = yield select(selectSubjectProfile);
    const subjectGeneral = yield call(api.fetchSubjectGeneral, subject.uuid);
    yield put(setSubjectGeneral(mapGeneral(subjectGeneral)));
  }
  yield put.resolve(setLoad(true));
}
