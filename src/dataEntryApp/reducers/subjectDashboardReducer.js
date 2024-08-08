const prefix = "app/dataEntry/reducer/subjectProfile/";

export const types = {
  GET_SUBJECT_PROFILE: `${prefix}GET_SUBJECT_PROFILE`,
  SET_SUBJECT_PROFILE: `${prefix}SET_SUBJECT_PROFILE`,
  GET_PROGRAMS: `${prefix}GET_PROGRAMS`,
  SET_PROGRAMS: `${prefix}SET_PROGRAMS`,
  VOID_SUBJECT: `${prefix}VOID_SUBJECT`,
  UN_VOID_SUBJECT_FAILED: `${prefix}UN_VOID_SUBJECT_FAILED`,
  UN_VOID_SUBJECT: `${prefix}UN_VOID_SUBJECT`,
  SET_TABS_STATUS: `${prefix}SET_TABS_STATUS`,
  GET_GROUP_MEMBERS: `${prefix}GET_GROUP_MEMBERS`,
  SET_GROUP_MEMBERS: `${prefix}SET_GROUP_MEMBERS`,
  VOID_SERVER_ERROR: `${prefix}VOID_SERVER_ERROR`,
  VOID_PROGRAM_ENROLMENT: `${prefix}VOID_PROGRAM_ENROLMENT`,
  VOID_PROGRAM_ENCOUNTER: `${prefix}VOID_PROGRAM_ENCOUNTER`,
  VOID_GENERAL_ENCOUNTER: `${prefix}VOID_GENERAL_ENCOUNTER`,
  LOAD_SUBJECT_DASHBOARD: `${prefix}LOAD_SUBJECT_DASHBOARD`,
  SET_SUBJECT_DASHBOARD_LOADED: `${prefix}SET_SUBJECT_DASHBOARD_LOADED`
};

export const getSubjectProfile = subjectUUID => ({
  type: types.GET_SUBJECT_PROFILE,
  subjectUUID
});

export const setSubjectProfile = subjectProfile => ({
  type: types.SET_SUBJECT_PROFILE,
  subjectProfile
});

export const unVoidFailed = message => ({
  type: types.UN_VOID_SUBJECT_FAILED,
  unVoidErrorKey: message
});

export const voidSubject = () => ({
  type: types.VOID_SUBJECT,
  voided: true
});

export const unVoidSubject = () => ({
  type: types.UN_VOID_SUBJECT,
  voided: false
});

export const getPrograms = subjectUUID => ({
  type: types.GET_PROGRAMS,
  subjectUUID
});

export const setPrograms = program => ({
  type: types.SET_PROGRAMS,
  program
});

export const setTabsStatus = tabsStatus => ({
  type: types.SET_TABS_STATUS,
  tabsStatus
});

export const getGroupMembers = groupUUID => ({
  type: types.GET_GROUP_MEMBERS,
  groupUUID
});

export const setGroupMembers = groupMembers => ({
  type: types.SET_GROUP_MEMBERS,
  groupMembers
});

export const setVoidServerError = voidError => ({
  type: types.VOID_SERVER_ERROR,
  voidError
});

export const clearVoidServerError = () => ({
  type: types.VOID_SERVER_ERROR
});

export const voidProgramEnrolment = programEnrolmentUUID => ({
  type: types.VOID_PROGRAM_ENROLMENT,
  uuid: programEnrolmentUUID
});

export const voidProgramEncounter = programEncounterUUID => ({
  type: types.VOID_PROGRAM_ENCOUNTER,
  uuid: programEncounterUUID
});

export const voidGeneralEncounter = encounterUUID => ({
  type: types.VOID_GENERAL_ENCOUNTER,
  uuid: encounterUUID
});

export const loadSubjectDashboard = subjectUUID => ({
  type: types.LOAD_SUBJECT_DASHBOARD,
  subjectUUID
});

export const setSubjectDashboardLoaded = loaded => ({
  type: types.SET_SUBJECT_DASHBOARD_LOADED,
  loaded
});

export default function(state = {}, action) {
  switch (action.type) {
    case types.UN_VOID_SUBJECT_FAILED: {
      return {
        ...state,
        unVoidErrorKey: action.unVoidErrorKey
      };
    }
    case types.SET_SUBJECT_PROFILE: {
      return {
        ...state,
        subjectProfile: action.subjectProfile
      };
    }
    case types.SET_PROGRAMS: {
      return {
        ...state,
        programs: action.program
      };
    }
    case types.SET_TABS_STATUS: {
      return {
        ...state,
        tabsStatus: action.tabsStatus
      };
    }
    case types.SET_GROUP_MEMBERS: {
      return {
        ...state,
        groupMembers: action.groupMembers
      };
    }
    case types.VOID_SERVER_ERROR: {
      return {
        ...state,
        voidError: action.voidError
      };
    }
    case types.SET_SUBJECT_DASHBOARD_LOADED: {
      return {
        ...state,
        dashboardLoaded: action.loaded,
        unVoidErrorKey: null
      };
    }
    default:
      return state;
  }
}
