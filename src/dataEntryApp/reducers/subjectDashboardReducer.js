const prefix = "app/dataEntry/reducer/subjectProfile/";

export const types = {
  GET_SUBJECT_PROFILE: `${prefix}GET_SUBJECT_PROFILE`,
  SET_SUBJECT_PROFILE: `${prefix}SET_SUBJECT_PROFILE`
};

export const getSubjectProfile = subjectUUID => ({
  type: types.GET_SUBJECT_PROFILE,
  subjectUUID
});

export const setSubjectProfile = subjectProfile => ({
  type: types.SET_SUBJECT_PROFILE,
  subjectProfile
});

export default function(state = {}, action) {
  switch (action.type) {
    case types.SET_SUBJECT_PROFILE: {
      return {
        ...state,
        subjectProfile: action.subjectProfile
      };
    }
    default:
      return state;
  }
}
