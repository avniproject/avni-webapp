const prefix = "app/dataEntry/reducer/subjectProfile/";

export const types = {
  GET_SUBJECT_PROFILE: `${prefix}GET_SUBJECT_PROFILE`,
  SET_SUBJECT_PROFILE: `${prefix}SET_SUBJECT_PROFILE`,
  GET_PROGRAMS: `${prefix}GET_PROGRAMS`,
  SET_PROGRAMS: `${prefix}SET_PROGRAMS`,
  VOID_SUBJECT: `${prefix}VOID_SUBJECT`,
  UN_VOID_SUBJECT: `${prefix}UN_VOID_SUBJECT`
};

export const getSubjectProfile = subjectUUID => ({
  type: types.GET_SUBJECT_PROFILE,
  subjectUUID
});

export const setSubjectProfile = subjectProfile => ({
  type: types.SET_SUBJECT_PROFILE,
  subjectProfile
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

export default function(state = {}, action) {
  switch (action.type) {
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
    default:
      return state;
  }
}
