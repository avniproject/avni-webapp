const prefix = "app/dataEntry/reducer/subjectGeneral/";

export const types = {
  GET_SUBJECT_GENERAL: `${prefix}GET_SUBJECT_GENERAL`,
  SET_SUBJECT_GENERAL: `${prefix}SET_SUBJECT_GENERAL`
};

export const getSubjectGeneral = subjectGeneralUUID => ({
  type: types.GET_SUBJECT_GENERAL,
  subjectGeneralUUID
});

export const setSubjectGeneral = subjectGeneral => ({
  type: types.SET_SUBJECT_GENERAL,
  subjectGeneral
});

export default function(state = {}, action) {
  console.log("action.type");
  switch (action.type) {
    case types.SET_SUBJECT_GENERAL: {
      return {
        ...state,
        subjectGeneral: action.subjectGeneral
      };
    }
    default:
      return state;
  }
}
